import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesToUpload = [
  { key: 'hero-watch', file: '../../public/hero-watch.png' },
  { key: 'heritage-watchmaker', file: '../../public/heritage-watchmaker.jpg' },
  { key: 'swiss-alps', file: '../../public/swiss-alps.jpg' }
];

async function run() {
  console.log('Uploading default assets to Cloudinary...');
  for (const img of imagesToUpload) {
    const filePath = path.resolve(__dirname, img.file);
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 't24_watches_defaults',
      });
      console.log(`\nSUCCESS: ${img.key}`);
      console.log(`Local Path: ${filePath}`);
      console.log(`Cloudinary URL: ${result.secure_url}`);
    } catch (error) {
      console.error(`Error uploading ${img.key}:`, error);
    }
  }
}

run();
