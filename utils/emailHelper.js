const nodemailer = require('nodemailer');

const mailHelper = async (option) => {
   const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
         user: process.env.SMTP_USER,
         pass: process.env.SMTP_PASS,
      },
   });

   const message = {
      from: `"T-Shirt Store " <${process.env.SMTP_USER}>`,
      to: option.email,
      subject: option.subject,
      text: option.message,
   };

   await transporter.sendMail(message);
};

module.exports = mailHelper