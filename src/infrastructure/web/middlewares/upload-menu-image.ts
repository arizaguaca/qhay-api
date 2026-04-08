import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

// Usamos almacenamiento en memoria para procesar con Sharp antes de guardar
const storage = multer.memoryStorage();

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('image');

export const processMenuImage = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();

  try {
    const id = req.body.id || uuidv4();
    const filename = `${id}.jpg`; // Forzamos extensión jpg
    const outputPath = path.join(process.cwd(), 'uploads', 'menu', filename);

    // Procesamiento con Sharp
    await sharp(req.file.buffer)
      .resize(800, 600, {
        fit: 'cover',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    // Actualizamos la información del archivo para el controlador
    req.file.filename = filename;
    req.file.path = outputPath;

    next();
  } catch (error) {
    next(new Error(`Error processing image: ${(error as Error).message}`));
  }
};

export const uploadMenuImage = [upload, processMenuImage];
