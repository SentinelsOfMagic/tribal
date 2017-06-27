const Spotify = require('./init.js');

let createPlaylist = (accessToken, account, playlistName) => {
  Spotify.setAccessToken(accessToken);
  return Spotify.createPlaylist(account, playlistName, {
    public: false
  });
};


let addSongToPlaylist = (accessToken, accountId, playlistId, songUri) => {

  Spotify.setAccessToken(accessToken);
  return Spotify.addTracksToPlaylist(accountId, playlistId, songUri);
};

let reorderPlaylist = (accessToken, ...args) => {
  Spotify.setAccessToken(accessToken);
  // db logic to get new order
  console.log(...args);
  return Spotify.reorderTracksInPlaylist(...args);
};

let refreshAccessToken = (accessToken, refreshToken) => {
  Spotify.setAccessToken(accessToken);
  Spotify.setRefreshToken(refreshToken);
  return Spotify.refreshAccessToken();
};

let searchTracks = (accessToken, searchString) => {
  Spotify.setAccessToken(accessToken);
  return Spotify.searchTracks(searchString);

};

module.exports.createPlaylist = createPlaylist;
module.exports.addSongToPlaylist = addSongToPlaylist;
module.exports.reorderPlaylist = reorderPlaylist;
module.exports.refreshAccessToken = refreshAccessToken;
module.exports.searchTracks = searchTracks;
