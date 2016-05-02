const Agenda = require('agenda');
const AgendaJob = require('../models/AgendaJob');
var scrape = require('../jobs/scrape')

var agenda = new Agenda();
agenda
  .database(process.env.MONGODB || process.env.MONGODB_URI) // changed from MONGODB to facilitate heroku
  .processEvery('2 hours');

// Unlocks running/grabbed jobs which were abandoned
AgendaJob.update( {}, { $set: { lockedAt: undefined }}, { multi: true }).exec();

// Load scrape jobs definitions
AgendaJob.find({}, function(err, jobs) {
  if (err) return console.error(err);

  jobs.forEach(function(job) {
    scrape(agenda, job.name);
  });
});

agenda.on('ready', function() {
  agenda.start();
});

module.exports = agenda;