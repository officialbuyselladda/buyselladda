import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadRoot = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadRoot, { recursive: true });

const safeName = (filename = 'upload') => {
  const ext = path.extname(filename).toLowerCase();
  const base = path.basename(filename, ext)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  return `${base || 'file'}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith('video/') ? 'videos' : 'images';
    const destination = path.join(uploadRoot, folder);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, file, cb) => cb(null, safeName(file.originalname)),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video uploads are allowed.'), false);
    }
  },
});

export default upload;
