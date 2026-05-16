import Notification from './notification.model.js';
import { NotFoundError } from '../../utils/errorHandler.js';
import User from '../user/user.model.js';
import sendEmail from '../../config/email.js';

const createNotification = async (userId, notificationData) => {
  const notification = await Notification.create({
    ...notificationData,
    user: userId
  });
  return notification;
};

const notificationEmailHtml = ({ title, message }) => `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
    <h2 style="color:#059669;margin-bottom:12px">${title}</h2>
    <p>${String(message).replace(/\n/g, '<br/>')}</p>
    <p style="margin-top:24px;color:#6b7280;font-size:13px">BuySellAdda Team</p>
  </div>
`;

const createAdminNotification = async (payload = {}) => {
  const {
    user,
    users = [],
    sendToAll = false,
    sendEmail: shouldSendEmail = true,
    ...notificationData
  } = payload;

  const filter = sendToAll
    ? { role: 'user', isBlocked: { $ne: true } }
    : { _id: { $in: [...new Set([user, ...users].filter(Boolean))] } };

  const recipients = await User.find(filter).select('name email').lean();
  if (recipients.length === 0) throw new NotFoundError('No users found for notification');

  const notifications = await Notification.insertMany(recipients.map((recipient) => ({
    ...notificationData,
    type: notificationData.type || 'system',
    user: recipient._id,
  })));

  if (shouldSendEmail) {
    await Promise.allSettled(recipients
      .filter((recipient) => recipient.email)
      .map((recipient) => sendEmail(
        recipient.email,
        notificationData.title,
        notificationEmailHtml(notificationData)
      )));
  }

  return {
    notifications,
    recipientsCount: recipients.length,
    emailQueued: shouldSendEmail,
  };
};

const getUserNotifications = async (userId, query = {}) => {
  const { page = 1, limit = 20, read = null, type, priority } = query;
  const skip = (page - 1) * limit;

  const filter = { user: userId };
  if (read !== null) filter.isRead = read === 'true';
  if (type) filter.type = type;
  if (priority) filter.priority = priority;

  const notifications = await Notification.find(filter)
    .populate('relatedProduct', 'title images price')
    .populate('relatedChat', 'participants')
    .sort('-createdAt')
    .skip(skip)
    .limit(limit * 1)
    .lean();

  const total = await Notification.countDocuments(filter);
  const unreadCount = await Notification.countDocuments({ user: userId, isRead: false });

  return {
    notifications,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / limit),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      unreadCount
    }
  };
};

const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  
  if (!notification) throw new NotFoundError('Notification not found');
  return notification;
};

const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
  return result;
};

const getUnreadCount = async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
};

const getAdminNotifications = async (query) => {
  const { page = 1, limit = 20, search, user, read, type, priority } = query;
  const skip = (page - 1) * limit;

  const filter = {};
  if (user) filter.user = user;
  if (read !== null) filter.isRead = read === 'true';
  if (type) filter.type = type;
  if (priority) filter.priority = priority;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { message: { $regex: search, $options: 'i' } }
    ];
  }

  const notifications = await Notification.find(filter)
    .populate('user', 'name email phone')
    .populate('relatedProduct', 'title images price')
    .populate('relatedChat', 'participants')
    .sort('-createdAt')
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const total = await Notification.countDocuments(filter);

  return {
    notifications,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

const deleteNotificationAdmin = async (id) => {
  const notification = await Notification.findById(id);
  if (!notification) throw new NotFoundError('Notification not found');
  await notification.deleteOne();
};

export {
  createNotification,
  createAdminNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getAdminNotifications,
  deleteNotificationAdmin
};

