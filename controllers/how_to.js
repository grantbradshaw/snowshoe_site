// GET /how-to
const Scrape = require('../models/Scrape');

exports.getHowTo = function(req, res) {
  if (req.user) { 
    var sale = false;
    Scrape.findOne({selector: '#dev-snowshoe-price', _userId: req.user.id}, function(err, scrape) {
      if (err) console.error(err);
      if (scrape) sale = true;
    })
      .then(function(){
        res.render('how-to', {
          title: 'How To',
          sale: sale
        });
      });
  } else {
    res.render('how-to', {
      title: 'How To'
    });
  }
}