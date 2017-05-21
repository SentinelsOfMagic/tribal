const SpotifyWebApi = require('spotify-web-api-node');

let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
let redirectURI = process.env.SPOTIFY_REDIRECT_URI;

let spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectURI
});



module.exports = spotifyApi;
