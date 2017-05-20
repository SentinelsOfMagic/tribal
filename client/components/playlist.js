angular.module('tribal')

.controller('PlaylistController', function($location, tribalServer) {
  this.playlistHash = $location.search().playlist;
  this.partying = false;
  this.playing = true;
  tribalServer.getCurrentSong(this.playlistHash)
    .then(res => {
      this.currentSong = res.data;
    })
    .catch(err => console.log('Error in setting currentSong'));
  this.startParty = ($event) => {
    console.log('startParty');
    this.partying = true;
    tribalServer.startParty(this.playlistHash);
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
      playlistUri: '<',
      songs: '<'
    },
    restrict: 'E',
    controller: 'PlaylistController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/playlist.html'
  };
});

