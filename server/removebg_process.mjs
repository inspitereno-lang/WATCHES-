/**
 * removebg_process.mjs
 * ─────────────────────────────────────────────────────────────
 * 1. Loads all products from MongoDB
 * 2. Sends each product's main image to remove.bg API
 * 3. Uploads the resulting transparent PNG to Cloudinary
 * 4. Updates MongoDB product with the new clean image URL
 *
 * ⚠️  Free tier = 50 credits. Script auto-saves progress so
 *     you can run it again after topping up credits.
 *
 * Run:  node server/removebg_process.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// ── CLOUDINARY ────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── REMOVE.BG ─────────────────────────────────────────────────
const REMOVEBG_KEY = process.env.REMOVEBG_API_KEY;
if (!REMOVEBG_KEY) {
  console.error('❌  REMOVEBG_API_KEY is missing from .env');
  process.exit(1);
}

// ── PROGRESS TRACKING ─────────────────────────────────────────
// Stores productId → new Cloudinary URL so we can resume
const PROGRESS_FILE = path.join(__dirname, '..', 'removebg_progress.json');
let progress = {};
if (fs.existsSync(PROGRESS_FILE)) {
  try { progress = JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8')); }
  catch { progress = {}; }
}
const saveProgress = () => fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));

// ── PRODUCT MODEL (inline) ────────────────────────────────────
const productSchema = new mongoose.Schema({
  id:      { type: Number, required: true, unique: true },
  image:   { type: String },
  images:  { type: [String], default: [] },
  thumbnail: { type: String, default: '' },
}, { strict: false });
const Product = mongoose.model('Product', productSchema);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Remove background using remove.bg API.
 * Returns a Buffer containing the transparent PNG.
 */
async function removeBackground(imageUrl) {
  console.log(`   🎨 remove.bg processing: ${imageUrl.split('/').slice(-1)[0]}`);

  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': REMOVEBG_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: imageUrl,
      size: 'auto',
      format: 'png',
      bg_color: '',          // transparent
      type: 'product',       // hint: product photo
      type_level: '2',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`remove.bg ${response.status}: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload a Buffer to Cloudinary and return the secure_url.
 */
async function uploadBuffer(buf, folder = 't24_watches_clean') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, format: 'png' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buf);
  });
}

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  console.log('\n🔌 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected.\n');

  const products = await Product.find({}).sort({ id: 1 }).lean();
  console.log(`📦 Found ${products.length} products in database.\n`);

  const alreadyDone = Object.keys(progress).length;
  if (alreadyDone > 0) {
    console.log(`⏩ Resuming — ${alreadyDone} already processed, skipping those.\n`);
  }

  let processed = 0;
  let skipped   = 0;
  let failed    = 0;
  let outOfCredits = false;

  for (const product of products) {
    const pid = String(product.id);

    // Skip already processed
    if (progress[pid]) {
      skipped++;
      continue;
    }

    if (outOfCredits) {
      console.log(`⚠️  Out of credits. Run the script again after topping up remove.bg.`);
      break;
    }

    const imageUrl = product.image;
    if (!imageUrl) {
      console.warn(`   ⚠️  Product ${product.id} has no image — skipping.`);
      skipped++;
      continue;
    }

    // Skip images that already have background removed (from a prior run)
    if (imageUrl.includes('t24_watches_clean')) {
      console.log(`   ✅ [ID ${product.id}] already clean — skipping.`);
      skipped++;
      continue;
    }

    console.log(`\n[${processed + skipped + failed + 1}/${products.length}] 🔄 ID ${product.id}: ${product.name?.substring(0, 50)}`);

    let newImageUrl = null;
    try {
      const pngBuf = await removeBackground(imageUrl);
      newImageUrl  = await uploadBuffer(pngBuf);
      console.log(`   ☁️  Uploaded → ${newImageUrl.split('/').slice(-2).join('/')}`);

      // Update MongoDB — set the clean image as main image, keep original in images[]
      await Product.updateOne(
        { id: product.id },
        {
          $set: {
            image: newImageUrl,
            thumbnail: newImageUrl,
            // Prepend the clean image to the gallery, keep rest
            images: [newImageUrl, ...(product.images || []).filter(u => u !== imageUrl)],
          }
        }
      );

      progress[pid] = newImageUrl;
      saveProgress();
      processed++;
      console.log(`   ✅ Saved to DB [ID ${product.id}]`);
    } catch (err) {
      const msg = String(err.message || err);
      if (msg.includes('402') || msg.includes('insufficient') || msg.includes('credit')) {
        console.error(`\n💳 CREDITS EXHAUSTED. Processed ${processed} products this run.`);
        console.error(`   Top up at https://www.remove.bg/api#pricing then re-run this script.`);
        outOfCredits = true;
      } else {
        console.error(`   ❌ Failed for ID ${product.id}: ${msg}`);
        failed++;
      }
    }

    // Gentle rate limiting — 1 req/sec to respect remove.bg limits
    await sleep(1100);
  }

  // ── Summary ───────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log(`✅ Done!`);
  console.log(`   Processed this run : ${processed}`);
  console.log(`   Already done (skipped): ${skipped}`);
  console.log(`   Failed               : ${failed}`);
  console.log(`   Total in DB          : ${products.length}`);
  if (processed + skipped < products.length) {
    const remaining = products.length - processed - skipped - failed;
    console.log(`\n   ⚠️  ${remaining} products still need processing.`);
    console.log(`   Top up remove.bg credits and run:  node removebg_process.mjs`);
  } else {
    console.log(`\n   🎉 ALL products have clean transparent images!`);
  }
  console.log('══════════════════════════════════════════\n');

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
