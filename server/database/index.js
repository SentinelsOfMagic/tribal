const mongoose = require( './init' );

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

  // return newAccount.save()
  // .then((account) => {
  //   console.log('new account successfully saved to db:', account);
  //   return account;
  // })
  // .catch((err) => {
  //   console.log('error occurred while saving new account to db:', err);
  // });
};


// Playlists
const PlaylistSchema = mongoose.Schema({
  // playlistHash (_id) is auto-generated
  playlistId: {
    type: String,
    unique: true
  },
  accountId: String
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

const insertPlaylist = (playlistId, accountId) => {
  return Playlist.create({
    playlistId: playlistId,
    accountId: accountId
  })
  .then((playlist) => {
    console.log('playlist successfully inserted to db:', playlist);
    return playlist._id;
  })
  .catch((err) => {
    console.log('error occurred while inserting new playlist:', err);
  });
};

// DELETE LATER - just dummy data that April is using
// insertPlaylist('6A66KGoajMxC6eE7IgJrE7', '1233151550');

const retrievePlaylist = (playlistHash) => {
  return Playlist.find({_id: playlistHash});
};

// Songs
const SongSchema = mongoose.Schema({
  songId: String,
  songTitle: String,
  songArtist: String,
  upvotes: Number,
  downvotes: Number,
  net: Number,
  index: Number,
  playlistHash: String
});

const Song = mongoose.model('Song', SongSchema);

const insertSongToPlaylist = (playlistHash, songId, songTitle, songArtist) => {
  var newSong = new Song({
    playlistHash: playlistHash,
    songId: songId,
    songTitle: songTitle,
    songArtist: songArtist,
    upvotes: 0,
    downvotes: 0,
    net: 0,
    index: null
  });

  return newSong.save()
  .then((song) => {
    console.log('song successfully inserted to database:', song);
  })
  .catch((err) => {
    console.log('error occurred while inserting song to playlist:', err);
  });
};

const retrieveAllSongsForPlaylist = (playlistHash) => {
  return Song.find({playlistHash: playlistHash})
  .then((songs) => {
    console.log('songs for playlist', playlistHash, 'retrieved successfully:', songs);
  })
  .catch((err) => {
    console.log('error occurred while retrieving songs for playlist', playlistHash, ':', err);
  });
};

const inputSongUpvote = (playlistHash, songId) => {
  return Song.find({playlistHash: playlistHash, songId: songId})
  .then((song) => {
    song.upvotes++;
    song.net = song.upvotes - song.downvotes;

    song.save()
    .then((upvotedSong) => {
      console.log('song upvote successfully inserted:', upvotedSong);
    })
    .catch((err) => {
      console.log('error occurred while saving upvoted song:', err);
    });
  })
  .catch((err) => {
    console.log('error occurred while finding song to upvote:', err);
  });
};

const inputSongDownvote = (playlistHash, songId) => {
  return Song.find({playlistHash: playlistHash, songId: songId})
  .then((song) => {
    song.downvotes++;
    song.net = song.upvotes - song.downvotes;

    song.save()
    .then((downvotedSong) => {
      console.log('song downvote successfully inserted:', downvotedSong);
    })
    .catch((err) => {
      console.log('error occurred while saving downvoted song:', err);
    });
  })
  .catch((err) => {
    console.log('error occurred while finding song to downvote:', err);
  });
};



// OLD STUFF

const OldPlayListSchema = mongoose.Schema({
  name: {
    type: String,
  },
  songs: [{
    uri: String
  }]
});

const OldPlayList = mongoose.model('OldPlayList', OldPlayListSchema);

// getAllPlayLists retrieves all playlists
const getAllPlaylists = function() {
  return OldPlayList.find({});
};

// getSinglePlayList retrieves a single PlayList associated with the given id or name
// returns promise, resolves with playlist document
const getSinglePlaylist = function( idOrName ) {
  if ( /^[0-9a-f]{24}$/.test(idOrName) ) {
    return OldPlayList.findById( idOrName );
  } else {
    return OldPlayList.findOne({ name: idOrName });
  }
};

// insertSong inserts a song(s) into the db
const insertSong = function(id, song) {
  return getSinglePlaylist( id )
    .then(playlist => {
      playlist.songs.push(song);
      return playlist.save();
    });
};

// create a new playlist, 'name', populated with no songs
// return promise, resolves with new document
const createPlaylist = function( name ) {
  return OldPlayList.create({ name: name });
};

module.exports.mongoose = mongoose;
module.exports.insertAccount = insertAccount;
module.exports.insertPlaylist = insertPlaylist;
module.exports.retrievePlaylist = retrievePlaylist;
module.exports.insertSongToPlaylist = insertSongToPlaylist;
module.exports.retrieveAllSongsForPlaylist = retrieveAllSongsForPlaylist;
module.exports.inputSongUpvote = inputSongUpvote;
module.exports.inputSongDownvote = inputSongDownvote;


// old exports
module.exports.getAllPlaylists = getAllPlaylists;
module.exports.getSinglePlaylist = getSinglePlaylist;
module.exports.insertSong = insertSong;
module.exports.createPlaylist = createPlaylist;
