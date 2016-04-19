const Scrape = require('../models/Scrape');
const User = require('../models/User');
const prettyDate = require('pretty-date');
const scrapePages = require('../helpers/scrape_pages');
const prettyAlertOperator = require('../helpers/pretty_alert_operator');
const cleanNumberData = require('../helpers/clean_number_data');
const job_scrape = require('../jobs/scrape');
const agenda = require('../config/agenda');
const conditionMetNotification = require('../mailer/condition_met_notification');


function prettyTrackStatus(track) {
  var status;
  switch(track.status) {
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
    res.render('tracks', {
      title: 'My tracks',
      scrapes: scrapes,
      prettyTrackStatus: prettyTrackStatus,
      prettyDate: prettyDate
    });
  });
}

exports.getScrape = function(req, res) {
  Scrape.findOne({ '_id': req.params.id }, function(err, scrape) {
    var alertOperator;
    var alertComparator;
    var alertMessage;
    var lessThanSelected = true;
    var notOwnedByCurrentUser = req.user.scrapeIds.indexOf(req.params.id) === -1;

    if (err || notOwnedByCurrentUser) {
      res.status(404).send('Page not found.');
      return console.error(err);
    }

    // Set alert values if they exist
    if (scrape.alert) {
      alertOperator = scrape.alert.operator || '<';
      alertComparator = scrape.alert.comparator || '';
      alertMessage = scrape.alert.message || '';
    }

    // Set the selected operator dropdown
    if (alertOperator && alertOperator == '>') {
      lessThanSelected = false;
    }

    res.render('tracks/show', {
      scrape: scrape,
      lessThanSelected: lessThanSelected,
      alertComparator: alertComparator,
      alertMessage: alertMessage,
      prettyDate: prettyDate,
      prettyAlertOperator: prettyAlertOperator
    });
  });
}

exports.postScrape = function(req, res, next) {
  // var name = req.body['trackName'];
  // var pages = req.body.pages;

  //console.log('Total pages:', Object.keys(pages).length);

  var scrape = new Scrape({
    _userId: req.user.id,
    name: req.body.selector.name.toString(),
    url: req.body.url,
    selector: req.body.selector.path,
    data: cleanNumberData(req.body.selector.content),
    alert: {comparator: Number(req.body.selector.comparator)}
  });

  // Add pages to track.
  // for (pageURL in pages) {
  //   track.pages.push({
  //     url: pageURL,
  //     scrapes: []
  //   });
  // }

  // Add selection name and selector to each page.
  // track.pages.forEach(function(page) {
  //   var scrapes = pages[page.url];

  //   scrapes.forEach(function(scrape) {
  //     page.scrapes.push({
  //       name: scrape.name.toString(),
  //       selector: scrape.path,
  //       data: cleanNumberData(scrape.content)
  //     });
  //   });
  // });

  console.log('Creating scrape job');
  var jobName = 'scrape ' + scrape._id;
  job_scrape(agenda, jobName);
  agenda.every('30 seconds', jobName, { scrapeId: scrape._id });

  scrape.status = 'set';

  // Save initial track data and respond with link.
  scrape.save(function(err) {
    if (err) return console.error(err);

    addScrapeToUser(req.user.id, scrape);
    console.log(scrape);
    console.log('Scrape ' + scrape.id + ' saved');
    console.log('-----------');
    //res.send({ trackURL: 'http://localhost:3000/tracks/' + scrape.id });
  }).then(function(){
    if (scrape.alert && scrape.alert.conditionMet) {
      console.log('Condition is met. Sending email...');
      conditionMetNotification(req, scrape); // check if this works w/ post to User
    }
  });

  // scrapePages(scrape, function(track) {
  //   scrape.save(function(err) {
  //     if (err) return console.error(err);

  //     console.log('Scrape ' + scrape.id + ' scraped from backend.');
  //     console.log('-----------');
  //   });
  // });

}

exports.deleteTrack = function(req, res) {
  Track.findOne({ _id: req.params.id }, function(err, track) {
    // error handling
    track.remove();
    res.send({ redirect: '/tracks' });
  });
}