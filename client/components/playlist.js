angular.module('tribal')

.controller('PlaylistController', function($location, tribalServer) {
  this.playlistHash = $location.search().playlist;
  tribalServer.getPlaylist(this.playlistHash)
    .then(res => {
      console.log('Successful getPlaylist call');
      this.partying = res.data.started;
      this.playing = res.data.playing;
    })
    .catch(err => console.log('Error in getting playlist'));
  // this.partying = false;
  // this.playing = true;
  tribalServer.getCurrentSong(this.playlistHash)
    .then(res => {
      console.log('get currentSong success');
      this.currentSong = res.data;
    })
    .catch(err => console.log('Error in setting currentSong'));
  this.startParty = ($event) => {
    console.log('startParty');
    tribalServer.startParty(this.playlistHash);
  };
  this.clickPlay = ($event) => {
    console.log('clickPlay');
    tribalServer.resumeSong(this.playlistHash);
  };
  this.clickPause = ($event) => {
    console.log('clickPause');
    tribalServer.pauseSong(this.playlistHash);
  };
  this.handleStartParty = () => {
    console.log('startParty');
    this.partying = true;
    this.playing = true;
    console.log('partying: ', this.partying);
    console.log('playing: ', this.playing);
  };
  this.handlePlay = () => {
    console.log('handlePlay');
    this.playing = true;
    this.partying = true;
    console.log('playing: ', this.playing);
  };
  this.handlePause = () => {
    console.log('handlePause');
    this.playing = false;
    console.log('playing: ', this.playing);
  };
  tribalServer.registerStartParty(this.handleStartParty);
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

