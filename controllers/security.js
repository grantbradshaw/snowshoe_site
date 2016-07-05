const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// for provision of a jwt

exports.serveJWT = function(req, res){
  var token = jwt.sign({created_date: new Date()}, process.env.JWT_SECRET + req.user.email);
  res.send({jwt: token});
}