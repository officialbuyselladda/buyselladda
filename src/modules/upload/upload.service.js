import path from 'path';
import env from '../../config/env.js';

const normalizePath = (value = '') => value.replace(/\\/g, '/');

const buildBaseUrl = (req) => {
  if (env.PUBLIC_BASE_URL) return env.PUBLIC_BASE_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
};

const uploadImage = async (file, req) => {
  const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR || 'uploads');
  const relativePath = normalizePath(path.relative(uploadRoot, file.path));
  const publicPath = `/uploads/${relativePath}`;
  const publicUrl = `${buildBaseUrl(req)}${publicPath}`;

  return {
    public_id: relativePath,
    url: publicUrl,
    originalUrl: publicUrl,
    mimeType: file.mimetype,
    size: file.size,
  };
};

export default { uploadImage };
