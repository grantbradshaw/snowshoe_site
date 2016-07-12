'use strict';

const jwt = require('jsonwebtoken');

// for provision of a jwt

exports.serveJWT = function(req, res){
  var token = jwt.sign({created_date: new Date()}, process.env.JWT_SECRET + req.user.email);
  res.send({jwt: token});
};