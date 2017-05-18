angular.module('tribal')

.controller('MainController', function(tribalServer) {
  tribalServer.test()
    .then(res => {
      this.messageFromServer = res.data;
    });

  this.searchResultsHandler = (results) => {
    this.searchResults = results.data.map(result => result.uri);
  };
})

.directive('main', function() {
  return {
    scope: {
      playlistUri: '<'
    },
    restrict: 'E',
    controller: 'MainController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/main.html',
  };
});

