const Track = require('../models/Track');
const User = require('../models/User');
const prettyDate = require('pretty-date');
const scrapePages = require('../helpers/scrape_pages');
const prettyAlertOperator = require('../helpers/pretty_alert_operator');
const cleanNumberData = require('../helpers/clean_number_data');

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

function addTrackToUser(id, track) {
  User.update({ _id: id },
  { $push: { trackIds: track.id }},
  function(err, user) {
    if (err) {
      return console.error(err);
    }
  });
}

exports.getTracks = function(req, res) {
  Track.find({
    '_id': { $in: req.user.trackIds }
  }, function(err, tracks) {
    res.render('tracks', {
      title: 'My tracks',
      tracks: tracks,
      prettyTrackStatus: prettyTrackStatus,
      prettyDate: prettyDate
    });
  });
}

exports.getTrack = function(req, res) {
  Track.findOne({ '_id': req.params.id }, function(err, track) {
    var alertOperator;
    var alertComparator;
    var alertMessage;
    var lessThanSelected = true;
    var notOwnedByCurrentUser = req.user.trackIds.indexOf(req.params.id) === -1;

    if (err || notOwnedByCurrentUser) {
      res.status(404).send('Page not found.');
      return console.error(err);
    }

    // Set alert values if they exist
    if (track.alert) {
      alertOperator = track.alert.operator || '<';
      alertComparator = track.alert.comparator || '';
      alertMessage = track.alert.message || '';
    }

    // Set the selected operator dropdown
    if (alertOperator && alertOperator == '>') {
      lessThanSelected = false;
    }

    res.render('tracks/show', {
      title: track.name,
      track: track,
      lessThanSelected: lessThanSelected,
      alertComparator: alertComparator,
      alertMessage: alertMessage,
      prettyDate: prettyDate,
      prettyAlertOperator: prettyAlertOperator
    });
  });
}

exports.postTrack = function(req, res, next) {
  var name = req.body['trackName'];
  var pages = req.body.pages;

  console.log('Total pages:', Object.keys(pages).length);

  var track = new Track({
    _userId: req.user.id,
    name: name.toString(),
    alert: {},
    pages: []
  });

  // Add pages to track.
  for (pageURL in pages) {
    track.pages.push({
      url: pageURL,
      scrapes: []
    });
  }

  // Add selection name and selector to each page.
  track.pages.forEach(function(page) {
    var scrapes = pages[page.url];

    scrapes.forEach(function(scrape) {
      page.scrapes.push({
        name: scrape.name.toString(),
        selector: scrape.path,
        data: cleanNumberData(scrape.content)
      });
    });
  });

  // Save initial track data and respond with link.
  track.save(function(err) {
    if (err) return console.error(err);

    addTrackToUser(req.user.id, track);
    console.log(track);
    console.log('Track ' + track.id + ' saved');
    console.log('-----------');
    res.send({ trackURL: 'http://localhost:3000/tracks/' + track.id });
  });

  scrapePages(track, function(track) {
    track.save(function(err) {
      if (err) return console.error(err);

      console.log('Track ' + track.id + ' scraped from backend.');
      console.log('-----------');
    });
  });

}

exports.deleteTrack = function(req, res) {
  Track.findOne({ _id: req.params.id }, function(err, track) {
    // error handling
    track.remove();
    res.send({ redirect: '/tracks' });
  });
}