import config from '../../config/env.js';
import asyncHandler from '../../utils/asyncHandler.js';

const reverseGeocode = async (lat, lng) => {
  const apiKey = config.GOOGLE_MAPS_API_KEY;  
  if (!apiKey) {
    // Fallback to free Nominatim (no key needed)
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    try {
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'DealKroApp/1.0 (contact@dealkro.com)'
        }
      });
      const data = await response.json();
      return data.display_name || data.address?.city || null;
    } catch (error) {
      console.warn('Nominatim geocode failed:', error.message);
      return null;
    }
  }

  // Google Maps
  try {
    const googleUrl = `https://maps.googleapis.com/maps/api/geocoding/json?latlng=${lat},${lng}&key=${apiKey}`;
    const response = await fetch(googleUrl);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0].formatted_address;
    }
    // Graceful for ZERO_RESULTS or 404
    return null;
  } catch (error) {
    console.warn('Google Geocoding failed:', error.message);
    return null;
  }
};

export default { reverseGeocode };

