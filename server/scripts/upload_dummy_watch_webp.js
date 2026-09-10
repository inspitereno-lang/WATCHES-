import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import sharp from 'sharp';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT_DIR, 'images_all', 'fridays images');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_dummy_watch');

dotenv.config({ path: path.join(__dirname, '../.env') });

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

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_IN_DIR)) {
  fs.mkdirSync(IMAGES_IN_DIR, { recursive: true });
}

function moveFileToImagesIn(filename) {
  const srcPath = path.join(SOURCE_DIR, filename);
  const destPath = path.join(IMAGES_IN_DIR, filename);

  if (fs.existsSync(srcPath)) {
    console.log(`📦 Moving "${filename}" from "images_all/fridays images" to "images in"...`);
    fs.copyFileSync(srcPath, destPath);
    fs.unlinkSync(srcPath);
    console.log(`✓ Successfully moved and removed from source: ${filename}`);
  } else if (fs.existsSync(destPath)) {
    console.log(`ℹ️ "${filename}" already exists in "images in"`);
  } else {
    throw new Error(`File not found in source or destination: ${filename}`);
  }

  return destPath;
}

async function convertToWebpAndUpload(sourceFilePath, publicId) {
  console.log(`\nProcessing image (Direct WebP conversion): "${path.basename(sourceFilePath)}"`);
  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  console.log(`  ⚙️  Converting to high-quality WebP...`);
  await sharp(sourceFilePath)
    .webp({ quality: 90, alphaQuality: 100, lossless: false })
    .toFile(tempWebpPath);
  console.log(`  ✓ Converted to WebP: ${tempWebpPath} (${fs.statSync(tempWebpPath).size} bytes)`);

  console.log(`  ☁️  Uploading to Cloudinary as "${publicId}"...`);
  const result = await cloudinary.uploader.upload(tempWebpPath, {
    folder: 't24_watches_clean',
    public_id: publicId,
    format: 'webp',
    overwrite: true,
    resource_type: 'image',
  });

  console.log(`  ✓ Cloudinary WebP URL: ${result.secure_url}`);
  return result.secure_url;
}

async function main() {
  try {
    console.log('========================================================================');
    console.log('Processing DUMMY WATCH');
    console.log('========================================================================');

    const file1 = 'watch-01.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER ---');
    const path1 = moveFileToImagesIn(file1);

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'dummy_watch_main_1');

    const galleryImages = [
      mainBannerUrl,
    ];

    console.log('\n--- STEP 3: CONNECTING TO MONGODB ---');
    let connected = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`Connecting to MongoDB (attempt ${attempt}/5)...`);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
        connected = true;
        break;
      } catch (err) {
        console.warn(`Attempt ${attempt} failed (${err.message}). Retrying in 2 seconds...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (!connected) throw new Error('Could not connect to MongoDB after multiple attempts');
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // Look for existing product
    const existingProduct = await Product.findOne({
      name: 'DUMMY WATCH'
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 122;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'DUMMY WATCH',
      brand: 'Custom Brand',
      audience: 'Mens',
      factory: 'Custom Factory',
      model: 'Dummy Model',
      reference: 'DUMMY-01',
      material: 'Stainless steel',
      size: '40 mm',
      caliber: 'Automatic',
      warranty: 'Two Years',
      priceUSD: '$999.00',
      priceAED: 'AED 3,661.34',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic movement',
      casing: 'Stainless steel',
      bezel: 'Stainless steel',
      glass: 'Sapphire crystal',
      waterResistance: '30m waterproof tested',
      description: 'Dummy watch description for demonstration and testing purposes.',
      features: [
        'Movement: Automatic movement',
        'Casing Material: Stainless steel',
        'Bezel: Stainless steel',
        'Glass: Sapphire crystal',
        'Reference: DUMMY-01',
        'Shipping: Free Shipping',
        'Warranty: Two Years'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ساعة تجريبية DUMMY WATCH',
      brandAr: 'علامة تجارية مخصصة',
      modelAr: 'نموذج تجريبي',
      materialAr: 'فولاذ مقاوم للصدأ',
      movementAr: 'حركة أوتوماتيكية',
      casingAr: 'فولاذ مقاوم للصدأ',
      bezelAr: 'فولاذ مقاوم للصدأ',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 30 متراً',
      warrantyAr: 'ضمان سنتان',
      descriptionAr: 'ساعة تجريبية لأغراض العرض والاختبار.',
      featuresAr: [
        'الحركة: حركة أوتوماتيكية',
        'الهيكل: فولاذ مقاوم للصدأ',
        'الإطار: فولاذ مقاوم للصدأ',
        'الزجاج: زجاج ياقوتي',
        'الرقم المرجعي: DUMMY-01',
        'الشحن: شحن مجاني',
        'الضمان: سنتان'
      ]
    };

    const savedProduct = await Product.findOneAndUpdate(
      { id: targetId },
      { $set: productPayload },
      { upsert: true, new: true }
    );

    console.log('\n✓ SAVED PRODUCT TO MONGODB SUCCESSFULLY:');
    console.log('----------------------------------------------------');
    console.log(`ID: ${savedProduct.id}`);
    console.log(`Model Name: ${savedProduct.name}`);
    console.log(`Brand: ${savedProduct.brand}`);
    console.log(`Price (USD): ${savedProduct.priceUSD}`);
    console.log(`Price (AED): ${savedProduct.priceAED}`);
    console.log(`Main Image (WebP): ${savedProduct.image}`);
    console.log(`Total Gallery Images: ${savedProduct.images.length}`);
    savedProduct.images.forEach((img, idx) => console.log(`  [${idx + 1}] ${img}`));
    console.log('----------------------------------------------------');

    // Clean up temp dir
    try {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    } catch {}

    await mongoose.connection.close();
    console.log('\nDatabase connection closed. All tasks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Execution error:', error);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

main();
