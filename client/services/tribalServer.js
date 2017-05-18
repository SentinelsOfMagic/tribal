const tribalServer = function( $http ) {

  let socket = io();

  this.test = function() {
    return $http.get( '/test' );
  };

  this.putStuffInDataBase = function() {
    console.log('where will i see this?');
    return $http.get('/thereThere', {
      params: {
        vote: 'heheheh'
      }
    });
  };

  // get (new or existing) playlist from server
  this.getPlaylist = function( playlistId, callback ) {
    socket.emit( 'playlist', playlistId, callback );
  };

  // request that the server add a song to the playlist
  this.addSong = function( uri ) {
    socket.emit( 'add song', uri );
  };

  this.registerSongAddedHandler = function( callback ) {
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
    console.log('made it to tribal server: ', hash);
    return $http.get('/playlist', {
      params: {
        playlist: hash
      }
    });
  };
};

angular.module('tribal').service('tribalServer', ['$http', tribalServer]);
