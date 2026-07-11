import dotenv from 'dotenv';
import templates from '../utils/emailTemplates.js';

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
    requireTLS: !secure,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 30000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  });
};

const verifyEmailTransport = async () => {
  const transporter = await createTransporter();
  await transporter.verify();
  return true;
};

const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    const transporter = await createTransporter();
    const brandedHtml = templates.wrap(html, subject);

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
      to,
      subject,
      html: brandedHtml,
      text: templates.text(brandedHtml),
      ...(attachments.length ? { attachments } : {}),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    error.message = `Email send failed: ${error.message}`;
    throw error;
  }
};

export default sendEmail;
export { verifyEmailTransport };

