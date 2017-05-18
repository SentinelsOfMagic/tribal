const PlaylistController = function( tribalServer, $location, $scope ) {

//   this.songAddedHandler = (uri) => {
//     this.playlist.push({ uri: uri });
//     $scope.$apply();
//   };

  // tribalServer.registerSongAddedHandler( this.songAddedHandler );

  tribalServer.getPlaylist( $location.search().playlist, (res) => {
    $location.search( 'playlist', res._id );
    this.playlist = res.songs;
    $scope.$apply();
  });
};

const Playlist = function() {
  return {
    scope: {
      ownerId: '<',
      playlistId: '<'
    },
    restrict: 'E',
    controller: [ 'tribalServer', '$location', '$scope', PlaylistController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/playlist.html'
  };
};

angular.module('tribal').directive('playlist', Playlist);
