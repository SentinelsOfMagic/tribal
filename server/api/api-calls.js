const Spotify = require('./init.js');

let createPlayList = (accessToken, account, playlistName) => {
  Spotify.setAccessToken(accessToken);
  return Spotify.createPlaylist(account, playlistName, {

  });
};

module.exports.createPlaylist = createPlaylist;
