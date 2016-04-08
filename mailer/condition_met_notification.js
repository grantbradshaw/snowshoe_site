const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

var emailBody = function(user, track) {
  return 'Hi ' + user.profile.firstName + ',\n\n' +
    track.cheapestSelection.name + ' is now $' + track.cheapestSelection.data + ', ' +
    'which is below your set price range of $' + track.alert.comparator + '. ' +
    'It\'s available at ' + track.cheapestSelection.url + '. \n\n' +
    'Track: ' + track.url + '\n\n' +
    'Cheers,' +
    '\nThe Snowshoe team';
}

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
  }
  transporter.sendMail(mailOptions, function(err) {
    if(err) {
      return next(err);
    } else {
      console.log('Email notification sent.')
    }
  });
}

module.exports = conditionMetNotification;