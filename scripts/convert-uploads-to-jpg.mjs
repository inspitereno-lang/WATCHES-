import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOADS_DIR = process.env.LOCAL_UPLOADS_DIR || '/var/www/fastuser/data/www/dubaiwatchesgallery.com/uploads';

async function scanAndConvert(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await scanAndConvert(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext === '.webp' || ext === '.png') {
        const jpgPath = fullPath.slice(0, -ext.length) + '.jpg';
        try {
          const meta = await sharp(fullPath).metadata();
          let pipeline = sharp(fullPath);
          if (meta.hasAlpha) {
            pipeline = pipeline.flatten({ background: { r: 13, g: 13, b: 15 } });
          }
          // Resize if wider than 1200 for optimal WhatsApp speed, otherwise keep crisp resolution
          if (meta.width && meta.width > 1200) {
            pipeline = pipeline.resize({ width: 1200, withoutEnlargement: true });
          }
          await pipeline.jpeg({ quality: 86, progressive: true }).toFile(jpgPath);
          console.log(`[Converted] ${entry.name} -> ${path.basename(jpgPath)}`);
        } catch (err) {
          console.error(`[Error converting] ${fullPath}:`, err.message);
        }
      }
    }
  }
}

async function main() {
  console.log(`Starting conversion of webp/png images to jpg in: ${UPLOADS_DIR}...`);
  await scanAndConvert(UPLOADS_DIR);
  console.log('Finished converting images to JPG!');
}

main().catch(console.error);
