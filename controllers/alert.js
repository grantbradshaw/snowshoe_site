const Track = require('../models/Track');
const conditionMetNotification = require('../mailer/condition_met_notification');
const prettyDate = require('pretty-date');
const agenda = require('../config/agenda');
const scrape = require('../jobs/scrape');
const prettyAlertOperator = require('../helpers/pretty_alert_operator');

exports.postAlert = function(req, res, next) {
  req.assert('alertOperator', 'Alert operator can\'t be empty').notEmpty();
  req.assert('alertComparator', 'Alert comparator can\'t be empty').notEmpty();
  req.checkBody('alertComparator', 'The price must be less than $' + req.body.lowestPrice + ' – the current cheapest item.').comparatorLowerThan(req.body.lowestPrice); 
  // definitely requires two arguments for comparison

  var validationErrors = req.validationErrors();

  Track.findOne({ '_id': req.params.id}, function(err, track) {
    if (err) return console.error(err);

    if (validationErrors) {
      var lessThanSelected;

      req.flash('errors', validationErrors);

      // Set the selected operator dropdown
      req.body.alertOperator == '<' ? lessThanSelected = true : lessThanSelected = false;

      return res.render('tracks/show', {
        title: track.name,
        track: track,
        lessThanSelected: lessThanSelected,
        alertComparator: req.body.alertComparator || '',
        prettyDate: prettyDate,
        displayAlertForm: true,
        prettyAlertOperator: prettyAlertOperator
      });
    }

    // Upsert valid track alert.
    track.alert = {
      operator: req.body.alertOperator,
      comparator: Number(req.body.alertComparator),
      conditionMet: track.alert.conditionMet // Required, otherwise it will revert to default value.
    }

    // Create scrape job
    console.log('Create scrape job');
    var jobName = 'scrape ' + track._id;
    scrape(agenda, jobName);
    agenda.every('1 minute', jobName, { trackId: track._id });

    // Update track status.
    track.status = 'set';

    track.save(function (err) {
      if (err) return console.error(err);
      console.log('Saved alert to track');
    }).then(function () {
      // Check if alert condition is met.
      // If met, send notification email to user.
      if (track.alert && track.alert.conditionMet) {
        console.log('Condition is met. Sending email...'); // may be superfluous 
        conditionMetNotification(req, track);
      }
    });

    return res.redirect('/tracks/' + req.params.id);
  });
}