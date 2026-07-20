/**
 * local_removebg_gallery.mjs
 * ─────────────────────────────────────────────────────────────
 * Processes all secondary gallery images for products in MongoDB
 * - Removes background locally using @imgly/background-removal-node
 * - Uploads transparent PNGs to Cloudinary
 * - Updates the product's `images` array in MongoDB
 * - Tracks progress in removebg_gallery_progress.json to prevent duplicate work
 *
 * Run:  node server/local_removebg_gallery.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import { removeBackground } from '@imgly/background-removal-node';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// ── CLOUDINARY ────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── PROGRESS FILE ─────────────────────────────────────────────
const PROGRESS_FILE = path.join(__dirname, '..', 'removebg_gallery_progress.json');
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  try {
    progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  } catch {
    progress = {};
  }
}
const saveProgress = () => fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

// ── MONGOOSE MODEL ─────────────────────────────────────────────
const productSchema = new mongoose.Schema({
  id:     { type: Number, required: true, unique: true },
  name:   { type: String },
  images: { type: [String], default: [] },
}, { strict: false });
const Product = mongoose.model('Product', productSchema);

/** Download image from URL as ArrayBuffer */
async function fetchImageBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': 'https://dubaiwatchstores.com/',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Upload a Blob/Buffer to Cloudinary, returns secure_url */
async function uploadToCloudinary(blob, folder = 't24_watches_clean') {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, format: 'png', resource_type: 'image' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function main() {
  console.log('\n🔌 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected.\n');

  // Fetch all products that have at least one image in the images array not in t24_watches_clean
  const products = await Product.find({}).sort({ id: 1 });
  
  // Filter products that actually need gallery image processing
  const productsToProcess = products.filter(p => {
    return p.images && p.images.some(img => !img.includes('t24_watches_clean'));
  });

  console.log(`📦 Total products needing gallery BG removal: ${productsToProcess.length}`);

  if (productsToProcess.length === 0) {
    console.log('🎉 All products already have clean gallery images! Nothing to do.');
    await mongoose.connection.close();
    return;
  }

  console.log('🤖 Loading AI background removal model (downloads once ~50MB)…\n');

  let processedCount = 0;
  let skippedCount   = 0;
  let failedCount    = 0;

  for (let i = 0; i < productsToProcess.length; i++) {
    const product = productsToProcess[i];
    console.log(`\n[${i + 1}/${productsToProcess.length}] 🔄 Product ID ${product.id}: ${(product.name || '').substring(0, 50)}`);
    
    let updatedImages = [...product.images];
    let hasChanges = false;

    for (let j = 0; j < updatedImages.length; j++) {
      const origUrl = updatedImages[j];
      
      // Skip if already a clean image
      if (origUrl.includes('t24_watches_clean')) {
        continue;
      }

      console.log(`   🖼️  Gallery Image ${j + 1}/${updatedImages.length}: ${origUrl.split('/').slice(-1)[0]}`);

      // Check if we already processed this URL in a previous run/different product
      if (progress[origUrl]) {
        console.log(`   ✨ Reusing already processed URL: ${progress[origUrl].split('/').slice(-1)[0]}`);
        updatedImages[j] = progress[origUrl];
        hasChanges = true;
        skippedCount++;
        continue;
      }

      try {
        console.log('   📥 Fetching source image buffer…');
        const imgBuffer = await fetchImageBuffer(origUrl);

        console.log('   ⚙️  Converting to 4-channel PNG using sharp…');
        const rgbaPngBuffer = await sharp(imgBuffer)
          .ensureAlpha()
          .png()
          .toBuffer();

        // Wrap in a Blob with type 'image/png' to avoid empty mime-type error
        const pngBlob = new Blob([rgbaPngBuffer], { type: 'image/png' });

        console.log('   🎨 Removing background locally (AI)…');
        const resultBlob = await removeBackground(pngBlob, {
          debug: false,
          progress: () => {}, // silence progress logs
          model: 'medium',
          output: {
            format: 'image/png',
            quality: 0.95,
          },
        });


        console.log('   ☁️  Uploading to Cloudinary…');
        const cleanUrl = await uploadToCloudinary(resultBlob);
        console.log(`   ✅ Success → ${cleanUrl.split('/').slice(-2).join('/')}`);

        progress[origUrl] = cleanUrl;
        saveProgress();

        updatedImages[j] = cleanUrl;
        hasChanges = true;
        processedCount++;
      } catch (err) {
        console.error(`   ❌ Failed for image ${j + 1}: ${err.message}`);
        failedCount++;
      }
    }

    if (hasChanges) {
      product.images = updatedImages;
      await Product.updateOne({ id: product.id }, { $set: { images: updatedImages } });
      console.log(`   💾 Product ID ${product.id} images updated in database.`);
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log('🎉 Gallery background removal completed!');
  console.log(`   Processed this run  : ${processedCount}`);
  console.log(`   Reused / Skipped    : ${skippedCount}`);
  console.log(`   Failed              : ${failedCount}`);
  console.log('══════════════════════════════════════════\n');

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
