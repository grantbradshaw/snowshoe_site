const User = require('./User');
const AgendaJob = require('./AgendaJob');
const conditionMetNotification = require('../mailer/condition_met_notification');
const mongoose = require('mongoose');

var alertSchema = new mongoose.Schema({
  operator: { type: String, default: '<' },
  comparator: Number,
  message: String,
  conditionMet: { type: Boolean, default: false }
});

var scrapeSchema = new mongoose.Schema({
  name: String,
  selector: {type: String, required: true },
  data: { type: Number, required: true },
  meetsCondition: {type: Boolean, default: false, required: false }
});

var pageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  scrapes: [scrapeSchema]
});

var trackSchema = new mongoose.Schema({
  _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:  { type: String, required: true },
  status: { 
            type: String, 
            default: 'new',
            enum: ['new', 'set', 'found'],
            required: true
          },
  pages: [pageSchema],
  alert: alertSchema
}, { timestamps: true });

/**
 * Track alert middleware to check if condition is met.
 */
trackSchema.pre('save', function(next) {
  if (this.alert.comparator && this.alert.conditionMet === false && this.lowestScrapedPrice < this.alert.comparator) {
    this.alert.conditionMet = true;
  }
  next();
});

/**
 * Track middleware to update all selections that meet the condition.
 */
trackSchema.pre('save', function(next) {
  var track = this;
  var selections = [];

  if (track.pages.length == 1) {
    selections = selections.concat(track.pages[0].scrapes);
  } else {
    selections = track.pages.reduce(function(scrapes, currentPage, index) {
      if (index == 1) {
        scrapes = scrapes.scrapes;
      }
      return scrapes.concat(currentPage.scrapes);
    });
  }
  selections.find(function(selection) {
    if (track.alert.conditionMet && selection.data == track.lowestScrapedPrice) {
      selection.meetsCondition = true;
    }
  });

  next();
});

/**
 * Remove track id from user document.
 */
trackSchema.post('remove', function(track) {
  User.findOne({ _id: track._userId }, function(err, user) {
    var jobName = 'scrape ' + track.id;
    
    user.trackIds.pull(track.id);
    user.save();

    // Remove related scrape job if it exists.
    AgendaJob.findOne({ name: jobName }, function(err, job) {
      if (job) job.remove();
    });
  });
});

/**
 * Helper method to return selections.
 */
trackSchema.virtual('selections').get(function() {
  var selections = [];

  if (this.pages.length == 1) {
    selections = selections.concat(this.pages[0].scrapes);
  } else {
    selections = this.pages.reduce(function(scrapes, currentPage, index) {
      if (index == 1) {
        scrapes = scrapes.scrapes;
      }
      return scrapes.concat(currentPage.scrapes);
    });
  }

  return selections;
});

/**
 * Helper method for counting total items being tracked.
 */
trackSchema.methods.totalScrapes = function() {
  var totalScraps;

  // First check if only one page was scraped
  if (this.pages.length == 1) {
    totalScraps = this.pages[0].scrapes.length;
  } else {
    totalScraps = this.pages.reduce(function(scrapeCount, currentPage, index) {
      // Set the scrapeCount for the first page
      if (index === 1) {
        scrapeCount = scrapeCount.scrapes.length;
      }

      return scrapeCount + currentPage.scrapes.length;
    });
  }

  return totalScraps;
}

/**
 * Helper method for lowest scraped prices.
 */
trackSchema.virtual('lowestScrapedPrice').get(function() {
  // Only run this function if there are selections.
  if (this.selections.length) {
    var scrapes;
    var lowestPrice;

    // Get all scrapes.
    // First check if only one page was scraped.
    if (this.pages.length == 1) {
      scrapes = this.pages[0].scrapes;
    } else {
      scrapes = this.pages.reduce(function(scrapes, currentPage, index) {
        // Set the initial scrapes
        if (index == 1) {
          scrapes = scrapes.scrapes;
        }
        return scrapes.concat(currentPage.scrapes);
      });
    }

    // Reduce to lowest scrape value.
    // First check if there's only one scrape.
    if (scrapes.length == 1) {
      lowestPrice = scrapes[0].data;
    } else {
      lowestPrice = scrapes.reduce(function(lowestPrice, currentScrape, index) {
        // Set the initial lowestPrice
        if (index === 1) {
          lowestPrice = lowestPrice.data;
        }
        if (currentScrape.data <= lowestPrice) {
          lowestPrice = currentScrape.data
        }
        return lowestPrice;
      });
    }

    return lowestPrice;
  }
});

/**
 * Helper method for retrieving the cheapest item.
 */
trackSchema.virtual('cheapestSelection').get(function() {
  // Only run this function if there are selections.
  if (this.selections.length) {
    var scrapes;
    var cheapestSelection;

    // Get all scrapes.
    // First check if only one page was scraped.
    if (this.pages.length == 1) {
      scrapes = this.pages[0].scrapes;
    } else {
      scrapes = this.pages.reduce(function(scrapes, currentPage, index) {
        // Set the initial scrapes
        if (index == 1) {
          scrapes = scrapes.scrapes;
        }
        return scrapes.concat(currentPage.scrapes);
      });
    }

    // Reduce to lowest scrape value.
    // First check if there's only one scrape.
    if (scrapes.length == 1) {
      cheapestSelection = scrapes[0];
    } else {
      cheapestSelection = scrapes.reduce(function(cheapestSelection, currentScrape, index) {
        if (currentScrape.data <= cheapestSelection.data) {
          cheapestSelection = currentScrape
        }
        return cheapestSelection;
      });
    }

    // Get the page URl containing the selection.
    this.pages.find(function(page) {
      if (page.scrapes.id(cheapestSelection.id)) {
        // Convert cheapestSelection into Object
        //  so a url property can be added.
        cheapestSelection = cheapestSelection.toObject();
        cheapestSelection.url = page.url;
        return true;
      }
    });

    return cheapestSelection;
  }
});

/**
 * Helper method for track URL.
 */
trackSchema.virtual('url').get(function() {
  return 'http://localhost:3000/tracks/' + this.id;
});


module.exports = mongoose.model('Track', trackSchema);