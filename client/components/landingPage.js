// angular.module('tribal')

// .controller('LandingPageCtrl', function($location, tribalServer) {
//   this.showForm = false;
//   this.showError = false;
//   this.showMain = false;
//   this.showInit = true;
//   this.playlistUri = '';
//   this.playlistHash = $location.search().playlist;
//   this.existingPlaylist = ($event) => {
//     this.showForm = true;
//   };
//   this.songsFromPlaylist = [];
//   this.clickCancel = ($event) => {
//     this.showForm = false;
//   };
//   this.submitPlaylist = (hash) => {
//     console.log('submit playlist input: ', hash);
//     tribalServer.checkPlaylistHash(hash)
//       .then(res => {
//         this.playlistUri = res.data;
//         this.showMain = true;
//         this.showInit = false;
//         $location.search('playlist', hash);
//         tribalServer.grabSongsFromPlaylist(hash)
//           .then(res => {
//             this.songsFromPlaylist = res.data.sort((a, b) => a.index - b.index);
//           })
//           .catch(err => {
//             console.log('trouble getting the songs in frontend', err);
//           });
//       })
//       .catch(err => {
//         console.log('error: ', err);
//         this.showError = true;
//       });
//   };
//   this.clickTitle = ($event) => {
//     this.showMain = false;
//     this.showInit = true;
//     this.showForm = false;
//     delete $location.search().playlist;
//     $location.url('');
//     $location.absUrl(process.env.HOST);
//   };
//   if (this.playlistHash) {
//     this.submitPlaylist(this.playlistHash);
//     tribalServer.grabSongsFromPlaylist(this.playlistHash)
//       .then(res => {
//         this.songsFromPlaylist = res.data.sort((a, b) => a.index - b.index);
//       })
//       .catch(err => {
//         console.log('trouble getting the songs in frontend', err);
//       });
//   }

//   this.votingHandler = (vote, songId, $index) => {
//     tribalServer.insertVotes(vote, songId, this.playlistHash, $index, (res) => {
//       console.log('hash', this.playlistHash);
//       console.log('upvotes', res.upvotes);
//       console.log('downvotes', res.downvotes);
//       this.upvotes = res.upvotes;
//       this.downvotes = res.downvotes;
//     });
//   };

//   this.setPlaylistSongs = (songs) => {
//     console.log('setPlaylistSongs: ', songs);
//     this.songsFromPlaylist.push(songs);
//     console.log('songsFromPlaylist: ', this.songsFromPlaylist);
//   };
//   tribalServer.updatePlaylistSongs(this.setPlaylistSongs);
// })

// .directive('landingPage', function() {
//   return {
//     scope: {},
//     restrict: 'E',
//     controllerAs: 'ctrl',
//     bindToController: true,
//     controller: ['LandingPageCtrl', '$scope'],
//     templateUrl: '/templates/landingPage.html'
//   };
// });

const LandingPageCtrl = function($location, tribalServer, $scope) {
  this.showForm = false;
  this.showError = false;
  this.showMain = false;
  this.showInit = true;
  this.playlistUri = '';
  this.playlistHash = $location.search().playlist;
  this.existingPlaylist = ($event) => {
    this.showForm = true;
  };
  this.songsFromPlaylist = [];
  this.clickCancel = ($event) => {
    this.showForm = false;
  };
  this.submitPlaylist = (hash) => {
    console.log('submit playlist input: ', hash);
    tribalServer.checkPlaylistHash(hash)
      .then(res => {
        this.playlistUri = res.data;
        this.showMain = true;
        this.showInit = false;
        $location.search('playlist', hash);
        tribalServer.grabSongsFromPlaylist(hash)
          .then(res => {
            this.songsFromPlaylist = res.data.sort((a, b) => a.index - b.index);
          })
          .catch(err => {
            console.log('trouble getting the songs in frontend', err);
          });
      })
      .catch(err => {
        console.log('error: ', err);
        this.showError = true;
      });
  };
  this.clickTitle = ($event) => {
    this.showMain = false;
    this.showInit = true;
    this.showForm = false;
    delete $location.search().playlist;
    $location.url('');
    $location.absUrl(process.env.HOST);
  };
  if (this.playlistHash) {
    this.submitPlaylist(this.playlistHash);
    tribalServer.grabSongsFromPlaylist(this.playlistHash)
      .then(res => {
        this.songsFromPlaylist = res.data.sort((a, b) => a.index - b.index);
      })
      .catch(err => {
        console.log('trouble getting the songs in frontend', err);
      });
  }

  this.votingHandler = (vote, songId, $index) => {
    tribalServer.insertVotes(vote, songId, this.playlistHash, $index, (res) => {
      console.log('hash', this.playlistHash);
      console.log('upvotes', res.upvotes);
      console.log('downvotes', res.downvotes);
      console.log('index of button pressed', $index);
      this.upvotes = res.upvotes;
      this.downvotes = res.downvotes;
      $scope.$apply();
    });
  };

  this.setPlaylistSongs = (songs) => {
    console.log('setPlaylistSongs: ', songs);
    this.songsFromPlaylist.push(songs);
    console.log('songsFromPlaylist: ', this.songsFromPlaylist);
  };
  tribalServer.updatePlaylistSongs(this.setPlaylistSongs);
};

const LandingPage = function() {
  return {
    scope: {},
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    controller: LandingPageCtrl,
    templateUrl: '/templates/landingPage.html'
  };
};

angular.module('tribal').directive('landingPage', LandingPage);
