const Scrape = require('../models/Scrape');
const User = require('../models/User');
const prettyDate = require('pretty-date');
const scrapePages = require('../helpers/scrape_pages');
const cleanNumberData = require('../helpers/clean_number_data');
const job_scrape = require('../jobs/scrape');
const agenda = require('../config/agenda');
const conditionMetNotification = require('../mailer/condition_met_notification');
const shorten = require('../helpers/shorten');


function prettyTrackStatus(scrape) {
  var status;
  switch(scrape.status) {
    case 'new':
      status = 'New';
      break;
    case 'set':
      status = 'Alert set';
      break;
    case 'found':
      status = 'In price range';
      break;
    default:
      status = 'Unknown';
  }
  return status;
}

function addScrapeToUser(id, scrape) {
  User.update({ _id: id },
  { $push: { scrapeIds: scrape.id }},
  function(err, user) {
    if (err) {
      return console.error(err);
    }
  });
}

exports.getScrapes = function(req, res) {
  Scrape.find({_userId: req.user.id}, function(err, scrapes) {
    res.render('scrapes', {
      title: 'My scrapes',
      scrapes: scrapes,
      prettyTrackStatus: prettyTrackStatus,
      prettyDate: prettyDate,
      shorten: shorten
    });
  });
}

// exports.getScrape = function(req, res) {
//   Scrape.findOne({ '_id': req.params.id }, function(err, scrape) {
//     var alertOperator;
//     var alertComparator;
//     var alertMessage;
//     var lessThanSelected = true;
//     var notOwnedByCurrentUser = req.user.scrapeIds.indexOf(req.params.id) === -1;

//     if (err || notOwnedByCurrentUser) {
//       res.status(404).send('Page not found.');
//       return console.error(err);
//     }

//     // Set alert values if they exist
//     if (scrape.alert) {
//       alertOperator = scrape.alert.operator || '<';
//       alertComparator = scrape.alert.comparator || '';
//       alertMessage = scrape.alert.message || '';
//     }

//     // Set the selected operator dropdown
//     if (alertOperator && alertOperator == '>') {
//       lessThanSelected = false;
//     }

//     res.render('tracks/show', {
//       scrape: scrape,
//       lessThanSelected: lessThanSelected,
//       alertComparator: alertComparator,
//       alertMessage: alertMessage,
//       prettyDate: prettyDate,
//       prettyAlertOperator: prettyAlertOperator
//     });
//   });
// }

exports.postScrape = function(req, res, next) {
  // var name = req.body['trackName'];
  // var pages = req.body.pages;

  //console.log('Total pages:', Object.keys(pages).length);

  console.log('posting');
  res.send({ success: true });
  req.body.forEach(function(selection) {
    var scrape = new Scrape({
      _userId: req.user.id,
      name: selection.selector.name.toString(),
      url: selection.url,
      selector: selection.selector.path,
      data: cleanNumberData(selection.selector.content),
      alert: {comparator: Number(selection.selector.comparator)},
      status: 'set'
    });

    // Save initial track data and respond with link.
    scrape.save(function(err) {
      if (err) return console.error(err);

      addScrapeToUser(req.user.id, scrape);
      console.log(scrape);
      console.log('Scrape ' + scrape.id + ' saved');
      console.log('-----------');
    })
      .then(function(){
        console.log('Creating scrape job');
        var jobName = 'scrape ' + scrape._id;
        job_scrape(agenda, jobName);
        agenda.every('4 hours', jobName, { scrapeId: scrape._id });
      })
      .then(function(){
        if (scrape.alert && scrape.alert.conditionMet) {
          console.log('Condition is met. Sending email...');
          conditionMetNotification(req, scrape); // check if this works w/ post to User
        }
    });
  });
}

exports.deleteScrape = function(req, res) {
  Scrape.findOne({ _id: req.params.scrapeId }, function(err, scrape) {
    if (err) return console.error(err);
    scrape.remove();
    res.send({ success: true });
  });
}

exports.editScrape = function(req, res) {
  Scrape.findOne({ _id: req.params.scrapeId }, function(err, scrape) {
    if (err) return console.error(err);

    req.assert('comparator', 'Comparator must be a number').isNumeric();
    req.assert('comparator', 'Comparator must be less than current price').comparatorLowerThan(scrape.data);

    var errors = req.validationErrors();

    if (errors) {
      res.send({ success: false, errors: errors });
    } else {
      scrape.alert.comparator = Number(req.body.comparator);
      scrape.save();
      res.send({ success: true }); 
    }    
  });
}