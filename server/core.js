const express = require('express');
const db = require('./database');
const Promise = require('bluebird');
const request = require('request');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const Login = require('./api/login-handler.js');
const apiCalls = require('./api/api-calls.js');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const SERVER_PORT = process.env.PORT || 4242;

const DATABASE_CONNECTED_MESSAGE_PREFIX = 'Database connection status: ';
const DATABASE_CONNECTED_MESSAGE = 'Connected';
const DATABASE_NOT_CONNECTED_MESSAGE = 'NOT connected';

app.use(cookieParser());

app.use((req, res, next) => {
  if (process.env.DEPLOY_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
    res.redirect(process.env.HOST + req.url);
  } else if (process.env.DEPLOY_ENV === 'staging' && req.headers['x-forwarded-proto'] !== 'https') {
    res.redirect(process.env.HOST + req.url);
    // warmsea is Connor's dev staging to check URLs before staging pull requests
  } else if (process.env.DEPLOY_ENV === 'warmsea' && req.headers['x-forwarded-proto'] !== 'https') {
    res.redirect('https://warm-sea-98216.herokuapp.com' + req.url);
  } else {
    next();
  }
});

// Spotify login routes
app.get('/login', Login.login);
app.get('/callback', Login.callback);
app.get('/refresh_token', Login.refreshToken);

// Add song to Spotify playlist
app.get('/addSong', (req, res, err) => {
  var playlistHash = req.query.playlistHash;
  var songUri = req.query.songUri;

  // retrieve accountId and playlistId from DB with playlistHash
  db.retrievePlaylist(playlistHash)
  .then((playlistData) => {
    console.log('retrieved playlistData successfully in /addSong:', playlistData);
    var accountId = playlistData.accountId;
    var playlistId = playlistData.playlistId;

    // retrieve accessToken with accountId
    db.retrieveAccount(accountId)
    .then((accountData) => {
      console.log('retrieved accountData successfully in /addSong:', accountData);
      var accessToken = accountData.accessToken;
      // var refreshToken = accountData.refreshToken; // not needed right now

      apiCalls.addSongToPlaylist(accessToken, accountId, playlistId, [songUri])
      .then((data) => {
        console.log('song added to playlist successfully! ', data);
        res.send('success');
      })
      .catch((err) => {
        console.log('error occurred while adding song to playlist:', err);
      });
    })
    .catch((err) => {
      console.log('error occurred while retrieving accountData in /addSong:', err);
      res.sendStatus(404);
    });
  })
  .catch((err) => {
    console.log('Unable to retrieve playlist data in /addSong: ', err);
    res.sendStatus(404);
  });
});

// test endpoint for reporting status of database connection
app.get('/test', (req, res) => {
  const message = DATABASE_CONNECTED_MESSAGE_PREFIX +
    ((db.mongoose.connection.readyState === 1) ? DATABASE_CONNECTED_MESSAGE : DATABASE_NOT_CONNECTED_MESSAGE);
  res.status(200).send(message);
});

app.get('/clients', (req, res) => {
  let message = '';
  let clients = io.sockets.connected;
  for ( client in clients ) {
    message += `Rooms for ${client}: ${JSON.stringify(clients[client].rooms)}\n`;
  }
  res.status(200).send(message);
});

// serve up client files
app.use(express.static(`${__dirname}/../client`));
app.use(express.static(`${__dirname}/../node_modules`));

// Query Spotify's Search API for a track name, and return an array of all matching tracks. Each track in the response will
// be an object with properties uri and artist name.
app.get('/tracks', (req, res) => {
  const query = req.query.trackName; // name me trackName in the client

  let tracks;

  request(`https://api.spotify.com/v1/search?q=${query}&type=track`, (error, response, body) => {
    const parsedBody = JSON.parse(body);

    if (parsedBody.tracks.items.length <= 0) {
      res.send([]);
      return;
    }

    tracks = parsedBody.tracks.items.map(track => {
      return {uri: track.uri, artist: track.artists[0].name};
    });
    res.status(200).send(tracks);
    return;
  });
});

