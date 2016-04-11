const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto'); // is this deprecated?
const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  email: { 
          type: String, 
          unique: true, 
          lowercase: true,
          required: true,
          validate: {
            validator: function(e){
              return validator.isEmail(e)
            },
            message: 'Not a valid email'
          }},
  password: { 
              type: String, 
              required: true, 
              minlength: 6,
              match: /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
             },
  tokens: Array,
  profile: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
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

// removes associated tracks to user on deleting account
userSchema.post('remove', function(user) {
  mongoose.model('Track').find({_id: {$in: user.trackIds}}, function(err, tracks){
    if (err) console.error(err);
    tracks.forEach(function(track){
      var jobName = 'scrape ' + track.id;
      mongoose.model('AgendaJob').findOne({ name: jobName }, function(err, job){
        if (err) console.error(job);
        if (job) job.remove();
      });
    });
    mongoose.model('Track').remove({_id: {$in: user.trackIds}}).exec();
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