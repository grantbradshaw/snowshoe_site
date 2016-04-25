// dependencies
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const errorHandler = require('errorhandler');
const sass = require('node-sass-middleware');
const compress = require('compression');
const dotenv = require('dotenv');
const favicon = require('serve-favicon');
const logger = require('morgan');
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('express-flash');
const passport = require('passport');
const customValidators = require('./config/custom_validators');
const cors = require('cors');
const lusca = require('lusca');

// load the environment variables
dotenv.load();

// controllers
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const scrapeController = require('./controllers/scrape');
const alertController = require('./controllers/alert');
const selectionController = require('./controllers/selection');

// passport configuration
const passportConf = require('./config/passport');

// create Express server
const app = express();

// connect to MongoDB
mongoose.connect(process.env.MONGODB || process.env.MONGOLAB_URI || process.env.MONGODB_URI); // added last handler for heroku setup
mongoose.connection.on('error', function() {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

// create agenda to manage jobs
const agenda = require('./config/agenda');


// express configuration
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
app.use(logger('dev'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator(customValidators));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB || process.env.MONGOLAB_URI || process.env.MONGODB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(cors());
app.use(lusca({
  csrf: false,
  xframe: 'SAMEORIGIN',
  xssProtection: true
}));
app.use(function(req, res, next){
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));


// routing
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/scrapes', passportConf.isAuthenticated, scrapeController.getScrapes);
// app.get('/tracks/:id', passportConf.isAuthenticated, scrapeController.getScrape);
app.post('/scrapes', passportConf.isAuthenticated, scrapeController.postScrape);
// app.post('/scrapes/:id', passportConf.isAuthenticated, scrapeController.postScrape);
// app.delete('/tracks/:id', passportConf.isAuthenticated, scrapeController.deleteScrape);
// app.post('/tracks/:id/alerts', passportConf.isAuthenticated, alertController.postAlert);
// app.post('/tracks/:trackId/selections/:selectionId/delete', passportConf.isAuthenticated, selectionController.deleteSelection);
app.get('/account', passportConf.isAuthenticated, userController.getAccount);
app.post('/account/profile', passportConf.isAuthenticated, userController.postUpdateProfile);
app.post('/account/password', passportConf.isAuthenticated, userController.postUpdatePassword);
app.post('/account/delete', passportConf.isAuthenticated, userController.postDeleteAccount);
app.get('/account/unlink/:provider', passportConf.isAuthenticated, userController.getOauthUnlink);


// error handling
app.use(errorHandler());


// starting express server
app.listen(app.get('port'), function(){
  console.log('Listening on port %d in environment %s', app.get('port'), app.get('env'))
});

module.exports = app;