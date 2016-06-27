const User = require('../models/User');
const cleanNumberData = require('./clean_number_data');
const cheerio = require('cheerio');
const webdriver = require('selenium-webdriver')
// const driver = new webdriver.Builder().forBrowser('phantomjs').build();

var scrapePage = function(scrape, callback) {
  if (!scrape) return false; // handles attempt to scrape page after deletion
  var driver = new webdriver.Builder().forBrowser('phantomjs').build();
  driver.get(scrape.url);

  var waitPeriod = 10 * 1000;
  console.log('Browser will wait...');
  
  driver.wait(webdriver.until.elementLocated(webdriver.By.tagName(scrape.selector)), waitPeriod, "Timed out")
  .catch(function(e){
    if (e.message.match("Timed out")){
      console.log("Loading page timed out");
      return e;
    } else {
      throw e;
    }
  })
  .then(function(v){
    if (v.message && v.message.match("Timed out")){
      driver.quit();
      console.log("Exiting scrapePage function")
    } else {
      driver.getPageSource().then(function(body){
        console.log('Got page source. Scraping it now');
        var $ = cheerio.load(body);
        var price = cleanNumberData($(scrape.selector).text());
        driver.quit();
        callback(scrape, price, body);
      });
    }
  });
}

module.exports = scrapePage;
