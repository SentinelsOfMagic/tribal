const tribalServer = function( $http ) {

  let socket = io();

  this.test = function() {
    return $http.get( '/test' );
  };

  this.addSong = (playlistHash, songUri, artist, title) => {
    console.log('addSong');
    socket.emit('add song', { _id: playlistHash, songArtist: artist, songTitle: title });
    return $http.get('/addSong', {
      params: {
        playlistHash: playlistHash,
        songUri: songUri,
        artist: artist,
        title: title
      }
    });
  };

  this.updatePlaylistSongs = (callback) => {
    console.log('updatePlaylistSongs: ', callback);
    socket.on('song added', callback);
  };

  this.insertVotes = function(vote, songId, hash, $index, callback) {
    socket.emit('voting', vote, songId, hash, $index, callback);
    return $http.get('/inputVotes', {
      params: {
        vote: vote,
        songId: songId,
        hash: hash,
        index: $index
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

  this.registerVote = function(callback) {
    socket.on('voted', callback);
  };
  // get (new or existing) playlist from server
  this.getPlaylist = function(hash) {
    console.log('get playlist: ', hash);
    socket.emit('playlist', hash);
    return $http.post('/playlistStatus', { playlist: hash });
  };

  // // request that the server add a song to the playlist
  // this.addSong = function( uri ) {
  //   socket.emit( 'add song', uri );
  // };

  this.registerSongAddedHandler = function(callback) {
    socket.on('song added', callback);
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
    console.log('tribalServer startParty: ', playlistHash);
    socket.emit('start');
    return $http.post('/play', { playlist: playlistHash });
  };

  this.resumeSong = function(playlistHash) {
    console.log('tribalServer playSong: ', playlistHash);
    socket.emit('resume');
    return $http.post('/resume', { playlist: playlistHash });
  };

  this.pauseSong = function(playlistHash) {
    console.log('tribalServer pauseSong: ', playlistHash);
    socket.emit('pause');
    return $http.post('/pause', { playlist: playlistHash });
  };

  this.registerStartParty = function(callback) {
    console.log('registerStartParty: ', callback);
    socket.on('starting', callback);
  };

  this.registerPlay = function(callback) {
    console.log('registerPlay: ', callback);
    socket.on('resuming', callback);
  };

  this.registerPause = function(callback) {
    console.log('registerPause: ', callback);
    socket.on('paused', callback);
  };

  this.getCurrentSong = function(playlistHash) {
    console.log('getCurrentSong: ', playlistHash);
    return $http.post('/currentSong', { playlist: playlistHash });
  };
};

angular.module('tribal').service('tribalServer', ['$http', tribalServer]);
