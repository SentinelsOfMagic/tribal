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

module.exports.createPlaylist = createPlaylist;
module.exports.addSongToPlaylist = addSongToPlaylist;
