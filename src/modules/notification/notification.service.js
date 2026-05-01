import Notification from './notification.model.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { NotFoundError } from '../../utils/errorHandler.js';

const createNotification = asyncHandler(async (userId, notificationData) => {
  const notification = await Notification.create({
    ...notificationData,
    user: userId
  });
  return notification;
});

const getUserNotifications = asyncHandler(async (userId, query = {}) => {
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
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      unreadCount
    }
  };
});

const markAsRead = asyncHandler(async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  
  if (!notification) throw new NotFoundError('Notification not found');
  return notification;
});

const markAllAsRead = asyncHandler(async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true }
  );
  return result;
});

const getUnreadCount = asyncHandler(async (userId) => {
  return await Notification.countDocuments({ user: userId, isRead: false });
});

const getAdminNotifications = asyncHandler(async (query) => {
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
});

export {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  getAdminNotifications
};

