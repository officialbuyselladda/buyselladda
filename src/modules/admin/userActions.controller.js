import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import userActionsService from './userActions.service.js';
import { toggleUserBlockValidation, updateUserValidation } from './admin.validation.js';

const toggleUserBlock = asyncHandler(async (req, res) => {
  const { error } = toggleUserBlockValidation.validate({ id: req.params.id });
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const user = await userActionsService.toggleUserBlock(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}`,
    data: user,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { error } = updateUserValidation.validate(req.body);
  if (error) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: error.details[0].message,
    });
  }
  const user = await userActionsService.updateUser(req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'User updated',
    data: user,
  });
});

export { toggleUserBlock, updateUser };

