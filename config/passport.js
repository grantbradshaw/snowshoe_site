'use strict';

// const _ = require('lodash');
const passport = require('passport');
// const request = require('request');
const localStrategy = require('passport-local').Strategy;

const User = require('../models/User');

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err, user);
  });
});

// sign in using email and password
passport.use(new localStrategy({ usernameField: 'email' }, function(email, password, done){
  email = email.toLowerCase();
  User.findOne({ email: email }, function(err, user) {
    if (!user){
      return done(null, false, { message: 'Email ' + email + ' not found'});
    }
    user.comparePassword(password, function(err, isMatch) {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { messsage: 'Invalid email or password. '});
      }
    });
  });
}));

// login required middleware
exports.isAuthenticated = function(req, res, next){
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

// have not defined isAuthorized as no api enabling