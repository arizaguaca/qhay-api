import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (_req: any, _file: any, cb: any) => {
    cb(null, path.join(process.cwd(), 'uploads', 'logos'));
  },
  filename: (_req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (_req: any, file: any, cb: any) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp, svg)'));
  }
};


export const uploadLogo = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
}).single('logo');
