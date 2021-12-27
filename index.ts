import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import sg from '@sendgrid/mail';

require('dotenv').config({ path: '.env' })

const SENDGRID_API_KEY = process.env.SENDGRID_FULL_ACCESS_API_KEY;
const SENDER_EMAIL = process.env.VERIFIED_SENDER_EMAIL;
// const RECIPIENTS: string[] = process.env.RECIPIENT_EMAIL_LIST;

sg.setApiKey(SENDGRID_API_KEY);

const app = express();
app.use(express.json());
app.use(cors());


app.get('/home/:emaillist', async (req, res) => {
    // res.status(200).send('email server working');

    let emailListParams: string = String(req.params.emaillist);
    console.log('emailListParams');
    console.log(emailListParams);
    console.log('-------------');

    let emailArray = emailListParams.split(',');

    // works
    // for (let i = 0; i < emailArray.length; ++i) {
    //     emailArray[i] = emailArray[i].replace('[', '').replace(']', '').replace('\'', '').replace('\'', '').replace(' ', '');
    // }

    // alternative
    const replaceSpecialCharacter = (item: any, index: number, arr: any[]) => {
        item = item.replace('[', '').replace(']', '').replace('\'', '').replace('\'', '').replace(' ', '');
        arr[index] = item;
        console.log(item);
    }

    emailArray.forEach(replaceSpecialCharacter);

    console.log('-------------');
    console.log('emailArray');
    console.log(emailArray);
    console.log('-------------');

    res.status(200).send(emailArray);
});


/**
 * {
        "subject": "Subject of test sending emails",
        "content": "Content of test sending emails"
    }
 */
// http://localhost:3004/email/example01@email.com
app.post('/email/:recipientemail', async (req, res) => {
    const recipientEmail = req.params.recipientemail;       // single recipient
    // -------------------
    // const recipientEmail = ['example01@email.com', 'example02@email.com'];   // multiple recipients, works

    console.log(recipientEmail);
    console.log(recipientEmail[0]);
    console.log(recipientEmail[1]);
    // -------------------

    const senderEmail = {
        name: 'Phong Vo 02',        // name of the sender
        email: SENDER_EMAIL         // sender email verified by Sendgrid.com
    }

    const emailSubject = ((!req.body.subject) || (req.body.subject == ''))
        ? 'The subject of this email intentionally left blank.'
        : req.body.subject;

    const emailContent = ((!req.body.content) || (req.body.content == ''))
        ? 'The content of this email intentionally left blank.'
        : req.body.content;

    const message = {
        to: recipientEmail,
        from: senderEmail,
        subject: emailSubject,
        text: emailContent,
        html: `<h2>${emailContent}</h2>`,
    }
    sg
        .send(message)
        .then((resp) => {
            console.log('Email sent. \n', resp);
        })
        .catch((error) => {
            console.error(error);
        })

    res.status(201).send(`Email sent to ${message.to}`);
});


// http://localhost:3004/email/sendbatch/['example01@email.com', 'example02@email.com']
app.post('/email/sendbatch/:emaillist', async (req, res) => {
    let emailListParams: string = String(req.params.emaillist);
    console.log('emailListParams');
    console.log(emailListParams);
    console.log('-------------');

    let emailArray = emailListParams.split(',');

    // works
    // for (let i = 0; i < emailArray.length; ++i) {
    //     emailArray[i] = emailArray[i].replace('[', '').replace(']', '').replace('\'', '').replace('\'', '').replace(' ', '');
    // }

    // alternative
    const replaceSpecialCharacter = (item: any, index: number, arr: any[]) => {
        item = item.replace('[', '').replace(']', '').replace('\'', '').replace('\'', '').replace(' ', '');
        arr[index] = item;
        console.log(item);
    }

    emailArray.forEach(replaceSpecialCharacter);
    console.log('-------------');
    console.log('emailArray');
    console.log(emailArray);
    console.log('-------------');

    const senderEmail = {
        name: 'Phong Vo 02',        // name of the sender
        email: SENDER_EMAIL         // sender email verified by Sendgrid.com
    }

    const emailSubject = ((!req.body.subject) || (req.body.subject == ''))
        ? 'The subject of this email intentionally left blank.'
        : req.body.subject;

    const emailContent = ((!req.body.content) || (req.body.content == ''))
        ? 'The content of this email intentionally left blank.'
        : req.body.content;

    const message = {
        to: emailArray,
        from: senderEmail,
        subject: emailSubject,
        text: emailContent,
        html: `<h2>${emailContent}</h2>`,
    }
    sg
        .send(message)
        .then((resp) => {
            console.log('Email sent. \n', resp);
        })
        .catch((error) => {
            console.error(error);
        })

    res.status(201).send(`Email sent to ${message.to}`);
});


// send confirmation email to a newly registered account
// sample database
const users = [
    {
        email: process.env.RECIPIENT_EMAIL1,
        password: '123456'
    },
    {
        email: process.env.RECIPIENT_EMAIL2,
        password: '456789'
    }
];
app.post('/confirm/email/:emailtoconfirm', async (req, res) => {
    // find the user account in database
    const user = users.find(user => user.email === req.params.emailtoconfirm);
    const userEmail = user.email;

    console.log(userEmail);

    if (!userEmail) {
        return res.sendStatus(401);
    }

    const tokenDuration = {
        expiresIn: '1d'     // token lives in 1 day
    }

    // // create JWT for the newly registered account
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, tokenDuration);
    // res.json({ accessToken });

    // send an email attached with the token of the newly registered account email
    const senderEmail = {
        name: 'Phong Vo 02',
        email: SENDER_EMAIL
    }

    const emailSubject = ((!req.body.subject) || (req.body.subject == ''))
        ? 'The subject of this email intentionally left blank.'
        : req.body.subject;

    const emailContent = `<h2>Hello, please confirm your email address.</h2>
                          <h4>By clicking on the following link, you are confirming your email address.</h4>
                          <a href="http://localhost:3004/confirm/token/${accessToken}">Confirm</a>`

    const message = {
        to: userEmail,
        from: senderEmail,
        subject: emailSubject,
        text: emailContent,
        html: `${emailContent}`,
    }
    sg
        .send(message)
        .then((resp) => {
            console.log(`Email sent to ${userEmail} \n`, resp);
        })
        .catch((error) => {
            console.error(error);
        });

    res.status(201).send(`Email sent to ${userEmail}`);

    // if the client clicked the link sent in the email, then confirm the account is activated
});


// confirm token when customer clicked on the confirmation token link
app.get('/confirm/token/:token', async (req, res) => {
    try {
        const token = req.params.token;

        // decode the token to get payload
        const payload: any = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // get email, password from the payload
        // const userEmail = payload.email;
        // const userPassword = payload.password;

        // console.log('payload');
        // console.log(payload);
        console.log('payload.email');
        console.log(payload.email);
        // console.log(payload.password);

        res.json({ payload });

        // login: by comparing email and password of payload to the in database
        let found: any;

        // for (let user of users) {
        //     if ((user.email === payload.email) && (user.password === payload.password)) {
        //         found = user;
        //         break;
        //     }
        // }

        found = users.find(element => element.email === payload.email);

        console.log('found');
        console.log(found);

        if (found) {
            console.log('logged in');
        } else {
            console.log('invalid email/password');
        }

    } catch (error) {
        console.log(error);
        res.send(error);
    }
});




const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log('Email Server started on PORT: ' + PORT));