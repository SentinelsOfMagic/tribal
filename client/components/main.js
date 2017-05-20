angular.module('tribal')

.controller('MainController', function(tribalServer) {
  tribalServer.test()
    .then(res => {
      this.messageFromServer = res.data;
    });

  this.searchResultsHandler = (results) => {
    this.searchResults = results.data;

    // no mapping needed
    // .map((result) => {
    //   return {uri: result.uri, artist: result.artist, title: result.title};
    // });
  };
})

.directive('main', function() {
  return {
    scope: {
      playlistUri: '<',
      clickTitle: '<',
      songs: '<'
    },
    restrict: 'E',
    controller: 'MainController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/main.html',
  };
});

