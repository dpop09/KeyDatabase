const FormData = require('form-data');
const Mailgun = require('mailgun.js');
const dotenv = require('dotenv');
dotenv.config(); // Reads from .env file

async function sendEmail() {
    const mailgun = new Mailgun(FormData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API,
    });
    try {
      const data = await mg.messages.create("sandbox7a7d373f57254825a78e1b06f3015289.mailgun.org", {
        from: "Mailgun Sandbox <postmaster@sandbox7a7d373f57254825a78e1b06f3015289.mailgun.org>",
        to: ["hc7822@wayne.edu"],
        subject: "Test",
        text: "Congratulations hc7822, you just sent an email with Mailgun! You are truly awesome!",
      });
  
      console.log(data); // logs response data
    } catch (error) {
      console.log(error); //logs any error
    }
  }

// Export the function
module.exports = { sendEmail };
