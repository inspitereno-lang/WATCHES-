import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '/var/www/fastuser/data/backend/.env' });

const TARGET_DIR = '/var/www/fastuser/data/www/dubaiwatchesgallery.com/uploads/t24_watches_clean';
fs.mkdirSync(TARGET_DIR, { recursive: true });

async function downloadAndProcess() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/t24watches';
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const products = await db.collection('products').find({ image: /cloudinary/ }).toArray();
  console.log(`Found ${products.length} products with Cloudinary images.`);

  for (const p of products) {
    const rawUrl = p.image;
    const filename = path.basename(rawUrl.split('?')[0]); // e.g. malavika_watch_01_banner.webp
    const baseName = filename.replace(/\.[^.]+$/, '');
    const localWebpPath = path.join(TARGET_DIR, `${baseName}.webp`);
    const localJpgPath = path.join(TARGET_DIR, `${baseName}.jpg`);

    try {
      console.log(`Downloading ${rawUrl}...`);
      const resp = await fetch(rawUrl);
      if (!resp.ok) {
        console.error(`Failed to download ${rawUrl}: ${resp.status}`);
        continue;
      }
      const buffer = Buffer.from(await resp.arrayBuffer());
      fs.writeFileSync(localWebpPath, buffer);

      // Convert to WhatsApp-optimized JPEG (1200px max, dark luxury background if transparent)
      const meta = await sharp(buffer).metadata();
      let pipeline = sharp(buffer);
      if (meta.hasAlpha) {
        pipeline = pipeline.flatten({ background: { r: 13, g: 13, b: 15 } });
      }
      if (meta.width && meta.width > 1200) {
        pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
      }
      await pipeline.jpeg({ quality: 86, progressive: true }).toFile(localJpgPath);

      // Update product record in MongoDB to point to local upload
      const newLocalImage = `/uploads/t24_watches_clean/${baseName}.webp`;
      await db.collection('products').updateOne(
        { _id: p._id },
        { $set: { image: newLocalImage } }
      );
      console.log(`[Success] ID ${p.id} ${p.name} -> ${newLocalImage} (+ ${baseName}.jpg)`);
    } catch (e) {
      console.error(`Error processing ID ${p.id}:`, e.message);
    }
  }

  await mongoose.disconnect();
  console.log('Finished migrating Cloudinary images to local VPS storage!');
}

downloadAndProcess().catch(console.error);
