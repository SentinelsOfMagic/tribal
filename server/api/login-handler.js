// Adapted from spotify web-api-auth-example

const Promise = require('bluebird');
const querystring = require('querystring');
const request = Promise.promisifyAll(require('request'));
const db = require('../database');
const Spotify = require('./api-calls');


let clientId = process.env.SPOTIFY_CLIENT_ID;
let clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
let redirectURI = process.env.SPOTIFY_REDIRECT_URI;
let stateKey = 'spotify_auth_state';
// AUTHORIZATION PERMISSIONS: Add needed permissions
let scope = 'user-read-private user-read-email playlist-modify-private playlist-read-private user-modify-playback-state';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
let generateRandomString = (length) => {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let login = (req, res) => {

  let state = generateRandomString(16);
  res.cookie(stateKey, state);



  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      'response_type': 'code',
      'client_id': clientId,
      'scope': scope,
      'redirect_uri': redirectURI,
      'state': state
    }));
};

let callback = (req, res) => {

  // your application requests refresh and access tokens
  // after checking the state parameter

  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        'code': code,
        'redirect_uri': redirectURI,
        'grant_type': 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
      },
      json: true
    };

    request.postAsync(authOptions)
    .then((response) => {
      let body = response.body;

      if (response.statusCode === 200) {

        let accessToken = body.access_token;
        let refreshToken = body.refresh_token;

        let options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + accessToken },
          json: true
        };

        // Get user id, pass on tokens
        return Promise.all([request.getAsync(options), accessToken, refreshToken]);
      } else {
        throw response.statusCode;
      }
    })
    // create account in db, create playlist on spotify
    .then(([res, accessToken, refreshToken]) => {
      let body = res.body;
      return db.insertAccount(body.id, accessToken, refreshToken);
    }).
    then((account) => {
      let playlistName = generateRandomString(5);
      return Spotify.createPlaylist(account.accessToken, account.accountId, playlistName);
    })
    .then((spotifyPlaylist) => {
      let body = spotifyPlaylist.body;
      return db.insertPlaylist(body.id, body.owner.id);
    })
    .then((dbPlaylist) => {
      res.redirect(`/?playlist=${dbPlaylist}`);
    })
    .catch((err) => {
      console.log('Login handler err', err);
      res.redirect('/#' +
          querystring.stringify({
            error: err
          }));
    });
  }
};

let refresh = (req, res) => {

  // requesting access token from refresh token
  let refreshToken = req.query.refresh_token;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')) },
    form: {
      'grant_type': 'refresh_token',
      'refresh_token': refreshToken
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      let accessToken = body.access_token;
      res.send({
        'access_token': accessToken
      });
    }
  });
};

module.exports.login = login;
module.exports.callback = callback;
module.exports.refreshToken = refresh;
