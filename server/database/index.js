const mongoose = require( './init' );
const Spotify = require('../api/api-calls.js');

// Users
const AccountSchema = mongoose.Schema({
  accountId: {
    type: String,
    unique: true
  },
  accessToken: String,
  refreshToken: String
});

const Account = mongoose.model('Account', AccountSchema);

const insertAccount = (accountId, accessToken, refreshToken) => {
  return Account.findOneAndUpdate(
    {accountId: accountId},
    {accessToken: accessToken, refreshToken: refreshToken},
    {upsert: true, new: true});
};

const retrieveAccount = (accountId) => {
  return Account.findOne({accountId: accountId});
};

let refreshTokens = () => {
  console.log('refreshing tokens!');
  Account.find().then((accounts) => {
    return Promise.all(accounts.map((account) => {
      return Promise.all([account._id, Spotify.refreshAccessToken(account.accessToken, account.refreshToken)]);
    }));
  })
  .then((pairs) => {
    return Account.collection.bulkWrite(pairs.map((pair) => {
      return {
        'updateOne': {
          'filter': {'_id': pair[0]},
          'update': {'accessToken': pair[1].body['access_token']}
        }};
    }));
  })
  .catch((err) => {
    console.log('error refreshing tokens', err);
  });

};

setInterval(refreshTokens, 1500000);

