// 'use strict';

// const Scrape = require('../models/Scrape');
// const conditionMetNotification = require('../mailer/condition_met_notification');
// const prettyDate = require('pretty-date');
// const agenda = require('../config/agenda');
// const scrape = require('../jobs/scrape');

// exports.postAlert = function(req, res) {
//   req.assert('alertOperator', 'Alert operator can\'t be empty').notEmpty();
//   req.assert('alertComparator', 'Alert comparator can\'t be empty').notEmpty();
//   req.checkBody('alertComparator', 'The price must be less than $' + req.body.lowestPrice + ' – the current cheapest item.').comparatorLowerThan(req.body.lowestPrice); 
//   // definitely requires two arguments for comparison

//   var validationErrors = req.validationErrors();

//   Scrape.findOne({ '_id': req.params.id}, function(err, track) {
//     if (err) return console.error(err);

//     if (validationErrors) {
//       var lessThanSelected;

//       req.flash('errors', validationErrors);

//       // Set the selected operator dropdown
//       lessThanSelected = req.body.alertOperator == '<';

//       return res.render('tracks/show', {
//         title: track.name,
//         track: track,
//         lessThanSelected: lessThanSelected,
//         alertComparator: req.body.alertComparator || '',
//         prettyDate: prettyDate,
//         displayAlertForm: true,
//         prettyAlertOperator: prettyAlertOperator
//       });
//     }

//     // Upsert valid track alert.
//     scrape.alert = {
//       operator: req.body.alertOperator,
//       comparator: Number(req.body.alertComparator),
//       conditionMet: track.alert.conditionMet // Required, otherwise it will revert to default value.
//     }

//     // Create scrape job 
//     console.log('Create scrape job');
//     var jobName = 'scrape ' + scrape._id;
//     scrape(agenda, jobName);
//     agenda.every('30 seconds', jobName, { scrapeId: scrape._id });

//     // Update track status.
//     scrape.status = 'set';

//     scrape.save(function (err) {
//       if (err) return console.error(err);
//       console.log('Saved alert to track');
//     }).then(function () {
//       // Check if alert condition is met.
//       // If met, send notification email to user.
//       if (scrape.alert && scrape.alert.conditionMet) {
//         console.log('Condition is met. Sending email...'); // may be superfluous 
//         conditionMetNotification(req, scrape);
//       }
//     });

//     return res.redirect('/tracks/' + req.params.id);
//   });
// }