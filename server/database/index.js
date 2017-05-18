const mongoose = require( './init' );

// Users
const AccountSchema = mongoose.Schema({
  accountId: String,
  accessToken: String,
  refreshToken: String
});

const Account = mongoose.model('Account', AccountSchema);

const insertAccount = (accountId, accessToken, refreshToken) => {
  var newAccount = new Account({
    accountId: accountId,
    accessToken: accessToken,
    refreshToken: refreshToken
  });

  newAccount.save()
  .then((account) => {
    console.log('new account successfully saved to db:', account);
  })
  .catch((err) => {
    console.log('error occurred while saving new account to db:', err);
  });
};


// Playlists
const PlaylistSchema = mongoose.Schema({
  // playlistHash (id) is auto-generated
  playlistId: String,
  accountId: String
});

const Playlist = mongoose.model('Playlist', PlaylistSchema);

const insertPlaylist = (playlistId, accountId) => {
  Playlist.create({
    playlistId: playlistId,
    accountId: accountId
  })
  .then((playlist) => {
    console.log('playlist successfully inserted to db:', playlist);
  })
  .catch((err) => {
    console.log('error occurred while inserting new playlist:', err);
  });
};

const retrievePlaylist = (playlistId) => {
  return Playlist.findById(playlistId);
};

// Songs
const SongSchema = mongoose.Schema({
  songId: String,
  upvotes: Number,
  downvotes: Number,
  net: Number,
  index: Number,
  playlistId: String
});

const Song = mongoose.model('Song', SongSchema);

const insertSongToPlaylist = (songId, playlistId) => {
  var newSong = new Song({
    songId: songId,
    upvotes: 0,
    downvotes: 0,
    net: 0,
    index: null,
    playlistId: playlistId
  });

  newSong.save()
  .then((song) => {
    console.log('song successfully inserted to database:', song);
  })
  .catch((err) => {
    console.log('error occurred while inserting song to playlist:', err);
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

// old exports
module.exports.getAllPlaylists = getAllPlaylists;
module.exports.getSinglePlaylist = getSinglePlaylist;
module.exports.insertSong = insertSong;
module.exports.createPlaylist = createPlaylist;
