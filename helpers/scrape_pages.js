const User = require('../models/User');
// const conditionMetNotification = require('../mailer/condition_met_notification');
const cleanNumberData = require('./clean_number_data');
const cheerio = require('cheerio');
const webdriver = require('selenium-webdriver')
var driver = new webdriver.Builder().forBrowser('phantomjs').build();

// var notifyUser = function(track) {
//   User.findOne({ _id: track._userId }, function(err,user) {
//     conditionMetNotification(user, track);
//   });
// }

var scrapePage = function(scrape, callback) {
  driver.get(scrape.url);

  var sleepPeriod = 4000
  console.log('Browser will wait', sleepPeriod);

  // Driver waits the sleep period before getting the page source
  // Required for pages that make heavy use of JS
  driver.sleep(sleepPeriod).then(function() {
    driver.getPageSource().then(function(body) {

      console.log('Got page source. Scraping it now.');
      var $ = cheerio.load(body);

      // var prices = {};
      // page.scrapes.forEach(function(scrape) {
      //   prices[scrape.id] = $(scrape.selector).text();
      // });
      var price = cleanNumberData($(scrape.selector).text());

      callback(scrape, price, body);
    });
  });
}

// var scrapePages = function(track, callback) {
//   var pageCount = 0; // look at async module for asynchronous foreach instead of using pageCount

//   track.pages.forEach(function(page) {
//     pageCount++;

//     scrapePage(pageCount, page, function(page, prices, pageCount) {
//       console.log('callback running, updated data:', prices);

//       page.scrapes.forEach(function(scrape) {
//         page.scrapes.id(scrape.id).data = cleanNumberData(prices[scrape.id]);
//       });

//       if (pageCount == track.pages.length) {
//         // Track instance needs to be saved in order to update track.alert.conditionMet.
//         track.save(function(err) {
//           if (err) return console.error(err);

//           // Check to see if condition is met. If so, send notification email.
//           if (track.alert.conditionMet && track.status == 'set') {
//             notifyUser(track);
//             track.status = 'found';
//           }

//           callback(track);
//         });
//       }
//     });
//   });
// }

module.exports = scrapePage;
