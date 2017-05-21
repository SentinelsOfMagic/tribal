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

  this.voteInputHandler = (upvotes, downvotes, index) => {
    this.Upvotes = upvotes;
    this.Downvotes = downvotes;
    console.log('expecting upvotes and downvotes???', this.Upvotes, this.Downvotes);
  };

  tribalServer.registerVote(this.voteInputHandler);
})

.directive('voterTable', function() {
  return {
    scope: {
      songs: '<',
      votingHandler: '<',
      upvotes: '<',
      downvotes: '<'
    },
    restrict: 'E',
    controller: 'voterTableController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/voterTable.html'
  };
});

