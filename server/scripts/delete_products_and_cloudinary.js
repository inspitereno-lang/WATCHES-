import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SCRATCH_DIR = path.join(ROOT_DIR, 'scratch');

dotenv.config({ path: path.join(__dirname, '../.env') });

if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

// 1. Verify Configuration
const { MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!MONGO_URI || !CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('Missing required environment variables in server/.env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) return null;
  const parts = url.split('/image/upload/');
  if (parts.length < 2) return null;
  const pathPart = parts[1].replace(/^v\d+\//, ''); // strip version prefix if present
  const dotIndex = pathPart.lastIndexOf('.');
  return dotIndex !== -1 ? pathPart.substring(0, dotIndex) : pathPart;
}

function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function run() {
  try {
    console.log('--- STARTING SAFE PRODUCT & CLOUDINARY CLEANUP ---');
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log(`Connected to database: ${mongoose.connection.name}`);
    const db = mongoose.connection.db;

    // 2. Scan other collections to identify protected assets
    console.log('\nScanning non-product collections for protected assets...');
    const nonProductProtectedUrls = new Set();
    const otherCollections = ['homepages', 'heros', 'accessories', 'blogposts', 'cataloguesettings'];

    for (const col of otherCollections) {
      const docs = await db.collection(col).find({}).toArray();
      const str = JSON.stringify(docs);
      const regex = /https?:\/\/[^"\s\\]+/g;
      let match;
      while ((match = regex.exec(str)) !== null) {
        if (match[0].includes('cloudinary.com')) {
          nonProductProtectedUrls.add(match[0]);
        }
      }
    }
    console.log(`Found ${nonProductProtectedUrls.size} Cloudinary images referenced by non-product collections.`);

    // 3. Fetch all products from MongoDB
    const products = await db.collection('products').find({}).toArray();
    console.log(`\nFound ${products.length} products in MongoDB.`);

    if (products.length === 0) {
      console.log('No products found in MongoDB collection. Exiting.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // 4. Save local backup before deletion
    const backupFile = path.join(SCRATCH_DIR, `backup_products_before_delete_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(products, null, 2));
    console.log(`✓ Saved backup of all ${products.length} products to: ${backupFile}`);

    // 5. Gather all product images
    const allProductUrls = new Set();
    for (const p of products) {
      const list = [p.image, p.thumbnail, ...(p.images || [])].filter(Boolean);
      for (const u of list) {
        if (typeof u === 'string' && u.includes('res.cloudinary.com')) {
          allProductUrls.add(u);
        }
      }
    }
    console.log(`\nTotal unique Cloudinary URLs referenced in products: ${allProductUrls.size}`);

    // Separate into delete vs preserve
    const urlsToDelete = [];
    const preservedUrls = [];

    for (const url of allProductUrls) {
      if (nonProductProtectedUrls.has(url)) {
        preservedUrls.push(url);
      } else {
        urlsToDelete.push(url);
      }
    }

    console.log(`• Protected images preserved (used in homepage/other collections): ${preservedUrls.length}`);
    console.log(`• Product-only images targeted for deletion: ${urlsToDelete.length}`);

    // Extract public_ids
    const publicIdsToDelete = [];
    for (const url of urlsToDelete) {
      const pid = getPublicIdFromUrl(url);
      if (pid && !publicIdsToDelete.includes(pid)) {
        publicIdsToDelete.push(pid);
      }
    }
    console.log(`• Unique Cloudinary public_ids to delete: ${publicIdsToDelete.length}`);

    // 6. Delete Cloudinary assets in batches of 100
    if (publicIdsToDelete.length > 0) {
      console.log('\nDeleting Cloudinary assets in batches...');
      const batches = chunkArray(publicIdsToDelete, 100);
      let deletedCount = 0;
      let notFoundCount = 0;
      const deletionResults = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Deleting batch ${i + 1}/${batches.length} (${batch.length} assets)...`);
        const result = await cloudinary.api.delete_resources(batch, { resource_type: 'image' });
        deletionResults.push(result);

        for (const [id, status] of Object.entries(result.deleted || {})) {
          if (status === 'deleted') deletedCount++;
          else notFoundCount++;
        }
      }

      console.log(`✓ Cloudinary deletion complete: ${deletedCount} assets deleted, ${notFoundCount} already removed/not found.`);

      const deletedLogFile = path.join(SCRATCH_DIR, `deleted_cloudinary_assets_${Date.now()}.json`);
      fs.writeFileSync(deletedLogFile, JSON.stringify({
        totalTargeted: publicIdsToDelete.length,
        deletedCount,
        notFoundCount,
        publicIds: publicIdsToDelete,
        preservedUrls,
      }, null, 2));
      console.log(`✓ Logged deletion details to: ${deletedLogFile}`);
    } else {
      console.log('No Cloudinary assets to delete.');
    }

    // 7. Delete products from MongoDB
    console.log('\nDeleting products from MongoDB...');
    const deleteResult = await Product.deleteMany({});
    console.log(`✓ Deleted ${deleteResult.deletedCount} products from MongoDB.`);

    // 8. Update cloudinary_mappings.json if present
    const mappingFile = path.join(ROOT_DIR, 'cloudinary_mappings.json');
    if (fs.existsSync(mappingFile)) {
      console.log('\nCleaning up cloudinary_mappings.json...');
      try {
        const mappings = JSON.parse(fs.readFileSync(mappingFile, 'utf8'));
        const cleanedMappings = {};
        const protectedUrlsSet = new Set(preservedUrls);

        for (const [orig, cloud] of Object.entries(mappings)) {
          if (protectedUrlsSet.has(cloud) || !urlsToDelete.includes(cloud)) {
            cleanedMappings[orig] = cloud;
          }
        }
        fs.writeFileSync(mappingFile, JSON.stringify(cleanedMappings, null, 2));
        console.log(`✓ Updated cloudinary_mappings.json (${Object.keys(mappings).length} -> ${Object.keys(cleanedMappings).length} entries).`);
      } catch (err) {
        console.warn('Could not update cloudinary_mappings.json:', err.message);
      }
    }

    console.log('\n--- PRODUCT & CLOUDINARY CLEANUP COMPLETED SUCCESSFULLY ---');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during cleanup execution:', error);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

run();
