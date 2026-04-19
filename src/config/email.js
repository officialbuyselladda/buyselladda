import dotenv from 'dotenv';

dotenv.config();

const parseBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return defaultValue;
  return value.toLowerCase() === 'true';
};

const createTransporter = async () => {
  const nodemailer = (await import('nodemailer')).default;

  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = parseBoolean(process.env.EMAIL_SECURE, port === 465);

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    error.message = `Email send failed: ${error.message}`;
    throw error;
  }
};

export default sendEmail;

