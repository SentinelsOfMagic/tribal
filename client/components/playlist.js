const PlaylistController = function($location, tribalServer, $scope) {
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
    currentSongIndex = 0;
    tribalServer.startParty(this.playlistHash, currentSongIndex)
    .then((res) => {
      this.currentSong = res.data[0];
      this.duration = res.data[0].duration;
      this.playTimer(this.duration);
      tribalServer.emitStartParty();
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

    tribalServer.startParty(this.playlistHash, currentSongIndex)
    .then((res) => {
      this.currentSong = res.data[0];
    });

    $scope.$apply();
  };

  this.handlePlay = () => {
    console.log('handlePlay');
    this.playing = true;
    this.partying = true;
    console.log('playing: ', this.playing);
    $scope.$apply();
  };

  this.handlePause = () => {
    console.log('handlePause');
    this.playing = false;
    console.log('playing: ', this.playing);
    $scope.$apply();
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
        this.updateCurrentSong();
      }
    }, 1000);
  };

  this.updateCurrentSong = () => {
    console.log('updating currentSong');
    currentSongIndex++;
    tribalServer.songEnded();

    tribalServer.updateCurrentSong(this.playlistHash, currentSongIndex)
    .then((res) => {
      // update this.currentSong
      this.currentSong = res.data[0];

      if (res.data.length > 0) {
        // update timer variables
        this.duration = res.data[0].duration;
        elapsedTime = 0;
        this.playTimer(this.duration);
      } else {
        // playlist has gotten to the end
        console.log('playlist ended');
        tribalServer.playlistEnded();

        this.partying = false;
        this.playing = false;
        clearInterval(timer);
      }
    });
  };

  this.handleCurrentSong = () => {
    console.log('handleCurrentSong called!!');
    // currentSongIndex++;

    tribalServer.updateCurrentSong(this.playlistHash, currentSongIndex)
    .then((res) => {
      this.currentSong = res.data[0];
    });
  };

  tribalServer.registerStartParty(this.handleStartParty);
  tribalServer.registerPlay(this.handlePlay);
  tribalServer.registerPause(this.handlePause);
  tribalServer.registerCurrentSong(this.handleCurrentSong);
};

const Playlist = function() {
  return {
    scope: {
      playlistUri: '<',
      songs: '<'
    },
    restrict: 'E',
    controller: PlaylistController,
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/playlist.html'
  };
};

angular.module('tribal').directive('playlist', Playlist);
