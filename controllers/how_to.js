// GET /how-to
const Scrape = require('../models/Scrape');

exports.getHowTo = function(req, res) {
  // req.user fails if not logged in
  if (req.user) { // keep from triggering when logged out -> can control how I want now that headless presentation is specified
    var testing = false;
    Scrape.findOne({selector: '#dev-snowshoe-price', _userId: req.user.id}, function(err, scrape) {
      if (err) console.error(err);
      if (scrape) testing = true;
    })
      .then(function(){
        res.render('how-to', {
          title: 'How To',
          testing: testing,
          headless: false
        });
      });
  } else {
    res.render('how-to', {
      title: 'How To',
      testing: true,
      headless: true // this is for headless scrape that will functionally treat it as on sale
    });
  }
}