import cloudinary from '../../config/cloudinary.js';

const uploadImage = async (buffer, filename) => {
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'image',
        folder: 'dealkro/products',
        public_id: filename.replace(/\\.[^/.]+$/, ''),
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });

  return {
    public_id: result.public_id,
    url: result.secure_url,
  };
};

export default { uploadImage };

