const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto'); // is this deprecated?
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, lowercase: true },
  password: String,
  tokens: Array, // is this necessary?
  profile: {
    firstName: String,
    lastName: String,
    picture: { type: String, default: '' }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  trackIds: { type: Array, index: true }
}, { timestamps: true });


// password hashing middleware
userSchema.pre('save', function(next){
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt){
    if (err){
      return next(err)
    }
    bcrypt.hash(user.password, salt, null, function(err, hash){
      if (err){
        return next(err)
      }
      user.password = hash;
      next();
    });
  });
}); 

// helper for validating passwords
userSchema.methods.comparePassword = function(candidatePassword, cb){
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch){
    if (err){
      return cb(err)
    }
    cb(null, isMatch)
  });
}

// helper for getting gravatars
userSchema.methods.gravatar = function(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}

// helper for formatting full name
userSchema.methods.fullName = function(){
  if (this.profile.firstName && this.profile.lastName){
    return this.profile.firstName + ' ' + this.profile.lastName
  }
}

module.exports = mongoose.model('User', userSchema)