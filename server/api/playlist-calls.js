const SpotifyWebApi = require('spotify-web-api-node');

let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
let redirectURI = process.env.SPOTIFY_REDIRECT_URI;

let spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectURI
});

spotifyApi.setAccessToken(body.access_token);
// use the access token to access the Spotify Web API

// .then((body) => {
//   console.log(body.id);
//   spotifyApi.createPlaylist(body.id, 'test1', { 'public' : false })
//   .then((data) => {
//     console.log(data);
//   });
// });
