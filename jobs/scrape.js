'use strict';

const Scrape = require('../models/Scrape');
const User = require('../models/User');
const scrapePage = require('../helpers/scrape_pages');
const conditionMetNotification = require('../mailer/condition_met_notification');
const alertDeveloper = require('../mailer/alert_developer');

var notifyUser = function(scrape, body) {
  alertDeveloper(scrape, body);
  User.findOne({ _id: scrape._userId }, function(err,user) {
    conditionMetNotification(user, scrape);
  });
};

module.exports = function(agenda, jobName) {
  agenda.define(jobName, function(job, done) {
    Scrape.findOne({ '_id': job.attrs.data.scrapeId }, function(err, scrape) {
      scrapePage(scrape, function(scrape, price, body) {
        scrape.data = price;

        scrape.save(function(err) {
          if (err) {
            console.log("Failed scrape is", scrape.url);
            console.error(err);
            return err;
          } else {
            console.log("Successful scrape", scrape.url);
          }

          console.log('Track ' + scrape.id + ' saved');
          console.log('-----------');

          if (scrape.alert.conditionMet && scrape.status == 'set') {
            notifyUser(scrape, body);
            scrape.status = 'found';
            scrape.save();
          }
        });
      });

      done();
    });
  });
};