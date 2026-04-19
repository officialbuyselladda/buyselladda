import cloudinary from '../../config/cloudinary.js';

const uploadImage = async (buffer, filename) => {
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: 'dealkro/products',
        public_id: filename.replace(/\\.[^/.]+$/, ''),
        moderation: 'aws_rek',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  const moderation = Array.isArray(result.moderation) ? result.moderation[0] : null;
  const moderationStatus = moderation?.status || 'pending';
  const rejectedReason = moderation?.kind ? `Rejected by moderation: ${moderation.kind}` : 'Image failed moderation safety checks';

  if (moderationStatus !== 'approved') {
    const error = new Error(rejectedReason);
    error.statusCode = 400;
    error.code = 'IMAGE_MODERATION_REJECTED';
    error.moderationStatus = moderationStatus;
    throw error;
  }

  const optimizedUrl = cloudinary.url(result.public_id, {
    secure: true,
    width: 500,
    crop: 'limit',
    quality: 'auto',
    fetch_format: 'auto',
  });

  return {
    public_id: result.public_id,
    url: optimizedUrl,
    originalUrl: result.secure_url,
    moderationStatus,
  };
};

export default { uploadImage };

