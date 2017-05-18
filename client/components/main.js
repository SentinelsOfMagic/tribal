const MainController = function( tribalServer, $scope ) {

  tribalServer.test()
    .then( (res) => {
      this.messageFromServer = res.data;
    });

  this.searchResultsHandler = (results) => {
    this.searchResults = results.data.map( result => result.uri );
    // $scope.$apply();
  };
};

const Main = function() {
  return {
    scope: {
      playlistUri: '<'
    },
    restrict: 'E',
    controller: [ 'tribalServer', '$scope', MainController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/main.html',
  };
};

angular.module('tribal').directive('main', Main);
