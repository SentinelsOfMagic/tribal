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

const retrieveAccount = (accountId) => {
  return Account.findOne({accountId: accountId});
};


// Playlists
const PlaylistSchema = mongoose.Schema({
  // playlistHash (_id) is auto-generated
  playlistId: {
    type: String,
    unique: true
  },
  accountId: String,
  orderedSongs: [{type: String}]
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

const insertPlaylist = (playlistId, accountId) => {
  return Playlist.create({
    playlistId: playlistId,
    accountId: accountId,
    orderedSongs: []
  })
  .then((playlist) => {
    //console.log('playlist successfully inserted to db:', playlist);
    return playlist._id;
  })
  .catch((err) => {
    console.log('error occurred while inserting new playlist:', err);
  });
};

// DELETE LATER - just dummy data that April is using
// insertPlaylist('6A66KGoajMxC6eE7IgJrE7', '1233151550');

const retrievePlaylist = (playlistHash) => {
  return Playlist.findById(playlistHash);
};

const insertSongToPlaylistOrderedSongs = (playlistHash, songId) => {
  return Playlist.findOneAndUpdate(
    {_id: playlistHash},
    {$push: {orderedSongs: songId}},
    {upsert: true, new: true}
  );
};

// Songs
const SongSchema = mongoose.Schema({
  songId: String,
  songTitle: String,
  songArtist: String,
  upvotes: Number,
  downvotes: Number,
  //net: Number,
  index: Number,
  playlistHash: String
});

SongSchema.virtual('net').get(function() {
  return this.upvotes - this.downvotes;
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
    // net: 0,
    index: 0
  });

  return newSong.save();
};

// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Over You', 'SAFIA', 1);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Twice', 'Catfish and the Bottlemen', 2);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Outcast at Last', 'Sticky Fingers', 3);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Dang! (feat. Anderson .Paak)', 'Mac Miller, Anderson .Paak', 4);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Step up the Morphine', 'DMA\'S', 5);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Sad Songs', 'Sticky Fingers', 6);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Bullshit', 'Dune Rats', 7);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Notion', 'Tash Sultana', 8);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Our Town', 'Sticky Fingers', 9);
// insertSongToPlaylist('591e56f6835cbb2a56f09852', 'asdf', 'Make Them Wheels Roll', 'SAFIA', 10);

const retrieveAllSongsForPlaylist = (playlistHash) => {
  return Song.find({playlistHash: playlistHash});
};


const inputSongUpvote = (playlistHash, songId) => {
  return Song.findOneAndUpdate({playlistHash: playlistHash, songId: songId}, {$inc: {upvotes: 1}})
  .catch((err) => {
    console.log('error occurred while saving upvoted song:', err);
  });
};



const inputSongDownvote = (playlistHash, songId) => {
  return Song.findOneAndUpdate({playlistHash: playlistHash, songId: songId}, {$inc: {downvotes: 1}})
  .catch((err) => {
    console.log('error occurred while finding song to downvote:', err);
  });
};

const updateSongOrderAfterVote = (songId) => {

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
module.exports.retrieveAccount = retrieveAccount;
module.exports.insertPlaylist = insertPlaylist;
module.exports.retrievePlaylist = retrievePlaylist;
module.exports.insertSongToPlaylistOrderedSongs = insertSongToPlaylistOrderedSongs;
module.exports.insertSongToPlaylist = insertSongToPlaylist;
module.exports.retrieveAllSongsForPlaylist = retrieveAllSongsForPlaylist;
module.exports.inputSongUpvote = inputSongUpvote;
module.exports.inputSongDownvote = inputSongDownvote;


// old exports
module.exports.getAllPlaylists = getAllPlaylists;
module.exports.getSinglePlaylist = getSinglePlaylist;
module.exports.insertSong = insertSong;
module.exports.createPlaylist = createPlaylist;
