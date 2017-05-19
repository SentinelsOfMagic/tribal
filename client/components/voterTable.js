angular.module('tribal')
.controller('voterTableController', function(tribalServer) {
  console.log('this object', this);
  this.songsFromPlaylist = [{}, {}, {}];
  this.someEventHandler = (vote) => {
    tribalServer.insertVotes(vote);
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

