import sendEmail from '../../config/email.js';
import templates from '../../utils/emailTemplates.js';

const sendWelcomeEmail = async (user) => {
  await sendEmail(user.email, 'Welcome to BuySellAdda', templates.welcome(user.name));
};

export default { sendWelcomeEmail };

