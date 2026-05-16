import sendEmail from '../../config/email.js';
import User from '../user/user.model.js';

const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to BuySellAdda ${user.name}!</h1>
    <p>Har Deal, Ek Nayi Shuruaat.</p>
    <p>Your account created successfully.</p>
    <p>Start posting ads and buying/selling.</p>
  `;
  await sendEmail(user.email, 'Welcome to BuySellAdda', html);
};

export default { sendWelcomeEmail };

