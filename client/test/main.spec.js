describe( 'main', function() {

  // var expect = chai.expect;

  let element;
  let tribalServerTestSpy;
  const testResponse = { data: 'hello' };

  // the angular components we want to test are registered as part of this module
  // (main directive, and tribalServer service)
  beforeEach( module('tribal') );

  // karma-ng-html2js-preprocessor pre-loads all of our templates into an Angular template
  // cache, so they don't need to be fetched over HTTP.  Better for unit testing.
  // We access these cached templates by loading the 'templates' module.
  beforeEach( module('templates') );

  // replace some directives in the angular dependency directory with stubs/spies
  beforeEach( module(function($provide) {
    // someDirectiveSpy = sinon.stub().returns({});
    // $provide.factory('someDirective', someDirectiveSpy);
  }));

  // instantiate a <main> directive.  to do this, given angular's dependency injection
  // architecture, we need to use inject() to get access to all of the following items
  // in our beforeEach():
  //
  // $compiler, with which to instantiate the directive
  // the directive's compilation dependencies (an angular scope, and the tribalServer service)
  // $q, for use with stubbing out the tribalServer service for testing
  beforeEach( inject(function($compile, $rootScope, tribalServer, $q) {
    //debugger;
    var scope = $rootScope.$new();

    // stub out the tribalServer test function so it doesn't make an http request
    tribalServer.test = function() {
      return $q.resolve( testResponse );
    };
    tribalServerTestSpy = sinon.spy(tribalServer, 'test');

    element = angular.element('<main></main>');
    element = $compile(element)(scope);
    $rootScope.$digest();
  }));

  // it('should have a testFunc function on the scope', function() {
  //   expect(element.isolateScope().ctrl.testFunc).to.exist;
  //   expect(element.isolateScope().ctrl.testFunc).to.be.a('function');
  // });

  // it('should render a someDirective element', function() {
  //   expect(someDirectiveSpy.callCount).to.equal(1);
  // });

  it('should attempt to call tribalServer test API when the app is initialized', function() {
    expect(tribalServerTestSpy.callCount).to.equal(1);
  });

  it('should retrieve the tribalServer API test message', function() {
    expect(element.isolateScope().ctrl.messageFromServer).to.equal(testResponse.data);
  });

});
