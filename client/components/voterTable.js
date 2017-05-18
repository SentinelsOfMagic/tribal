const VoterTable = function() {
  return {
    scope: {
      ownerId: '<',
      playlistId: '<'
    },
    restrict: 'E',
    controller: [ ],
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/voterTable.html'
  };
};

angular.module('tribal').directive('voterTable', VoterTable);
