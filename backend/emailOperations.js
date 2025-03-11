const nodemailer = require('nodemailer');
const errorLogOperations = require('./errorLogOperations');
const dotenv = require('dotenv');
dotenv.config();

async function sendKeyPickupEmail(access_id) {
    // Create a transporter using Gmail SMTP + your App Password
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_APP_PASSWORD, // the 16-char app password
        },
    });

    // Message configuration
    const mailOptions = {
        from: process.env.GMAIL_ADDRESS, 
        to: `${access_id}@wayne.edu`,
        subject: 'Key Pickup Notification',
        text: `Hello,

Your key request has been authorized, and your key(s) are ready for pick-up. Please come to the front desk of the Dean's Office (College of Engineering) with your One Card to retrieve and sign out your key(s).

Office Hours:
Mon - Fri, 9:00 AM - 5:00 PM

This is an automated e-mail. Please DO NOT reply to this message.

Sincerely,
The Front Desk
Dean's Office
College of Engineering`
    };

    // Send the message
    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        errorLogOperations.logError('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendKeyPickupEmail };
