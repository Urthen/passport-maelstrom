var express = require("express"),
	passport = require("passport"),
	MaelstromStrategy = require("../../lib/passport-maelstrom").Strategy,
	port = process.env.PORT || 4000,

  // You'll need to change these values.
	APP_ID = "5063bffa36d0a20200000004",
	APP_SECRET = "d709fd6536499d1f8ad4";


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the MaelstromStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Maelstrom
//   token info), and invoke a callback with a user object.
passport.use(new MaelstromStrategy({
    clientID: APP_ID,
    clientSecret: APP_SECRET,
    callbackURL: "http://localhost:4000/auth/maelstrom/callback",
    scope: "basicInfo.preferredName"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      
      // To keep the example simple, the user's token informaion is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Maelstrom information with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }
));

// Setup Express Application
var app = express();
app.configure(function () {
		app.set("views", __dirname + "/views/");
		app.set("view engine", "jade");
		app.use(express.bodyParser());
		app.use(express.methodOverride());
		app.use(express.cookieParser());
		app.use(express.session({ secret: 'charybdis'}));
		app.use(passport.initialize());
		app.use(passport.session());
		app.use(app.router);
		app.use(express.static(__dirname + "/static/"));
		app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	});


app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

// GET /auth/maelstrom
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Maelstrom authentication will involve
//   redirecting the user to the Maelstrom Network.  After authorization, Maelstrom will
//   redirect the user back to this application at /auth/maelstrom/callback
app.get('/auth/maelstrom', passport.authenticate('maelstrom'));

// GET /auth/maelstrom/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/maelstrom/callback', passport.authenticate('maelstrom', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

// Good to go, brah
app.listen(port, function () {
	console.log("Express server listening on port %d in %s mode", port, app.settings.env);
});