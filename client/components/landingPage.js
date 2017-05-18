angular.module('tribal')

.controller('LandingPageCtrl', function(tribalServer) {
  this.showForm = false;
  this.showError = false;
  this.showMain = false;
  this.showInit = true;
  this.playlistUri = '';
  this.createPlaylist = ($event) => {
    console.log('create playlist click - need to redict to Spotify login');
  };
  this.existingPlaylist = ($event) => {
    this.showForm = true;
  };
  this.clickCancel = ($event) => {
    this.showForm = false;
  };
  this.submitPlaylist = (hash) => {
    console.log('input: ', hash);
    tribalServer.checkPlaylistHash(hash)
      .then(res => {
        console.log('uri: ', res.data);
        this.playlistUri = res.data;
        this.showMain = true;
        this.showInit = false;
      })
      .catch(err => {
        console.log('error: ', err);
        this.showError = true;
      });
  };
})

.directive('landingPage', function() {
  return {
    scope: {},
    restrict: 'E',
    controllerAs: 'ctrl',
    bindToController: true,
    controller: 'LandingPageCtrl',
    templateUrl: '/templates/landingPage.html'
  };
});
