const SearchResultController = function( tribalServer ) {

  this.addSongButtonHandler = () => {
    // tribalServer.addSong( this.searchResult );
    console.log(this.searchResult);
    console.log('playlistHash:', this.playlistHash);

    tribalServer.addSong(this.playlistHash, this.searchResult);

    // call api to add song to playlist
    /*
    Need:
    - accountId (from db)
    - accessToken (from db)
    - playlistHash
    - songId: this.searchResult
    */
  };
};

const SearchResult = function() {
  return {
    scope: {
      searchResult: '<',
      playlistHash: '<'
    },
    restrict: 'E',
    controller: [ 'tribalServer', SearchResultController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/searchResult.html'
  };
};

angular.module('tribal').directive('searchResult', SearchResult);
