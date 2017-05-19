const SearchResults = function() {
  return {
    scope: {
      searchResults: '<'
    },
    restrict: 'E',
    controller: () => {},
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/searchResults.html'
  };
};

angular.module('tribal').directive('searchResults', SearchResults);
