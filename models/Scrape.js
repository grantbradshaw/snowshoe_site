const User = require('./User');
const AgendaJob = require('./AgendaJob');
const conditionMetNotification = require('../mailer/condition_met_notification');
const mongoose = require('mongoose');

var alertSchema = new mongoose.Schema({
  operator: { type: String, default: '<' },
  comparator: Number,
  message: String,
  conditionMet: { type: Boolean, default: false }
});

var scrapeSchema = new mongoose.Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  url: { type: String, required: true },
  selector: {type: String, required: true },
  data: { type: Number, required: true },
  status: { 
            type: String, 
            default: 'new',
            enum: ['new', 'set', 'found'],
            required: true
          },
  alert: alertSchema,
  meetsCondition: {type: Boolean, default: false, required: false }
}, { timestamps: true });


/**
 * Track alert middleware to check if condition is met.
 */
scrapeSchema.pre('save', function(next) {
  if (this.alert.comparator && this.alert.conditionMet === false && this.data < this.alert.comparator) {
    this.alert.conditionMet = true;
  }
  next();
});

scrapeSchema.pre('save', function(next) {
  if (this.data <= 0) {
    var err = new Error('Cannot save price when less than or equal to 0')
    next(err);
  } else {
    next();
  }
});

/**
 * Remove track id from user document.
 */
scrapeSchema.post('remove', function(scrape) {
  User.findOne({ _id: scrape._userId }, function(err, user) {
    var jobName = 'scrape ' + scrape.id;
    
    user.scrapeIds.pull(scrape.id);
    user.save();

    // Remove related scrape job if it exists.
    AgendaJob.findOne({ name: jobName }, function(err, job) {
      if (job) job.remove();
    });
  });
});


/**
 * Helper method for track URL.
 */
scrapeSchema.virtual('path').get(function() {
  return 'http://localhost:3000/tracks/' + this.id;
});


module.exports = mongoose.model('Scrape', scrapeSchema);