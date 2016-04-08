const Track = require('../models/Track');
const User = require('../models/User');
const scrapePages = require('../helpers/scrape_pages');

module.exports = function(agenda, jobName) {
  agenda.define(jobName, function(job, done) {
    Track.findOne({ '_id': job.attrs.data.trackId }, function(err, track) {

      scrapePages(track, function(track) {
        track.save(function(err) {
          if (err) return console.error(err);

          console.log('Track ' + track.id + ' saved');
          console.log('-----------');
        });
      });

      done();
    });
  });
}