const SongVoteController = function(tribalServer) {
  this.someEventHandler = () => {
    tribalServer.putStuffInDataBase();
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
