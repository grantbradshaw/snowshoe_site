const Track = require('../models/Track');

exports.deleteSelection = function(req, res, next) {
  Track.findOne({ _id: req.params.trackId }, function(err, track) {
    track.pages.forEach(function(page) {
      if (page.scrapes.id(req.params.selectionId)) {
        page.scrapes.pull(req.params.selectionId);
      }
    });

    track.save(function(err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Wasn\'t able to remove selection.');
      }

      res.send({ redirect: '/tracks/' + req.params.trackId });

    });
  });
}