'use strict';

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

var emailBody = function(scrape, body) {
  return 'condition price is ' + scrape.alert.comparator + '\n\n' +
  'selector is ' + scrape.selector + '\n\n' +
  'url is ' + scrape.url + '\n\n' +
  body;
};

var alertDeveloper = function(scrape, body) {
  var transporter = nodemailer.createTransport(smtpTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
          secure: true, // use SSL
          auth: {
            user: process.env.SENDGRID_USER,
            pass: process.env.SENDGRID_PASSWORD
          }
  }));
  var mailOptions = {
    from: 'snowshoeapp@gmail.com',
    to: 'snowshoe.apps@gmail.com',
    subject: 'Verify hit',
    text: emailBody(scrape, body)
  };
  if (scrape.selector == '#dev-snowshoe-price') {return false;}
  transporter.sendMail(mailOptions, function(err) {
    if(err) {
      console.error(err);
      // return next(err);
    } else {
      console.log('Developer notified.');
    }
  });
};

module.exports = alertDeveloper;