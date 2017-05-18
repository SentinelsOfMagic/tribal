const SpotifyWebApi = require('spotify-web-api-node');

let spotifyApi = new SpotifyWebApi({
  clientId: clientId,
  clientSecret: clientSecret,
  redirectUri: redirectURI
});

// use the access token to access the Spotify Web API
request.getAsync(options)
.then((res) => {
  return res.body;
})
.then((body) => {
  console.log(body.id);
  spotifyApi.createPlaylist(body.id, 'test1', { 'public' : false })
  .then((data) => {
    console.log(data);
  });
});
