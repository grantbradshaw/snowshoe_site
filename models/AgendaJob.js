var mongoose = require('mongoose');

var agendaJobSchema = new mongoose.Schema({
  name: { type: String, required: true },
  lockedAt: Date // Required in order to unlock jobs
});

module.exports = mongoose.model('AgendaJob', agendaJobSchema, 'agendaJobs');