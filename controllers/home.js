'use strict';

// GET /

exports.index = function(req, res){
  if (req.user){
    return res.redirect('/scrapes');
  }
  res.render('home', {
    title: 'Home',
    firstName: '',
    lastName: '',
    email: ''
  });
};