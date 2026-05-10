import cloudinary from '../../config/cloudinary.js';

const buildPublicId = (filename = 'image') => {
  const baseName = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `${baseName || 'image'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const uploadImage = async (buffer, filename) => {
  console.log('🔄 Cloudinary upload starting for', filename, '- Config:', cloudinary.config().cloud_name ? 'OK' : 'MISSING');

  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('⏰ Upload timeout (30s): Cloudinary connection slow')), 30000)
  );

  const uploadPromise = new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'dealkro/products',
        public_id: buildPublicId(filename),
        overwrite: false,
        quality: 'auto',
        fetch_format: 'auto'
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary error:', error.message);
          reject(error);
        } else {
          console.log('✅ Raw upload result:', result.public_id);
          resolve(result);
        }
      }
    );
    uploadStream.end(buffer);
  });

  let result;
  try {
    result = await Promise.race([uploadPromise, timeoutPromise]);
  } catch (error) {
    console.error('💥 Final upload fail:', error.message);
    throw error;
  }

  // No moderation - skip check
  console.log('🎉 Upload complete:', result.public_id);

  const optimizedUrl = cloudinary.url(result.public_id, {
    secure: true,
    width: 500,
    height: 500,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  });

  return {
    public_id: result.public_id,
    url: optimizedUrl,
    originalUrl: result.secure_url,
  };
};

export default { uploadImage };
