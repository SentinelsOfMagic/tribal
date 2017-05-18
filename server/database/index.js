const mongoose = require( './init' );

// Users
const AccountSchema = mongoose.Schema({
  accountId: String,
  accessToken: String,
  refreshToken: String
});

const Account = mongoose.model('Account', AccountSchema);

const createAccount = (accountId, accessToken, refreshToken) => {
  var newAccount = new Account({
    accountId: accountId,
    accessToken: accessToken,
    refreshToken: refreshToken
  });

  newAccount.save()
  .then(() => {
    console.log('new account saved to db successfully');
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

// // getAllPlayLists retrieves all playlists
// const getAllPlaylists = function() {
//   return Playlist.find({});
// };

// getSinglePlayList retrieves a single PlayList associated with the given id or name
// returns promise, resolves with playlist document
const getSinglePlaylist = function( idOrName ) {
  if ( /^[0-9a-f]{24}$/.test(idOrName) ) {
    return Playlist.findById( idOrName );
  } else {
    return Playlist.findOne({ name: idOrName });
  }
};

// create a new playlist, 'name', populated with no songs
// return promise, resolves with new document
const createPlaylist = function( name ) {
  return Playlist.create({ name: name });
};


// Songs
const SongSchema = mongoose.Schema({
  spotifyId: String,
  upvotes: Number,
  downvotes: Number,
  net: Number,
  index: Number,
  playlistId: Number
});

const Song = mongoose.model('Song', SongSchema);

const insertSong = function() {

};

// insertSong inserts a song(s) into the db
// const insertSong = function(id, song) {
//   return getSinglePlaylist( id )
//     .then(playlist => {
//       playlist.songs.push(song);
//       return playlist.save();
//     });
// };

module.exports.mongoose = mongoose;
module.exports.createAccount = createAccount;
module.exports.getAllPlaylists = getAllPlaylists;
module.exports.getSinglePlaylist = getSinglePlaylist;
module.exports.insertSong = insertSong;
module.exports.createPlaylist = createPlaylist;
