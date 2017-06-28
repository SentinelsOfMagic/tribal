const SearchController = function($location, tribalServer) {


  this.searchButtonHandler = (query) => {
    this.playlistHash = $location.search().playlist;
    tribalServer.spotifySearch( query, this.playlistHash )
    .then( (results) => {
      this.searchResultsHandler( results );
    });
  };
};

const Search = function() {
  return {
    scope: {
      searchResultsHandler: '<',
    },
    restrict: 'E',
    controller: [ '$location', 'tribalServer', SearchController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/search.html'
  };
};

angular.module('tribal').directive('search', Search);
