import Product from '../modules/product/product.model.js';
import User from '../modules/user/user.model.js';
import { createNotification } from '../modules/notification/notification.service.js';
import templates from '../utils/emailTemplates.js';
import sendEmail from '../config/email.js';

const DEFAULT_AUTO_APPROVE_MINUTES = 10;
const DEFAULT_INTERVAL_SECONDS = 60;
const BATCH_LIMIT = 100;

const parsePositiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const isEnabled = () => String(process.env.AUTO_APPROVE_PENDING_ADS ?? 'true').toLowerCase() !== 'false';

const getDelayMinutes = () => parsePositiveNumber(
  process.env.AUTO_APPROVE_PENDING_ADS_AFTER_MINUTES,
  DEFAULT_AUTO_APPROVE_MINUTES,
);

const getIntervalMs = () => parsePositiveNumber(
  process.env.AUTO_APPROVE_PENDING_ADS_INTERVAL_SECONDS,
  DEFAULT_INTERVAL_SECONDS,
) * 1000;

export const autoApprovePendingProducts = async () => {
  if (!isEnabled()) return { approved: 0, skipped: true };

  const delayMinutes = getDelayMinutes();
  const cutoff = new Date(Date.now() - delayMinutes * 60 * 1000);

  const pendingProducts = await Product.find({
    status: 'pending',
    createdAt: { $lte: cutoff },
  })
    .select('title user createdAt')
    .sort({ createdAt: 1 })
    .limit(BATCH_LIMIT)
    .lean();

  let approved = 0;

  for (const product of pendingProducts) {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: product._id, status: 'pending' },
      {
        $set: {
          status: 'approved',
          approvedAt: new Date(),
          approvalSource: 'auto',
        },
      },
      { new: true },
    ).lean();

    if (!updatedProduct) continue;
    approved += 1;

    const user = await User.findById(updatedProduct.user).select('email').lean();

    await Promise.allSettled([
      createNotification(updatedProduct.user, {
        title: 'Your ad is live',
        message: `"${updatedProduct.title}" was automatically approved because it was pending for ${delayMinutes} minutes.`,
        type: 'product_status',
        priority: 'medium',
        relatedProduct: updatedProduct._id,
        data: {
          status: 'approved',
          approvalSource: 'auto',
          autoApprovedAfterMinutes: delayMinutes,
        },
      }),
      user?.email
        ? sendEmail(user.email, 'Your Ad Approved!', templates.adApproved(updatedProduct.title))
        : Promise.resolve(),
    ]);
  }

  if (approved > 0) {
    console.log(`Auto-approved ${approved} pending ads after ${delayMinutes} minutes`);
  }

  return { approved, skipped: false };
};

export const startProductAutoApprovalJob = () => {
  if (!isEnabled()) {
    console.log('Product auto-approval job disabled');
    return null;
  }

  const intervalMs = getIntervalMs();
  console.log(`Product auto-approval job running every ${intervalMs / 1000}s`);

  autoApprovePendingProducts().catch((error) => {
    console.warn('Initial product auto-approval failed:', error.message);
  });

  return setInterval(() => {
    autoApprovePendingProducts().catch((error) => {
      console.warn('Product auto-approval failed:', error.message);
    });
  }, intervalMs);
};
