var vows = require('vows');
var assert = require('assert');
var util = require('util');
var MaelstromStrategy = require('passport-maelstrom/strategy');


vows.describe('MaelstromStrategy').addBatch({
  
  'strategy': {
    topic: function() {
      return new MaelstromStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
    },
    
    'should be named maelstrom': function (strategy) {
      assert.equal(strategy.name, 'maelstrom');
    },
  },
  
  'strategy when loading user profile': {
    topic: function() {
      var strategy = new MaelstromStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
        var body = '{"id":"dfb39a201c638cc4276309e2e450133d3cce2b9f","name":"Michael Pratt"}';
        
        callback(null, body, undefined);
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should not error' : function(err, req) {
        assert.isNull(err);
      },
      'should load profile' : function(err, profile) {
        assert.equal(profile.provider, 'maelstrom');
        assert.equal(profile.id, 'dfb39a201c638cc4276309e2e450133d3cce2b9f');
      },
      'should set raw property' : function(err, profile) {
        assert.isString(profile._raw);
      }
    },
  },
  
  'strategy when loading user profile and encountering an error': {
    topic: function() {
      var strategy = new MaelstromStrategy({
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {});
      
      // mock
      strategy._oauth2.getProtectedResource = function(url, accessToken, callback) {
        callback(new Error('something-went-wrong'));
      }
      
      return strategy;
    },
    
    'when told to load user profile': {
      topic: function(strategy) {
        var self = this;
        function done(err, profile) {
          self.callback(err, profile);
        }
        
        process.nextTick(function () {
          strategy.userProfile('access-token', done);
        });
      },
      
      'should error' : function(err, req) {
        assert.isNotNull(err);
      },
      'should wrap error in InternalOAuthError' : function(err, req) {
        assert.equal(err.constructor.name, 'InternalOAuthError');
      },
      'should not load profile' : function(err, profile) {
        assert.isUndefined(profile);
      },
    },
  },
  
}).export(module);