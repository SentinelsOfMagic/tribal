angular.module('tribal')

.controller('SongVoteController', function(tribalServer, vote) {

  this.someEventHandler = (vote) => {
    tribalServer.putStuffInDataBase(vote);
  };

})

.directive('songVoteRow', function() {
  return {
    scope: {},
    restrict: 'E',
    controller: 'SongVoteController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/songVoteRow.html'
  };
});
