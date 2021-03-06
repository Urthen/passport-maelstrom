/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Maelstrom authentication strategy authenticates requests by delegating to
 * Maelstrom using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Maelstrom application's App ID
 *   - `clientSecret`  your Maelstrom application's App Secret
 *   - `callbackURL`   URL to which Maelstrom will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new MaelstromStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/maelstrom/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'http://prototype.projectmaelstrom.com/auth/oauth/authorize';
  options.tokenURL = options.tokenURL || 'http://prototype.projectmaelstrom.com/auth/oauth/exchange';
  options.scope = options.scope || '';

  OAuth2Strategy.call(this, options, verify);

  this._tokenInfoURL = options.tokenInfoURL || 'http://prototype.projectmaelstrom.com/auth/info';
  this.name = 'maelstrom';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve token from Maelstrom.
 *
 * This function constructs a normalized profile. This will always consist of the following properties:
 *
 *   - `provider`         always set to `maelstrom`
 *   - `id`               a unique ID for user, specific to this application.
 *
 * A user may contain the following properties, depending on what information was requested and allowed:
 *   - `preferred_name`   The users' preferred name.
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.getProtectedResource(this._tokenInfoURL, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch token information', err)); }
    
    try {
      var json = JSON.parse(body);
      
      json.provider = "maelstrom";
      json._raw = body;
      
      done(null, json);
    } catch(e) {
      done(e);
    }
  });
}

/**
 * Define additional parameters to be set to Maelstrom.
 * 
 * Right now, this is just the Scope parameter, but may be added to in the future.
 * Options are those passed in above.
 */

Strategy.prototype.authorizationParams = function(options) {
  var params = {};
  if (options.scope && options.scope != '') {
    params.scope = options.scope;
  }
  return params;
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;