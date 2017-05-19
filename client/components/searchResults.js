const SearchResults = function() {
  return {
    scope: {
      searchResults: '<',
      playlistHash: '<'
    },
    restrict: 'E',
    controller: () => {},
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/searchResults.html'
  };
};

angular.module('tribal').directive('searchResults', SearchResults);
