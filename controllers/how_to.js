// GET /how-to

exports.getHowTo = function(req, res) {
  res.render('how-to', {
    title: 'How To'
  });
}