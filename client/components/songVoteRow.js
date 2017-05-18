const SongVoteController = function(tribalServer) {
  this.someEventHandler(this.upVoteOrDownVote);
};

const SongVoteRow = function(tribalServer) {
  return {
    scope: {
      ownerId: '<',
      playlistId: '<'
    },
    restrict: 'E',
    controller: [ 'tribalServer', '$location', '$scope', SongVoteController ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/songVoteRow.html'
  };
};

angular.module('tribal').directive('songVoteRow', SongVoteRow);
