angular.module('tribal')
.controller('voterTableController', function(tribalServer) {

  this.songsFromPlaylist = [{}, {}, {}];
  this.someEventHandler = (vote) => {
    tribalServer.insertVotes(vote);
  };

  tribalServer.grabSongsFromPlaylist(this.playlisthash)
    .then(res => {
      console.log('array of songs', res.data);
      this.songsFromPlaylist = res.data;
    })
    .catch(err => {
      console.log('trouble getting the songs in frontend', err);
    });
})

.directive('voterTable', function() {
  return {
    scope: {
      playlistHash: '<'
    },
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
