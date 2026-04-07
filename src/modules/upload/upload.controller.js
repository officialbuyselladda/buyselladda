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

  const result = await uploadService.uploadImage(req.file.buffer, req.file.originalname);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Image uploaded',
    data: result,
  });
});

export { uploadImage };

