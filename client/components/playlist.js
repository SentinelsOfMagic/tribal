angular.module('tribal')

.controller('PlaylistController', function($location, tribalServer) {
  this.playlistHash = $location.search().playlist;

  this.playing = false;
  // this.currentSong = false;
  this.currentSong = {
    item: {
      album: {
        images: [{}, {
          url: 'https://i.scdn.co/image/5ca023498e951d2bdcc2b8a4b6e88717fa9b6e1f'
        }, {
          url: 'https://i.scdn.co/image/d866cccb797f489ca1f0046ed750d140c3ff6ca3'
        }]
      },
      name: 'Bonfire',
      artists: [{
        name: 'Childish Gambino'
      }]
    }
  };

  this.clickPlay = ($event) => {
    console.log('clickPlay');
    tribalServer.playSong(this.playlistHash);
  };
  this.clickPause = ($event) => {
    console.log('clickPause');
    tribalServer.pauseSong(this.playlistHash);
  };
  this.handlePlay = () => {
    console.log('handlePlay');
    this.playing = true;
  };
  this.handlePause = () => {
    console.log('handlePause');
    this.playing = false;
  };
  tribalServer.registerPlay(this.handlePlay);
  tribalServer.registerPause(this.handlePause);
})

.directive('playlist', function() {
  return {
    scope: {
      playlistUri: '<'
    },
    restrict: 'E',
    controller: 'PlaylistController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/playlist.html'
  };
});

