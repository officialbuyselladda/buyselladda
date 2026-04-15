import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import userService from './user.service.js';

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getUser(req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User profile fetched',
    data: user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.user._id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Profile updated',
    data: user,
  });
});

const getProfileStats = asyncHandler(async (req, res) => {
  const stats = await userService.getProfileStats(req.user._id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Profile stats fetched',
    data: stats,
  });
});

export { getMe, updateProfile, getProfileStats };

