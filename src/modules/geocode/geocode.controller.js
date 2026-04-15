import sendResponse from '../../utils/responseHandler.js';
import geocodeService from './geocode.service.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const reverseGeocode = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
    sendResponse(res, {
      success: false,
      statusCode: 400,
      message: 'lat and lng query parameters required as numbers'
    });
    return;
  }

  const address = await geocodeService.reverseGeocode(parseFloat(lat), parseFloat(lng));
  
  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: 'Address fetched successfully',
    data: { address }
  });
});

