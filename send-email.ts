const sendgrid = require('@sendgrid/mail');
require('dotenv').config({ path: '.env' })

let SENDGRID_API_KEY = process.env.SENDGRID_FULL_ACCESS_API_KEY;
let SENDER_EMAIL = process.env.VERIFIED_SENDER_EMAIL;

sendgrid.setApiKey(SENDGRID_API_KEY);

const msg = {
    // to: 'exampleGetter@email.com',                       // single recipient
    to: ['example01@email.com', 'example02@email.com'],   // multiple recipients
    // from: 'exampleSender@email.com',
    from: {
        name: 'Phong Vo 02',        // name of the sender
        email: SENDER_EMAIL         // sender email verified by Sendgrid.com
    },
    subject: 'Sending with SendGrid Is Fun',
    text: 'and easy to do anywhere, even with Node.js',
    html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}
sendgrid
    .send(msg)
    .then((resp) => {
        console.log('Email sent. \n', resp);
    })
    .catch((error) => {
        console.error(error);
    })