app.get('/grabSongsData', (req, res) => {
  db.retrieveAllSongsForPlaylist(req.query.playlist)
    .then((data)=>{
      res.send(data);
    })
    .catch(err => {
      console.log('trouble grabbing the data', err);
    });
});

app.get('/inputVotes', (req, res) => {
  console.log('expect songId', req.query.songId);
  if (req.query.vote === 'upvote') {
    //do i need to query the database for the current upvote number
    //for that song, save it to a variable, add one to the variable,
    //and then insert that number into the database?
    console.log('its an upvote', req.query.vote);
    //input upvote for song
    //need access to songid/song title to know where to insert
  } else {
    console.log('its a downvote', req.query.vote);
    //input downvote
  }
});

app.get('/playlist', (req, res) => {
  console.log('Querying Playlist table... ', req.query);
  db.retrievePlaylist(req.query.playlist)
    .then(data => {
      console.log('Playlist data successfully retrieved: ', data);
      var playlistUri = `spotify:user:${data.accountId}:playlist:${data.playlistId}`;
      res.send(playlistUri);
    })
    .catch(err => {
      console.log('Unable to retrieve Playlist data: ', err);
      res.sendStatus(404);
    });
});

app.post('/play', (req, res) => {
  console.log('PLAY server side');
  // call Spotify API
  // https://api.spotify.com/v1/me/player/play
  res.sendStatus(201);
});

app.post('/pause', (req, res) => {
  console.log('PAUSE server side');
  // call Spotify API
  // https://developer.spotify.com/web-api/console/put-pause/
  res.sendStatus(201);
});

// socket.io framework
io.on( 'connection', function(client) {

  client.on('voting', function(vote, songId, callback) {
    console.log('expect vote and songId', vote, songId);
    //look in the database for song and then the upvotes/downvotes for that song
    callback({ upvotes: '1', downvotes: '1' });
  });

  client.on('add song', (uri) => {
    console.log( 'Client adding song', uri );
    // the playlistId is the name of a room that this socket is in
    let playlistId;
    for ( room in client.rooms ) {
      // each socket is also in a room matching its own ID, so let's filter that out
      if ( room !== client.id ) {
        playlistId = room;
      }
    }
    console.log( '  for playlist', playlistId );
    db.insertSong(playlistId, {uri: uri});
    // transmit the confirmation to ALL clients working with this playlist
    io.in(playlistId).emit('song added', uri);
  });

  // (new or existing) playlist requests
  client.on( 'playlist', function(playlistId, callback) {
    let playlist;
    let p;

    if ( playlistId ) {
      console.log( `Client requesting playlist ${playlistId}` );

      p = db.getSinglePlaylist( playlistId )
        .then( (doc) => {
          if ( !doc ) {
            throw new Error( 'playListNotFound' );
          }
          return doc;
        })
        .catch(
          (err) => (err.message === 'playListNotFound' ),
          () => {
            return db.createPlaylist();
          });

    } else {

      console.log( 'Client requesting new playlist' );
      p = db.createPlaylist();
    }

    p.then( (doc) => {
      // put this client in a socket.io room corresponding to this playlist
      client.join( doc._id.toString() );
      callback({ _id: doc._id.toString(), songs: doc.songs });
    })
    .catch( (err) => {
      console.log( err );
    });
  });

  client.on('disconnect', function() {
    // POST-MVP: clean up empty playlists here
  });
});


// start the webserver
http.listen = Promise.promisify(http.listen);
app.start = function() {
  return http.listen(SERVER_PORT)
    .then(() => {
      console.log(`Tribal server is listening on port ${SERVER_PORT}.`);
    });
};

module.exports = app;
module.exports.SERVER_PORT = SERVER_PORT;
module.exports.DATABASE_CONNECTED_MESSAGE_PREFIX = DATABASE_CONNECTED_MESSAGE_PREFIX;
module.exports.DATABASE_CONNECTED_MESSAGE = DATABASE_CONNECTED_MESSAGE;
