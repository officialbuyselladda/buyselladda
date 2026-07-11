import ContactMessage from './contact.model.js';
import sendEmail from '../../config/email.js';
import appConfigService from '../appConfig/appConfig.service.js';

const resolveSupportEmail = async () => {
  try {
    const config = await appConfigService.getAppConfig();
    if (config?.contact?.supportEmail) return config.contact.supportEmail;
  } catch (_) {
    // fall through to env/default below
  }
  return process.env.SUPPORT_EMAIL || process.env.EMAIL_USER || 'support@buyselladda.com';
};

export const submitContactMessage = async (payload, file) => {
  const doc = await ContactMessage.create({
    type: payload.type || 'contact',
    name: payload.name,
    email: payload.email,
    message: payload.message,
    problemType: payload.problemType || '',
    adReference: payload.adReference || '',
    screenshotAttached: Boolean(file),
  });

  const isReport = doc.type === 'report';
  const subject = isReport
    ? `New problem report from ${doc.name}`
    : `New contact message from ${doc.name}`;
  const html = `
    <h2>${isReport ? 'Problem report' : 'Contact message'}</h2>
    <p><strong>Name:</strong> ${doc.name}</p>
    <p><strong>Email:</strong> ${doc.email}</p>
    ${isReport && doc.problemType ? `<p><strong>Problem type:</strong> ${doc.problemType}</p>` : ''}
    ${isReport && doc.adReference ? `<p><strong>Ad reference:</strong> ${doc.adReference}</p>` : ''}
    <p><strong>Message:</strong></p>
    <p>${doc.message.replace(/\n/g, '<br/>')}</p>
  `;

  try {
    const to = await resolveSupportEmail();
    const attachments = file
      ? [{ filename: file.originalname, content: file.buffer, contentType: file.mimetype }]
      : [];
    await sendEmail(to, subject, html, attachments);
  } catch (error) {
    // The message is already saved; a delivery hiccup shouldn't fail the request.
    console.error('Contact email send failed:', error.message);
  }

  return doc;
};
