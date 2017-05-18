angular.module('tribal')
.controller('voterTableController', function(tribalServer) {
  this.friends = [{}, {}, {}];
  this.someEventHandler = (vote) => {
    tribalServer.putStuffInDataBase(vote);
  };
  //tribalServer.grabSongsFromPlaylist = function(playlistHash) {
    //
  // }
})

.directive('voterTable', function() {
  return {
    scope: {},
    restrict: 'E',
    controller: 'voterTableController',
    controllerAs: 'ctrl',
    bindToController: true,
    templateUrl: '/templates/voterTable.html'
  };
});




// const VoterTable = function() {
//   return {
//     scope: {
//       ownerId: '<',
//       playlistId: '<'
//     },
//     restrict: 'E',
//     controller: () => {},
//     controllerAs: 'ctrl',
//     bindToController: true,
//     templateUrl: '/templates/voterTable.html'
//   };
// };

// angular.module('tribal').directive('voterTable', VoterTable);
