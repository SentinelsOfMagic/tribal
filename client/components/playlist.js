angular.module('tribal')

.controller('PlaylistController', function(tribalServer, $location) {

//   this.songAddedHandler = (uri) => {
//     this.playlist.push({ uri: uri });
//     $scope.$apply();
//   };

  // tribalServer.registerSongAddedHandler( this.songAddedHandler );

  // tribalServer.getPlaylist( $location.search().playlist, (res) => {
  //   $location.search( 'playlist', res._id );
  //   this.playlist = res.songs;
  //   $scope.$apply();
  // });

})

.directive('playlist', function() {
  return {
    scope: {
      playlistUri: '<',
    },
    restrict: 'E',
    controller: 'PlaylistController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/playlist.html'
  };
});

