const Promise = require('bluebird');
const _ = require('underscore');

const expect = require('chai').expect;
const request = require('supertest');

const server = require('../core');
const io = require('socket.io-client');

const db = require('../database');
const mongoDriver = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const testData = require('./testData');

describe( 'tribal server:', function() {

  describe( 'database layer:', function() {

    let mongo;

    before( function() {
      return mongoDriver.connect( db.mongoose.DATABASE_URL, {promiseLibrary: Promise} )
        .then( (mongoDb) => {
          mongo = mongoDb;
        });
    });

    after( function() {
      return mongo.close();
    });

    beforeEach( function() {
      return mongo.collection('playlists').deleteMany()
        .then( () => {
          testData.playlists.forEach( (playlist) => {
            playlist._id = new ObjectID();
          });
          return mongo.collection('playlists').insertMany(testData.playlists);
        });
    });

    describe( 'getAllPlaylists', function() {

      it( 'reads all playlists', function() {

        return db.getAllPlaylists()
          .then( (playlists) => {
            playlists = playlists.map( (playlist) => playlist.toObject() );
            playlists = _(playlists).sortBy( '_id' );
            let expected = _(testData.playlists).sortBy( '_id' );
            expect(playlists).to.deep.equal(expected);
          });
      });
    });

    describe( 'getSinglePlaylist', function() {

      it( 'correctly finds a playlist by id', function() {

        let expectedPlayList = testData.playlists[0];

        return db.getSinglePlaylist(expectedPlayList._id.toString())
          .then( (playlist) => {
            playlist = playlist.toObject();
            expect(playlist).to.deep.equal(expectedPlayList);
          });
      });

      it( 'correctly finds a playlist by name', function() {

        let expectedPlayList = testData.playlists[0];

        return db.getSinglePlaylist(expectedPlayList.name)
          .then( (playlist) => {
            playlist = playlist.toObject();
            expect(playlist).to.deep.equal(expectedPlayList);
          });
      });
    });

    describe( 'insertSong', function() {

      it( 'correctly adds a song to a playlist', function() {

        let newSong = { uri: 'spotify:track:6HLJuAenKW89zYAZOstC2z' };
        let expectedPlayList = _(testData.playlists[0]).clone();
        expectedPlayList.songs.push( newSong );
        let playListId = expectedPlayList._id;

        return db.insertSong(playListId, newSong)
          .then( (actualPlayList) => {
            let actualSongs = actualPlayList.songs.map( (song) => ({ uri: song.uri }) );
            expect(actualSongs).to.deep.equal(expectedPlayList.songs);
          });
      });
    });

    describe( 'createPlaylist', function() {

      let newListName = 'newList';

      it( 'successfully creates a playlist with the supplied name', function() {

        return db.getSinglePlaylist(newListName)
          .then( (list) => {
            expect(list).to.be.null;
            return db.createPlaylist(newListName);
          })
          .then( () => {
            return db.getSinglePlaylist(newListName);
          })
          .then( (newList) => {
            expect(newList instanceof db.mongoose.Model).to.be.true;
          });
      });

      it( 'returns the new playlist with the resolved promise', function() {

        return db.createPlaylist(newListName)
          .then( (newList) => {
            expect(newList instanceof db.mongoose.Model).to.be.true;
            expect(newList.name).to.equal(newListName);
          });
      });

      it( 'creates a playlist with no songs', function() {

        return db.createPlaylist(newListName)
          .then( (newList) => {
            expect(newList.songs.length).to.equal(0);
          });
      });
    });

  });

  describe( 'HTTP request handling', function() {

    it( 'returns status 200 in response to GET /', function() {
      // return is important; this is an asychronous operation, and it returns a promise
      // without the return, mocha doesn't know when the test has completed
      return request(server)
        .get('/')
        .expect(200);
    });

    it( 'verifies a database connection in response to GET /test', function() {
      // return is important; this is an asychronous operation, and it returns a promise
      // without the return, mocha doesn't know when the test has completed
      return request(server)
        .get('/test')
        .expect(200)
        .expect(server.DATABASE_CONNECTED_MESSAGE_PREFIX + server.DATABASE_CONNECTED_MESSAGE);
    });

    it( 'returns status 200 in response to GET /tracks', function() {

      this.timeout(5000);

      return request(server)
      .get('/tracks')
      .expect(200);
    });
  });

  describe( 'socket.io handling', function() {

    let client;

    before( function() {
      return server.start();
    });

    beforeEach( function(done) {
      const serverUrl = `http://localhost:${server.SERVER_PORT}`;
      const socketIoOptions = {
        transports: ['websocket'],
        'force new connection': true
      };

      client = io.connect( serverUrl, socketIoOptions );
      client.on( 'connect', done );
    });

    afterEach( function(done) {
      client.on( 'disconnect', () => {
        done();
      });
      client.disconnect();
    });

    it( 'can establish socket.io connections', function() {
      expect(client.id).to.not.be.undefined;
    });
  });
});
