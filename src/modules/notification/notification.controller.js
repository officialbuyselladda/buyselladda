import asyncHandler from '../../utils/asyncHandler.js';
import responseHandler from '../../utils/responseHandler.js';
import * as notificationService from './notification.service.js';
import { listNotificationsSchema, createNotificationSchema } from './notification.validation.js';
import { ValidationError, NotFoundError } from '../../utils/errorHandler.js';

const getUserNotifications = asyncHandler(async (req, res) => {
  const { error, value } = listNotificationsSchema.validate(req.query);
  if (error) throw new ValidationError(error.details[0].message);

  const notifications = await notificationService.getUserNotifications(req.user._id, value);
  responseHandler(res, 'Notifications retrieved successfully', notifications);
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notification = await notificationService.markAsRead(req.user._id, id);
  responseHandler(res, 'Notification marked as read', notification);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  responseHandler(res, 'All notifications marked as read');
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  responseHandler(res, 'Unread count retrieved', { unreadCount: count });
});

const createNotification = asyncHandler(async (req, res) => {
  const { error, value } = createNotificationSchema.validate(req.body);
  if (error) throw new ValidationError(error.details[0].message);

  const notification = await notificationService.createAdminNotification(value);
  responseHandler(res, 'Notification created', notification, 201);
});

const getAdminNotifications = asyncHandler(async (req, res) => {
  const { error, value } = listNotificationsSchema.validate(req.query);
  if (error) throw new ValidationError(error.details[0].message);

  const notifications = await notificationService.getAdminNotifications(value);
  responseHandler(res, 'Admin notifications retrieved', notifications);
});

const deleteNotificationAdmin = asyncHandler(async (req, res) => {
  await notificationService.deleteNotificationAdmin(req.params.id);
  responseHandler(res, 'Notification deleted');
});

export {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  createNotification,
  getAdminNotifications,
  deleteNotificationAdmin
};


