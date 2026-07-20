/**
 * local_removebg.mjs
 * ─────────────────────────────────────────────────────────────
 * FREE, unlimited background removal using @imgly/background-removal-node
 * - Runs fully LOCAL, no API key, no credits, no limits
 * - Downloads AI model once (~50MB) on first run
 * - Processes all products skipped by remove.bg free tier
 * - Uploads transparent PNGs to Cloudinary
 * - Updates MongoDB with new clean image URLs
 * - Resumable via progress file
 *
 * Run:  node server/local_removebg.mjs
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
// Stores productId → Cloudinary URL so we can resume any time
const PROGRESS_FILE = path.join(__dirname, '..', 'removebg_progress.json');
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  try { progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
  catch { progress = {}; }
}
const saveProgress = () => fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

// ── MONGOOSE MODEL (inline) ───────────────────────────────────
const productSchema = new mongoose.Schema({
  id:        { type: Number, required: true, unique: true },
  name:      { type: String },
  image:     { type: String },
  images:    { type: [String], default: [] },
  thumbnail: { type: String, default: '' },
}, { strict: false });
const Product = mongoose.model('Product', productSchema);

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

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🔌 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected.\n');

  const products = await Product.find({}).sort({ id: 1 }).lean();
  console.log(`📦 Total products: ${products.length}`);

  // Only process those NOT already in progress (already done by remove.bg or this script)
  const pending = products.filter(p => {
    const pid = String(p.id);
    // Skip if already processed
    if (progress[pid]) return false;
    // Skip if image URL is already in the clean folder
    if (p.image && p.image.includes('t24_watches_clean')) return false;
    return true;
  });

  console.log(`✅ Already processed: ${products.length - pending.length}`);
  console.log(`⏳ Pending          : ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('🎉 All products already have clean images! Nothing to do.');
    await mongoose.connection.close();
    return;
  }

  console.log('🤖 Loading AI background removal model (downloads once ~50MB)…');
  console.log('   This may take 1-2 minutes on first run.\n');

  let processed = 0;
  let failed    = 0;

  for (let i = 0; i < pending.length; i++) {
    const product = pending[i];
    const pid = String(product.id);
    const imageUrl = product.image;

    console.log(`\n[${i + 1}/${pending.length}] 🔄 ID ${product.id}: ${(product.name || '').substring(0, 55)}`);
    console.log(`   📥 Source: ${imageUrl?.split('/').slice(-1)[0] ?? 'N/A'}`);

    if (!imageUrl) {
      console.warn('   ⚠️  No image URL — skipping.');
      failed++;
      continue;
    }

    try {
      // 1. Fetch image buffer and convert to 4-channel PNG
      console.log('   📥 Fetching source image buffer…');
      const imgBuffer = await fetchImageBuffer(imageUrl);

      console.log('   ⚙️  Converting to 4-channel PNG using sharp…');
      const rgbaPngBuffer = await sharp(imgBuffer)
        .ensureAlpha()
        .png()
        .toBuffer();

      // Wrap in a Blob with type 'image/png' to avoid empty mime-type error
      const pngBlob = new Blob([rgbaPngBuffer], { type: 'image/png' });

      // 2. Run local AI background removal
      console.log('   🎨 Removing background locally (AI)…');
      const resultBlob = await removeBackground(pngBlob, {
        debug: false,
        progress: () => {},   // silence progress logs
        model: 'medium',       // medium = best quality/speed balance
        output: {
          format: 'image/png',
          quality: 0.95,
        },
      });



      // 3. Upload transparent PNG to Cloudinary
      console.log('   ☁️  Uploading to Cloudinary…');
      const cloudUrl = await uploadToCloudinary(resultBlob);
      console.log(`   ✅ Uploaded → ${cloudUrl.split('/').slice(-2).join('/')}`);

      // 4. Update MongoDB
      await Product.updateOne(
        { id: product.id },
        {
          $set: {
            image:     cloudUrl,
            thumbnail: cloudUrl,
            images:    [cloudUrl, ...(product.images || []).filter(u => u !== imageUrl)],
          }
        }
      );

      progress[pid] = cloudUrl;
      saveProgress();
      processed++;
      console.log(`   💾 Saved to DB [ID ${product.id}]`);
    } catch (err) {
      console.error(`   ❌ Failed for ID ${product.id}: ${err.message}`);
      failed++;
    }
  }

  // ── Summary ───────────────────────────────────────────────
  const totalDone = products.length - pending.length + processed;
  console.log('\n══════════════════════════════════════════');
  console.log(`🎉 Run complete!`);
  console.log(`   Processed this run  : ${processed}`);
  console.log(`   Failed this run     : ${failed}`);
  console.log(`   Total clean in DB   : ${totalDone} / ${products.length}`);
  if (totalDone >= products.length) {
    console.log(`\n   ✨ ALL ${products.length} products now have transparent images!`);
  } else {
    console.log(`\n   ⚠️  ${products.length - totalDone} still pending — re-run to continue.`);
  }
  console.log('══════════════════════════════════════════\n');

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
