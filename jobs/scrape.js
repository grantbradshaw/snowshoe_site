const Scrape = require('../models/Scrape');
const User = require('../models/User');
const scrapePage = require('../helpers/scrape_pages');
const conditionMetNotification = require('../mailer/condition_met_notification');

var notifyUser = function(scrape) {
  User.findOne({ _id: scrape._userId }, function(err,user) {
    conditionMetNotification(user, scrape);
  });
}

module.exports = function(agenda, jobName) {
  agenda.define(jobName, function(job, done) {
    Scrape.findOne({ '_id': job.attrs.data.scrapeId }, function(err, scrape) {

      scrapePage(scrape, function(scrape, price) {
        scrape.data = price;

        scrape.save(function(err) {
          if (err) return console.error(err);

          console.log('Track ' + scrape.id + ' saved');
          console.log('-----------');

          if (scrape.alert.conditionMet && scrape.status == 'set') {
            notifyUser(scrape);
            scrape.status = 'found';
          }
        });
      });

      done();
    });
  });
}