// Playlists
const PlaylistSchema = mongoose.Schema({
  // playlistHash (_id) is auto-generated
  playlistId: {
    type: String,
    unique: true
  },
  accountId: String,
  orderedSongs: [{type: String}],
  started: Boolean,
  playing: Boolean
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

const insertPlaylist = (playlistId, accountId) => {
  return Playlist.create({
    playlistId: playlistId,
    accountId: accountId,
    orderedSongs: [],
    started: false,
    playing: false
  })
  .then((playlist) => {
    //console.log('playlist successfully inserted to db:', playlist);
    return playlist._id;
  })
  .catch((err) => {
    console.log('error occurred while inserting new playlist:', err);
  });
};

const retrievePlaylist = (playlistHash) => {
  return Playlist.findById(playlistHash);
};

const updatePlaylist = (playlistHash) => {
  return Playlist.findOneAndUpdate({_id: playlistHash}, {started: true, playing: true});
};

const pausePlaylist = (playlistHash) => {
  return Playlist.findOneAndUpdate({_id: playlistHash}, {playing: false});
};

const playPlaylist = (playlistHash) => {
  return Playlist.findOneAndUpdate({_id: playlistHash}, {playing: true});
};

const insertSongToPlaylistOrderedSongs = (playlistHash, songId) => {
  return Playlist.findOneAndUpdate(
    {_id: playlistHash},
    {$push: {orderedSongs: songId}},
    {upsert: true, new: true}
  );
};

// Songs

// TODO: add image url
const SongSchema = mongoose.Schema({
  songId: String,
  songArtist: String,
  songTitle: String,
  imageUrl: String,
  duration: Number,
  upvotes: Number,
  downvotes: Number,
  index: Number,
  playlistHash: String
});

SongSchema.virtual('net').get(function() {
  return this.upvotes - this.downvotes;
});

const Song = mongoose.model('Song', SongSchema);

const insertSongToPlaylist = (playlistHash, songId, songArtist, songTitle, songImageUrl, songDuration) => {
  var newSong = new Song({
    playlistHash: playlistHash,
    songId: songId,
    songArtist: songArtist,
    songTitle: songTitle,
    imageUrl: songImageUrl,
    duration: songDuration,
    upvotes: 0,
    downvotes: 0,
    index: 0
  });

  return newSong.save();
};

const retrieveAllSongsForPlaylist = (playlistHash) => {
  return Song.find({playlistHash: playlistHash});
};

const retrieveSongForPlaylist = (_id, playlistHash) => {
  return Song.find({playlistHash: playlistHash, _id: _id})
  .catch((err)=> {
    console.log('error in retrieving song', err);
  });
};


const inputSongUpvote = (playlistHash, songId) => {

  return Song.findOneAndUpdate({_id: songId}, {$inc: {upvotes: 1}}, {new: true})
  .catch((err) => {
    console.log('error occurred while saving upvoted song:', err);
  });
};



const inputSongDownvote = (playlistHash, songId) => {

  return Song.findOneAndUpdate({_id: songId}, {$inc: {downvotes: 1}}, {new: true})
  .catch((err) => {
    console.log('error occurred while finding song to downvote:', err);
  });
};

// direction is -1 if song was upvoted - move towards head
// recursively adjust index values in database to reflect new vote values
const moveSong = (orderedSongs, movingSong, index, direction) => {

  return Song.findOne({_id: orderedSongs[index + direction]})
  .then((compareSong) => {
    if (compareSong && movingSong.net > compareSong.net && direction === -1) {
      orderedSongs[movingSong.index] = compareSong._id;
      movingSong.index--;
      orderedSongs[movingSong.index] = movingSong._id;
      return Song.findOneAndUpdate({_id: compareSong._id}, {$inc: {index: 1}});
    } else if (compareSong && movingSong.net < compareSong.net && direction === 1) {
      orderedSongs[movingSong.index] = compareSong._id;
      movingSong.index++;
      orderedSongs[movingSong.index] = movingSong._id;
      return Song.findOneAndUpdate({_id: compareSong._id}, {$inc: {index: -1}});
    } else {
      return 0;
    }
  })
  .then((returnCode) => {
    if (returnCode === 0) {
      return [movingSong, orderedSongs];
    } else {
      return moveSong(orderedSongs, movingSong, index + direction, direction);
    }
  });

};

// called after upvote or downvote, logic a bit annoying, might just be a wet statement
const updateSongOrderAfterVote = (songEntry, direction) => {

  return Playlist.findOne({_id: songEntry.playlistHash})
  .then((playlist) => {
    return moveSong(playlist.orderedSongs, songEntry, songEntry.index, direction);
  })
  .then(([movedSong, orderedSongs]) => {
    console.log(movedSong);
    return Promise.all([
      movedSong.index,
      Song.findOneAndUpdate({_id: movedSong._id}, {index: movedSong.index}), // will return old song entry (thus old index)
      Playlist.findOneAndUpdate({_id: movedSong.playlistHash}, {orderedSongs: orderedSongs})
    ]);
  })
  .then(([newIndex, oldSongEntry, oldPlaylistEntry]) => {
    return Promise.all([newIndex, oldSongEntry, retrieveAccount(oldPlaylistEntry.accountId), oldPlaylistEntry.playlistId]);
  })
  .then(([newIndex, oldSongEntry, accountEntry, playlistId]) => {
    return Spotify.reorderPlaylist(accountEntry.accessToken, accountEntry.accountId, playlistId, oldSongEntry.index, newIndex);
  })
  .catch((err) => {
    console.log(err);
    return err;
  });
};

const updateSongIndex = (songId, index) => {
  return Song.findOneAndUpdate({_id: songId}, {index: index});
};

module.exports.mongoose = mongoose;
module.exports.insertAccount = insertAccount;
module.exports.retrieveAccount = retrieveAccount;
module.exports.insertPlaylist = insertPlaylist;
module.exports.retrievePlaylist = retrievePlaylist;
module.exports.updatePlaylist = updatePlaylist;
module.exports.pausePlaylist = pausePlaylist;
module.exports.playPlaylist = playPlaylist;
module.exports.insertSongToPlaylistOrderedSongs = insertSongToPlaylistOrderedSongs;
module.exports.insertSongToPlaylist = insertSongToPlaylist;
module.exports.retrieveAllSongsForPlaylist = retrieveAllSongsForPlaylist;
module.exports.inputSongUpvote = inputSongUpvote;
module.exports.inputSongDownvote = inputSongDownvote;
module.exports.retrieveSongForPlaylist = retrieveSongForPlaylist;
module.exports.updateSongOrderAfterVote = updateSongOrderAfterVote;
module.exports.updateSongIndex = updateSongIndex;


