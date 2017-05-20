const SearchResultController = function($location, tribalServer) {

  this.addSongButtonHandler = () => {
    // tribalServer.addSong( this.searchResult );
    this.playlistHash = $location.search().playlist;
    console.log('searchResult:', this.searchResult);
    console.log('playlistHash:', this.playlistHash);

    tribalServer.addSong(this.playlistHash, this.searchResult.uri, this.searchResult.artist, this.searchResult.title);
  };
};

const SearchResult = function() {
  return {
    scope: {
      searchResult: '<'
    },
    restrict: 'E',
    controller: [ '$location', 'tribalServer', SearchResultController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/searchResult.html'
  };
};

angular.module('tribal').directive('searchResult', SearchResult);
