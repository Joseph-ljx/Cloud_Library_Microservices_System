// Use node mailer for sending the message
const nodemailer = require("nodemailer");

// create a transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
  // --- Local Test ---
  // host: "smtp.ethereal.email",
  // port: 587,
  // secure: false, // true for 465, false for other ports
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "josephedissa3@gmail.com", // email account
    pass: "dgtdvtgifmtbjwtj", // generated application password
  },
});

module.exports = transporter;
