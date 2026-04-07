const templates = {
  welcome: (name) => `
    <h1>Welcome to DealKro, ${name}!</h1>
    <p>Your account is active. Start buying/selling now!</p>
    <a href="http://localhost:3000">DealKro App</a>
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
  passwordReset: (token) => `
    <h1>Password Reset</h1>
    <p>Click to reset:</p>
    <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
    <p>Valid 10min</p>
  `,
};

export default templates;

