const SearchResultController = function( tribalServer ) {

  this.addSongButtonHandler = () => {
    // tribalServer.addSong( this.searchResult );
    console.log(this.searchResult);

    // call api to add song to playlist
    /*
    Need:
    - accountId (from db)
    - accessToken (from db)
    - refreshToken (from db)
    - playlistId
    - songId: this.searchResult
    */
  };
};

const SearchResult = function() {
  return {
    scope: {
      searchResult: '<',
    },
    restrict: 'E',
    controller: [ 'tribalServer', SearchResultController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/searchResult.html'
  };
};

angular.module('tribal').directive('searchResult', SearchResult);
