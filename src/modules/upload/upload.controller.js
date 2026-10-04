import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import uploadService from './upload.service.js';

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'No image file provided',
    });
  }

  try {
    const result = await uploadService.uploadImage(req.file, req);
    return sendResponse(res, {
      success: true,
      statusCode: 200,
      message: 'Image uploaded',
      data: result,
    });
  } catch (error) {
    if (error.code === 'IMAGE_MODERATION_REJECTED') {
      return sendResponse(res, {
        success: false,
        statusCode: error.statusCode || 400,
        message: error.message || 'Image rejected by moderation policy',
        data: {
          moderationStatus: error.moderationStatus || 'rejected',
        },
      });
    }
    throw error;
  }
});

export { uploadImage };

