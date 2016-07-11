// GET /about

exports.getAbout = function(req, res){
  res.render('about', {
    title: 'About'
  });
}

exports.getContact = function(req, res){
  res.render('contact', {
    title: 'Contact Us'
  })
}