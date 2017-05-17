angular.module( 'tribal', [] )

  .config( function($locationProvider, $sceDelegateProvider) {

    $locationProvider.html5Mode({
      enabled: true,
      requireBase: false,
      rewriteLinks: false
    });

    $sceDelegateProvider.resourceUrlWhitelist([
      'self',
      'https://open.spotify.com/**'
    ]);

  });
