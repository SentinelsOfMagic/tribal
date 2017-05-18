const SongVoteController = function(tribalServer, vote) {
  this.someEventHandler = (vote) => {
    tribalServer.putStuffInDataBase(vote);
  };
};

const SongVoteRow = function() {
  return {
    scope: {},
    restrict: 'E',
    controller: ['tribalServer', SongVoteController],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/songVoteRow.html'
  };
};

angular.module('tribal').directive('songVoteRow', SongVoteRow);
