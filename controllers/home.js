// GET /

exports.index = function(req, res){
  if (req.user){
    return res.redirect('/tracks');
  }
  res.render('home', {
    title: 'Home',
    firstName: '',
    lastName: '',
    email: ''
  });
}