import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (to, subject, html) => {
  const nodemailer = (await import('nodemailer')).default;
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

export default sendEmail;

