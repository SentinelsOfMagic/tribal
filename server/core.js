const express = require('express');
const db = require('./database');
const Promise = require('bluebird');
const request = require('request');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const Login = require('./api/login-handler.js');
const apiCalls = require('./api/api-calls.js');
const bodyParse = require('body-parser');

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const SERVER_PORT = process.env.PORT || 4242;

const DATABASE_CONNECTED_MESSAGE_PREFIX = 'Database connection status: ';
const DATABASE_CONNECTED_MESSAGE = 'Connected';
const DATABASE_NOT_CONNECTED_MESSAGE = 'NOT connected';

app.use(cookieParser());
app.use(bodyParse.json());

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

// serve up client files
app.use(express.static(`${__dirname}/../client`));
app.use(express.static(`${__dirname}/../node_modules`));

// Spotify login routes
app.get('/login', Login.login);
app.get('/callback', Login.callback);

// Add song to Spotify playlist
app.get('/addSong', (req, res, err) => {
  var playlistHash = req.query.playlistHash;
  var songUri = req.query.songUri;
  var songArtist = req.query.artist;
  var songTitle = req.query.title;

  // retrieve accountId and playlistId from DB with playlistHash
  db.retrievePlaylist(playlistHash)
  .then((playlistData) => {
    console.log('retrieved playlistData successfully in /addSong:', playlistData);
    var accountId = playlistData.accountId;
    var playlistId = playlistData.playlistId;
    // var position = playlistData.orderedSongs.length;
    // console.log('POSITION:', position);

    // retrieve accessToken with accountId
    db.retrieveAccount(accountId)
    .then((accountData) => {
      //console.log('retrieved accountData successfully in /addSong:', accountData);
      var accessToken = accountData.accessToken;
      // var refreshToken = accountData.refreshToken; // not needed right now

      apiCalls.addSongToPlaylist(accessToken, accountId, playlistId, [songUri])
      .then((data) => {
        //console.log('song added to playlist successfully! ', data);

        var songId = songUri.split('spotify:track:')[1];

        db.insertSongToPlaylist(playlistHash, songId, songTitle, songArtist)
        .then((song) => {
          //console.log('song successfully inserted to database in /addSong:', song);

          // push song to playlist ordered songs array
          db.insertSongToPlaylistOrderedSongs(playlistHash, song._id)
          .then((playlist) => {
            let len = playlist.orderedSongs.length - 1;
            return db.updateSongIndex(playlist.orderedSongs[len], len);
          })
          .then(() => {
            console.log('song inserted to playlist ordered songs array successfully');
            res.status(200).send();
          })
          .catch((err) => {
            console.log('error occurred while adding song to playlist ordered songs:', err);
          });
        })
        .catch((err) => {
          console.log('error occurred while inserting song to playlist in /addSong:', err);
        });
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

    tracks = parsedBody.tracks.items.map((track) => {
      return {uri: track.uri, artist: track.artists[0].name, title: track.name};
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

  console.log('expect hash and songId', req.query.hash, req.query.songId);

  if (req.query.vote === 'upvote') {
    db.inputSongUpvote(req.query.hash, req.query.songId)
    .then((songObject) => {
      return db.updateSongOrderAfterVote(songObject, -1);
    })
    .catch(err=> {
      console.log('fail input upvote', err);
    });
  } else {
    db.inputSongDownvote(req.query.hash, req.query.songId)
    .then((songObject) => {
      return db.updateSongOrderAfterVote(songObject, 1);
    })
    .catch(err=> {
      console.log('fail input downvote', err);
    });
  }
  res.send('done voting');
});

app.get('/playlist', (req, res) => {
  console.log('Querying Playlist table... ', req.query);
  db.retrievePlaylist(req.query.playlist)
    .then(data => {
      //console.log('Playlist data successfully retrieved: ', data);
      var playlistUri = `spotify:user:${data.accountId}:playlist:${data.playlistId}`;
      res.send(playlistUri);
    })
    .catch(err => {
      console.log('Unable to retrieve Playlist data: ', err);
      res.sendStatus(404);
    });
});

app.post('/playlistStatus', (req, res) => {
  console.log('Querying /playlistStatus... ', req.body);
  db.retrievePlaylist(req.body.playlist)
    .then(data => {
      console.log('/playlistStarted successfully retrieved: ', data);
      res.send(data);
    })
    .catch(err => {
      console.log('Unable to retrieve /playlistStarted data: ', err);
      res.sendStatus(404);
    });
});

app.post('/play', (req, res) => {

  console.log('PLAY server side: ', req.body);
  // call Spotify API
  var playlistHash = req.body.playlist;

  db.updatePlaylist(playlistHash)
    .then(() => console.log('Playlist started'))
    .catch(err => console.log('Unable to update playlist: ', err));
  // retrieve accountId and playlistId from DB with playlistHash
  db.retrievePlaylist(playlistHash)
  .then((playlistData) => {
    // console.log('retrieved playlistData successfully in /play:', playlistData);
    var accountId = playlistData.accountId;
    var playlistId = playlistData.playlistId;

    // retrieve accessToken with accountId
    db.retrieveAccount(accountId)
    .then((accountData) => {
      var accessToken = accountData.accessToken;
      // var refreshToken = accountData.refreshToken; // not needed right now

      // call Spotify API
      var options = {
        url: 'https://api.spotify.com/v1/me/player/play',
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        },
        json: {
          // linter doesn't like underscore in key, but is required by Spotify api
          'context_uri': `spotify:user:${accountId}:playlist:${playlistId}`,
          'offset': {
            'position': 0
          }
        }
      };

      request(options, (err, resp, body) => {
        console.log('api call /play successful', body);

        res.sendStatus(201);
      });

    })
    .catch((err) => {
      console.log('error occurred while retrieving accountData in /play:', err);
      res.sendStatus(404);
    });
  })
  .catch((err) => {
    console.log('Unable to retrieve playlist data in /play: ', err);
    res.sendStatus(404);
  });
});

app.post('/resume', (req, res) => {
  // console.log('PLAY server side');
  console.log('resume server: ', req.body);
  var playlistHash = req.body.playlist;

  db.playPlaylist(playlistHash)
    .then(() => console.log('Playlist playing'))
    .catch(err => console.log('Unable to play playlist: ', err));
  // retrieve accountId and playlistId from DB with playlistHash
  db.retrievePlaylist(playlistHash)
  .then((playlistData) => {
    // console.log('retrieved playlistData successfully in /play:', playlistData);
    var accountId = playlistData.accountId;
    var playlistId = playlistData.playlistId;

    // retrieve accessToken with accountId
    db.retrieveAccount(accountId)
    .then((accountData) => {
      var accessToken = accountData.accessToken;
      // var refreshToken = accountData.refreshToken; // not needed right now

      // call Spotify API
      var options = {
        url: 'https://api.spotify.com/v1/me/player/play',
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      };

      request(options, (err, resp, body) => {
        console.log('api call /play successful:', body);
        res.sendStatus(201);
      });

    })
    .catch((err) => {
      console.log('error occurred while retrieving accountData in /play:', err);
      res.sendStatus(404);
    });
  })
  .catch((err) => {
    console.log('Unable to retrieve playlist data in /play: ', err);
    res.sendStatus(404);
  });
});

app.post('/pause', (req, res) => {
  console.log('PAUSE server side: ', req.body);
  // call Spotify API
  var playlistHash = req.body.playlist;

  db.pausePlaylist(playlistHash)
    .then(() => console.log('Playlist paused'))
    .catch(err => console.log('Unable to pause playlist: ', err));

  // retrieve accountId and playlistId from DB with playlistHash
  db.retrievePlaylist(playlistHash)
  .then((playlistData) => {
    // console.log('retrieved playlistData successfully in /pause:', playlistData);
    var accountId = playlistData.accountId;
    var playlistId = playlistData.playlistId;

    // retrieve accessToken with accountId
    db.retrieveAccount(accountId)
    .then((accountData) => {
      var accessToken = accountData.accessToken;
      // var refreshToken = accountData.refreshToken; // not needed right now

      // call Spotify API
      var options = {
        url: 'https://api.spotify.com/v1/me/player/pause',
        method: 'PUT',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      };

      request(options, (err, resp, body) => {
        console.log('api call /pause successful');
        res.sendStatus(201);
      });
    })
    .catch((err) => {
      console.log('error occurred while retrieving accountData in /pause:', err);
      res.sendStatus(404);
    });
  })
  .catch((err) => {
    console.log('Unable to retrieve playlist data in /pause: ', err);
    res.sendStatus(404);
  });
});

app.post('/currentSong', (req, res) => {
  var playlistHash = req.body.playlist;

  db.retrievePlaylist(playlistHash)
  .then((playlistData) => {

    var accountId = playlistData.accountId;
    var playlistId = playlistData.playlistId;

    db.retrieveAccount(accountId)
    .then((accountData) => {
      var accessToken = accountData.accessToken;
      console.log('accessToken: ', accessToken);

      var options = {
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      };

      request(options, (err, resp, body) => {
        if (err) {
          console.log('api call /currentSong unsuccessful: ', err);
          res.sendStatus(404);
        } else {
          console.log('api call /currentSong successful');
          res.send(body);
        }
      });
    })
    .catch((err) => {
      console.log('error occurred while retrieving accountData in /currentSong:', err);
      res.sendStatus(404);
    });
  })
  .catch((err) => {
    console.log('Unable to retrieve playlist data in /currentSong: ', err);
    res.sendStatus(404);
  });
});

// socket.io framework
io.on( 'connection', function(client) {

  client.on('start', () => {
    console.log('start client rooms: ', client.rooms);
    console.log('start client id: ', client.id);
    for (room in client.rooms) {
      console.log('start room: ', room);
      if (room !== client.id) {
        console.log('start id: ', room);
        io.in(room).emit('starting');
      }
    }
  });

  client.on('resume', () => {
    console.log('resume client rooms: ', client.rooms);
    console.log('resume client id: ', client.id);
    for (room in client.rooms) {
      console.log('resume room: ', room);
      if (room !== client.id) {
        console.log('resume id: ', room);
        io.in(room).emit('resuming');
      }
    }
  });

  client.on('pause', () => {
    console.log('pause client rooms: ', client.rooms);
    console.log('pause client id: ', client.id);
    for (room in client.rooms) {
      console.log('pause room: ', room);
      if (room !== client.id) {
        console.log('pause id: ', room);
        io.in(room).emit('paused');
      }
    }
  });

  client.on('voting', function(vote, songId, hash, $index, callback) {
    //look in the database for song and then the upvotes/downvotes for that song

    db.retrieveAllSongsForPlaylist(hash, callback)
      .then((data)=>{
        var upvotes = [];
        var downvotes = [];
        for (var i = 0; i < data.length; i++) {
          console.log('what does data look like?', data);
          upvotes.push(data[i].upvotes);
          downvotes.push(data[i].downvotes);
          callback({ upvotes: upvotes, downvotes: downvotes });
          for (room in client.rooms) {
            console.log('vote room: ', room);
            // each socket is also in a room matching its own ID, so let's filter that out
            // if ( room !== client.id ) {
            voteId = room;
            console.log('vote id: ', voteId);
            console.log('can i see the upvotes here?', upvotes);
            console.log('can i see the downvotes here?', downvotes);
            io.in(voteId).emit('voted', upvotes, downvotes, $index);
            // }
          }
        }
      })
      .catch((error) => {
        console.log('error in retrieving all songs for playlist', error);
      });


    // db.retrieveSongForPlaylist(songId, hash, callback)
    //   .then((data)=>{
    //     console.log('expect one song object', data);
    //     callback({ upvotes: data[0].upvotes, downvotes: data[0].downvotes });
    //     var upvotes = data[0].upvotes;
    //     var downvotes = data[0].downvotes;
    //     for (room in client.rooms) {
    //       console.log('vote room: ', room);
    //       // each socket is also in a room matching its own ID, so let's filter that out
    //       // if ( room !== client.id ) {
    //       voteId = room;
    //       console.log('vote id: ', voteId);
    //       console.log('can i see the upvotes here?', upvotes);
    //       io.in(voteId).emit('voted', upvotes, downvotes);
    //       // }
    //     }
    //   })
    //   .catch((error)=>{
    //     console.log('error in retrieving song', error);
    //   });

    console.log('vote client: ', client);
    console.log('vote client rooms: ', client.rooms);
    console.log('vote client id: ', client.id);

    // console.log('upvotes', song.upvotes, 'downvotes', song.downvotes )
  });

  client.on('add song', obj => {
    obj.upvotes = 0;
    obj.downvotes = 0;
    console.log('Client adding song', obj);
    for (room in client.rooms) {
      if (room !== client.id) {
        io.in(room).emit('song added', obj);
      }
    }
  });

  client.on('playlist', function(playlistHash) {
    console.log(`Client requesting playlist ${playlistHash}`);

    db.retrievePlaylist(playlistHash)
      .then(data => {
        console.log('got playlist: ', data._id);
        client.join(data._id.toString());
      })
      .catch(err => console.log('Unable to get playlist: ', err));
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
