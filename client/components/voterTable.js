const voterTableController = function(tribalServer, $scope) {
  this.voteInputHandler = (upvotes, downvotes, index) => {
    this.Upvotes = upvotes;
    this.Downvotes = downvotes;
    console.log('expecting upvotes and downvotes???', this.Upvotes, this.Downvotes);
    $scope.$apply();
  };

  tribalServer.registerVote(this.voteInputHandler);
};

const VoterTable = function() {
  return {
    scope: {
      songs: '<',
      votingHandler: '<',
      upvotes: '<',
      downvotes: '<'
    },
    restrict: 'E',
    controller: ['tribalServer', '$scope', voterTableController],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/voterTable.html'
  };
};

angular.module('tribal').directive('voterTable', VoterTable);
