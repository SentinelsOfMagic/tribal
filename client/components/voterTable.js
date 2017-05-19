angular.module('tribal')
.controller('voterTableController', function(tribalServer) {
  this.votingHandler = (vote, songId) => {
    console.log('songId', songId);
    tribalServer.insertVotes(vote, songId, (res) => {
      console.log('expect just checking', res.checking);
    });
  };
})

.directive('voterTable', function() {
  return {
    scope: {
      songs: '<'
    },
    restrict: 'E',
    controller: 'voterTableController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/voterTable.html'
  };
});

