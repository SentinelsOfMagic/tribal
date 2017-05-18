const Spotify = require('./init.js');

let createPlaylist = (accessToken, account, playlistName) => {
  Spotify.setAccessToken(accessToken);
  return Spotify.createPlaylist(account, playlistName, {
    public: false
  });
};

module.exports.createPlaylist = createPlaylist;
