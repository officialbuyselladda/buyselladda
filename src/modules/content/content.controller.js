import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import contentService from './content.service.js';

const getSiteContent = asyncHandler(async (req, res) => {
  const content = await contentService.getSiteContent();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Site content fetched',
    data: content,
  });
});

const updateSiteContent = asyncHandler(async (req, res) => {
  const content = await contentService.updateSiteContent(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Site content updated',
    data: content,
  });
});

export { getSiteContent, updateSiteContent };
