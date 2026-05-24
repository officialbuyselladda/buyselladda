const appName = 'BuySellAdda';
const tagline = 'Har Deal, Ek Nayi Shuruaat';

const appUrl = () => (
  process.env.CLIENT_URL
  || process.env.FRONTEND_URL
  || process.env.WEBSITE_URL
  || 'http://localhost:3000'
).replace(/\/$/, '');

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const button = (label, url) => `
  <a href="${escapeHtml(url)}" style="display:inline-block;background:#f97316;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:12px;font-weight:800">
    ${escapeHtml(label)}
  </a>
`;

const baseEmail = ({
  preheader = '',
  eyebrow = appName,
  title,
  body,
  ctaLabel,
  ctaUrl,
  note,
}) => `
<!doctype html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f6f8fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937">
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f8fb;padding:28px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #e5e7eb;border-radius:22px;overflow:hidden">
            <tr>
              <td style="background:#002f34;padding:26px 28px">
                <div style="font-size:24px;line-height:1;font-weight:900;color:#ffffff">${appName}</div>
                <div style="margin-top:7px;color:#b8fff9;font-size:13px;font-weight:700">${tagline}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 10px">
                <div style="display:inline-block;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800">
                  ${escapeHtml(eyebrow)}
                </div>
                <h1 style="margin:18px 0 10px;color:#002f34;font-size:28px;line-height:1.18;font-weight:900">${escapeHtml(title)}</h1>
                <div style="color:#4b5563;font-size:15px;line-height:1.7">${body}</div>
                ${ctaLabel && ctaUrl ? `<div style="margin-top:24px">${button(ctaLabel, ctaUrl)}</div>` : ''}
                ${note ? `<div style="margin-top:22px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;color:#64748b;font-size:13px;line-height:1.55">${note}</div>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;color:#94a3b8;font-size:12px;line-height:1.6">
                This email was sent by BuySellAdda. For your safety, never share your password or OTP with anyone.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const templates = {
  welcome: (name) => baseEmail({
    preheader: 'Your BuySellAdda account is ready.',
    eyebrow: 'Welcome',
    title: `Welcome, ${name || 'there'}`,
    body: `
      <p style="margin:0 0 12px">Your BuySellAdda account is active. You can now post ads, save listings, chat with sellers, and manage your marketplace activity from one secure account.</p>
      <p style="margin:0">Start exploring local deals near you whenever you are ready.</p>
    `,
    ctaLabel: 'Open BuySellAdda',
    ctaUrl: appUrl(),
  }),
  loginAlert: ({ name, time, ip } = {}) => baseEmail({
    preheader: 'New login detected on your BuySellAdda account.',
    eyebrow: 'Security alert',
    title: 'New login to your account',
    body: `
      <p style="margin:0 0 12px">Hi ${escapeHtml(name || 'there')}, your BuySellAdda account was just signed in.</p>
      <p style="margin:0"><strong>Time:</strong> ${escapeHtml(time || new Date().toLocaleString('en-IN'))}</p>
      ${ip ? `<p style="margin:4px 0 0"><strong>IP:</strong> ${escapeHtml(ip)}</p>` : ''}
    `,
    note: 'If this was you, no action is needed. If you do not recognize this login, reset your password immediately.',
  }),
  passwordReset: (resetUrl) => baseEmail({
    preheader: 'Reset your BuySellAdda password.',
    eyebrow: 'Password reset',
    title: 'Reset your password',
    body: `
      <p style="margin:0 0 12px">We received a request to reset your BuySellAdda password.</p>
      <p style="margin:0">Use the button below to create a new password. This secure link is valid for 10 minutes.</p>
    `,
    ctaLabel: 'Reset Password',
    ctaUrl: resetUrl,
    note: 'If you did not request this password reset, you can safely ignore this email.',
  }),
  passwordChanged: (name) => baseEmail({
    preheader: 'Your BuySellAdda password was changed.',
    eyebrow: 'Account security',
    title: 'Password changed successfully',
    body: `
      <p style="margin:0 0 12px">Hi ${escapeHtml(name || 'there')}, your BuySellAdda password has been changed successfully.</p>
      <p style="margin:0">You can continue using your account with the new password.</p>
    `,
    note: 'If you did not make this change, contact BuySellAdda support right away.',
  }),
  adApproved: (title) => baseEmail({
    preheader: 'Your ad is now live on BuySellAdda.',
    eyebrow: 'Ad approved',
    title: 'Your ad is live',
    body: `<p style="margin:0">Your ad <strong>${escapeHtml(title)}</strong> has been approved and is now visible to buyers.</p>`,
    ctaLabel: 'View Listings',
    ctaUrl: appUrl(),
  }),
  adRejected: (title, reason) => baseEmail({
    preheader: 'Your ad needs changes before it can go live.',
    eyebrow: 'Ad review',
    title: 'Your ad was not approved',
    body: `
      <p style="margin:0 0 12px">Your ad <strong>${escapeHtml(title)}</strong> was not approved after review.</p>
      <p style="margin:0"><strong>Reason:</strong> ${escapeHtml(reason || 'Admin review')}</p>
    `,
    note: 'You can edit the ad details and submit it again for review.',
  }),
  adSuspicious: (title) => baseEmail({
    preheader: 'Your ad is waiting for approval.',
    eyebrow: 'Ad under review',
    title: 'Your ad is under review',
    body: `<p style="margin:0">Your ad <strong>${escapeHtml(title)}</strong> has been submitted and is waiting for approval. If no admin action is taken in time, eligible ads may be approved automatically.</p>`,
  }),
  accountBlocked: (reason) => baseEmail({
    preheader: 'Your BuySellAdda account needs attention.',
    eyebrow: 'Account notice',
    title: 'Account access restricted',
    body: `<p style="margin:0"><strong>Reason:</strong> ${escapeHtml(reason || 'Policy review')}</p>`,
    note: 'Please contact support if you believe this restriction is incorrect.',
  }),
  newMessage: (sellerName) => baseEmail({
    preheader: 'You have a new BuySellAdda chat message.',
    eyebrow: 'New message',
    title: `New message from ${sellerName || 'a user'}`,
    body: '<p style="margin:0">Open your chats to continue the conversation safely.</p>',
    ctaLabel: 'Open Chat',
    ctaUrl: `${appUrl()}/chats`,
  }),
};

export default templates;
