angular.module('tribal')
.controller('voterTableController', function(tribalServer) {
  // this.votingHandler = (vote, songId) => {
  //   tribalServer.insertVotes(vote, songId, (res) => {
  //     console.log('upvotes', res.upvotes);
  //     console.log('downvotes', res.downvotes);
  //     this.upvotes = res.upvotes;
  //     this.downvotes = res.downvotes;

  //   });
  // };
})

.directive('voterTable', function() {
  return {
    scope: {
      songs: '<',
      votingHandler: '<'
    },
    restrict: 'E',
    controller: 'voterTableController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/voterTable.html'
  };
});

