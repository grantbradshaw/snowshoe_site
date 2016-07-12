'use strict';

const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

var emailBody = function(user, scrape) {
  return 'Hi ' + user.profile.firstName + ',\n\n' +
    scrape.name + ' is now $' + scrape.data + ', ' +
    'which is below your set price range of $' + scrape.alert.comparator + '. ' +
    'It\'s available at ' + scrape.url + '. \n\n' +
    'Track: ' + scrape.url + '\n\n' +
    'Cheers,' +
    '\nThe Snowshoe team';
};

var conditionMetNotification = function(user, track) {
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
    to: user.email,
    subject: 'Snowshoe notification',
    text: emailBody(user, track)
  };
  transporter.sendMail(mailOptions, function(err) {
    if(err) {
      console.error(err);
      // return next(err);
    } else {
      console.log('Email notification sent.');
    }
  });
};

module.exports = conditionMetNotification;