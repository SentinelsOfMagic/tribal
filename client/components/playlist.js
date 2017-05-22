angular.module('tribal')

.controller('PlaylistController', function($location, tribalServer) {
  this.duration;
  var timer;
  var elapsedTime = 0;
  var timeLeft = 0;
  var currentSongIndex = 0;

  this.playlistHash = $location.search().playlist;

  tribalServer.getPlaylist(this.playlistHash)
    .then(res => {
      console.log('Successful getPlaylist call');
      this.partying = res.data.started;
      this.playing = res.data.playing;
    })
    .catch(err => console.log('Error in getting playlist'));

  // tribalServer.getCurrentSong(this.playlistHash, currentSongIndex)
  //   .then(res => {
  //     console.log('get currentSong success');
  //     this.currentSong = res.data;
  //   })
  //   .catch(err => console.log('Error in setting currentSong'));

  this.startParty = ($event) => {
    console.log('startParty');
    tribalServer.startParty(this.playlistHash, currentSongIndex)
    .then((res) => {
      this.currentSong = res.data[0];
      this.duration = res.data[0].duration;
      this.playTimer(this.duration);
    });
  };

  this.clickPlay = ($event) => {
    console.log('clickPlay');
    tribalServer.resumeSong(this.playlistHash);

    timeLeft = this.duration - elapsedTime;
    this.playTimer(timeLeft);
  };

  this.clickPause = ($event) => {
    console.log('clickPause');
    tribalServer.pauseSong(this.playlistHash);

    clearInterval(timer);
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

  this.playTimer = (duration) => {
    var current = new Date().getTime();
    var end = (new Date().getTime()) + duration;

    timer = setInterval(() => {
      current += 1000;
      elapsedTime += 1000;
      console.log(current);
      if (current >= end) {
        clearInterval(timer);
        console.log('song ended');
      }
    }, 1000);
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

