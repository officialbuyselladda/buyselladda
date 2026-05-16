const templates = {
  welcome: (name) => `
    <h1>Welcome to BuySellAdda, ${name}!</h1>
    <p>Har Deal, Ek Nayi Shuruaat.</p>
    <p>Your account is active. Start buying/selling now!</p>
    <a href="http://localhost:3000">BuySellAdda App</a>
  `,
  adApproved: (title) => `
    <h1>✅ Your ad "${title}" approved!</h1>
    <p>Live on marketplace. Share with friends!</p>
  `,
  adRejected: (title, reason) => `
    <h1>❌ Ad "${title}" rejected</h1>
    <p>Reason: ${reason}</p>
    <p>Fix & resubmit.</p>
  `,
  adSuspicious: (title) => `
    <h1>⚠️ Ad "${title}" under review</h1>
    <p>Pending admin approval.</p>
  `,
  accountBlocked: (reason) => `
    <h1>🚫 Account suspended</h1>
    <p>Reason: ${reason}</p>
    <p>Contact support.</p>
  `,
  newMessage: (sellerName) => `
    <h1>💬 New message from ${sellerName}</h1>
    <p>Check your chats!</p>
    <a href="http://localhost:3000/chat">Open Chat</a>
  `,
  passwordReset: (resetUrl) => `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
      <h1 style="color:#111827">Reset your BuySellAdda password</h1>
      <p>Har Deal, Ek Nayi Shuruaat.</p>
      <p>Click the button below to create a new password. This link is valid for 10 minutes.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;background:#ea580c;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">
          Reset Password
        </a>
      </p>
      <p>If you did not request this, you can safely ignore this email.</p>
    </div>
  `,
};

export default templates;

