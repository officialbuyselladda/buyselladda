const appName = 'BuySellAdda';
const tagline = 'Har Deal, Ek Nayi Shuruaat';

const appUrl = () => (
  process.env.WEBSITE_URL
  || process.env.CLIENT_URL
  || process.env.FRONTEND_URL
  || 'https://buyselladda.com'
).replace(/\/$/, '');

const logoUrl = () => (
  process.env.BRAND_LOGO_URL
  || process.env.LOGO_URL
  || `${appUrl()}/logo-1.png`
).trim();

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const button = (label, url) => `
  <a href="${escapeHtml(url)}" style="display:inline-block;background:#ff7a00;color:#ffffff;text-decoration:none;padding:13px 20px;border-radius:10px;font-weight:800">
    ${escapeHtml(label)}
  </a>
`;

const isBrandedEmail = (html = '') => String(html).includes('BUYSELLADDA_EMAIL_TEMPLATE');

const normalizeBody = (body = '') => {
  const content = String(body || '').trim();
  if (!content) return '<p style="margin:0">You have a new update from BuySellAdda.</p>';
  return content;
};

const stripHtml = (html = '') => String(html)
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<br\s*\/?>/gi, '\n')
  .replace(/<\/p>/gi, '\n')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#039;/g, "'")
  .replace(/[ \t]+/g, ' ')
  .replace(/\n\s+/g, '\n')
  .trim();

export const baseEmail = ({
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
    <title>${escapeHtml(title || appName)}</title>
  </head>
  <body style="margin:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111827">
    <!-- BUYSELLADDA_EMAIL_TEMPLATE -->
    <div style="display:none;max-height:0;overflow:hidden">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:28px 12px">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:20px;overflow:hidden;box-shadow:0 16px 40px rgba(15,23,42,.08)">
            <tr>
              <td style="background:#ffffff;padding:24px 28px;border-bottom:4px solid #ff7a00">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle">
                      <img src="${escapeHtml(logoUrl())}" width="118" alt="${appName}" style="display:block;max-width:118px;width:118px;height:auto" />
                    </td>
                    <td align="right" style="vertical-align:middle">
                      <div style="font-size:22px;line-height:1;font-weight:900;color:#1354d8">${appName}</div>
                      <div style="margin-top:7px;color:#168b2f;font-size:13px;font-weight:800">${tagline}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 28px 12px">
                <div style="display:inline-block;background:#fff7ed;color:#c2410c;border:1px solid #fed7aa;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:800;letter-spacing:.02em">
                  ${escapeHtml(eyebrow)}
                </div>
                <h1 style="margin:18px 0 10px;color:#111827;font-size:28px;line-height:1.18;font-weight:900">${escapeHtml(title || appName)}</h1>
                <div style="width:52px;height:4px;background:linear-gradient(90deg,#1354d8,#ff7a00,#168b2f);border-radius:999px;margin:0 0 18px"></div>
                <div style="color:#4b5563;font-size:15px;line-height:1.7">${normalizeBody(body)}</div>
                ${ctaLabel && ctaUrl ? `<div style="margin-top:24px">${button(ctaLabel, ctaUrl)}</div>` : ''}
                ${note ? `<div style="margin-top:22px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:14px;color:#64748b;font-size:13px;line-height:1.55">${note}</div>` : ''}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 28px;color:#94a3b8;font-size:12px;line-height:1.6">
                <div style="height:1px;background:#e5e7eb;margin-bottom:16px"></div>
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

export const wrapEmailHtml = (html, subject = appName) => {
  if (isBrandedEmail(html)) return html;
  return baseEmail({
    preheader: subject,
    eyebrow: 'BuySellAdda update',
    title: subject || 'BuySellAdda update',
    body: html,
  });
};

export const htmlToText = (html = '') => {
  const text = stripHtml(html);
  return text || `${appName}\n${tagline}`;
};

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
  verifyEmail: ({ name, verifyUrl, otp } = {}) => baseEmail({
    preheader: 'Verify your BuySellAdda email address.',
    eyebrow: 'Email verification',
    title: 'Verify your email address',
    body: `
      <p style="margin:0 0 12px">Hi ${escapeHtml(name || 'there')}, thanks for creating your BuySellAdda account.</p>
      <p style="margin:0">Please verify your email before signing in. This keeps marketplace accounts safer for buyers and sellers.</p>
      ${otp ? `<div style="margin-top:18px;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:16px;text-align:center"><div style="font-size:12px;font-weight:800;color:#c2410c;text-transform:uppercase;letter-spacing:.08em">Your OTP</div><div style="margin-top:8px;color:#002f34;font-size:30px;font-weight:900;letter-spacing:6px">${escapeHtml(otp)}</div></div>` : ''}
    `,
    ctaLabel: 'Verify Email',
    ctaUrl: verifyUrl,
    note: otp ? 'This OTP is valid for 10 minutes. The verification link is valid for 24 hours.' : 'This verification link is valid for 24 hours. If you did not create this account, you can ignore this email.',
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
  passwordReset: ({ resetUrl, otp, name } = {}) => baseEmail({
    preheader: 'Reset your BuySellAdda password.',
    eyebrow: 'Password reset',
    title: 'Reset your password',
    body: `
      <p style="margin:0 0 12px">We received a request to reset your BuySellAdda password.</p>
      <p style="margin:0">Enter this OTP in the app or website, then create your new password. This code is valid for 10 minutes.</p>
      ${otp ? `<div style="margin-top:18px;background:#fff7ed;border:1px solid #fed7aa;border-radius:16px;padding:16px;text-align:center"><div style="font-size:12px;font-weight:800;color:#c2410c;text-transform:uppercase;letter-spacing:.08em">Reset OTP</div><div style="margin-top:8px;color:#002f34;font-size:30px;font-weight:900;letter-spacing:6px">${escapeHtml(otp)}</div></div>` : ''}
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
  custom: baseEmail,
  wrap: wrapEmailHtml,
  text: htmlToText,
};

export default templates;
