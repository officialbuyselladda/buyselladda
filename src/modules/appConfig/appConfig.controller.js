import asyncHandler from '../../utils/asyncHandler.js';
import sendResponse from '../../utils/responseHandler.js';
import appConfigService from './appConfig.service.js';

const getAppConfig = asyncHandler(async (req, res) => {
  const config = await appConfigService.getAppConfig();
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'App config fetched',
    data: config,
  });
});

const updateAppConfig = asyncHandler(async (req, res) => {
  const config = await appConfigService.updateAppConfig(req.body);
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'App config updated',
    data: config,
  });
});

export { getAppConfig, updateAppConfig };
