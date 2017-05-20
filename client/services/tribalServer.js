const tribalServer = function( $http ) {

  let socket = io();

  this.test = function() {
    return $http.get( '/test' );
  };

  this.addSong = (playlistHash, songUri, artist, title) => {
    return $http.get('/addSong', {
      params: {
        playlistHash: playlistHash,
        songUri: songUri,
        artist: artist,
        title: title
      }
    });
  };

  this.insertVotes = function(vote, songId, hash, callback) {
    socket.emit('voting', vote, songId, hash, callback);
    return $http.get('/inputVotes', {
      params: {
        vote: vote,
        songId: songId,
        hash: hash
      }
    });
  };

  this.grabSongsFromPlaylist = function(hash) {
    return $http.get('/grabSongsData', {
      params: {
        playlist: hash
      }
    });
  };

  // get (new or existing) playlist from server
  this.getPlaylist = function( playlistId, callback ) {
    socket.emit( 'playlist', playlistId, callback );
  };

  // // request that the server add a song to the playlist
  // this.addSong = function( uri ) {
  //   socket.emit( 'add song', uri );
  // };

  this.registerSongAddedHandler = function(callback) {
    socket.on( 'song added', callback );
  };

  this.spotifySearch = function(trackName) {
    return $http.get( '/tracks', {
      params: {
        trackName: trackName,
      }
    });
  };

  this.checkPlaylistHash = function(hash) {
    return $http.get('/playlist', {
      params: {
        playlist: hash
      }
    });
  };

  this.startParty = function(playlistHash) {
    console.log('tribalServer playSong');
    socket.emit('play');
    return $http.post('/play', { playlist: playlistHash });
  };

  this.playSong = function(playlistHash) {
    console.log('tribalServer playSong');
    socket.emit('resume');
    return $http.post('/resume', { playlist: playlistHash });
  };

  this.pauseSong = function(playlistHash) {
    console.log('tribalServer pauseSong');
    socket.emit('pause');
    return $http.post('/pause', { playlist: playlistHash });
  };

  this.registerPlay = function(callback) {
    console.log('registerPlay: ', callback);
    socket.on('playing', callback);
  };

  this.registerPause = function(callback) {
    console.log('registerPause: ', callback);
    socket.on('paused', callback);
  };
};

angular.module('tribal').service('tribalServer', ['$http', tribalServer]);
