const Spotify = require('./init.js');

let createPlaylist = (accessToken, account, playlistName) => {
  Spotify.setAccessToken(accessToken);
  return Spotify.createPlaylist(account, playlistName, {
    public: false
  });
};


let addSongToPlaylist = (accessToken, accountId, playlistId, songUri) => {

  Spotify.setAccessToken(accessToken);
  return Spotify.addTracksToPlaylist(accountId, playlistId, songUri, positionObj);
};

let reorderPlaylist = (accessToken, accountId, playlistId, songId) => {
  Spotify.setAccessToken(accessToken);
  // db logic to get new order
  Spotify.reorderTracksInPlaylist(accountId, playlistId/*song position, new song position, {options: snapshot_id?}*/);
  return;
};

module.exports.createPlaylist = createPlaylist;
module.exports.addSongToPlaylist = addSongToPlaylist;
