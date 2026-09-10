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
const TEMP_DIR = path.join(__dirname, 'temp_webp_ap_mini');

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
    console.log('Processing Audemars Piguet Royal Oak Mini (Women’s Watch)');
    console.log('========================================================================');

    const file1 = 'Audemars Piguet Royal Oak Mini_1.png'; // MAIN BANNER / ICON
    const file2 = 'Audemars Piguet Royal Oak Mini_2.png';
    const file3 = 'Audemars Piguet Royal Oak Mini_3.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER ---');
    const path1 = moveFileToImagesIn(file1);
    const path2 = moveFileToImagesIn(file2);
    const path3 = moveFileToImagesIn(file3);

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'ap_ro_mini_main_1');
    const img2Url = await convertToWebpAndUpload(path2, 'ap_ro_mini_2');
    const img3Url = await convertToWebpAndUpload(path3, 'ap_ro_mini_3');

    const galleryImages = [
      mainBannerUrl,
      img2Url,
      img3Url,
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
      name: { $regex: /Royal Oak Mini/i }
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 113;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Audemars Piguet Royal Oak Mini',
      brand: 'Audemars Piguet',
      audience: 'Womens',
      factory: 'Ladies / Women’s Royal Oak Mini',
      model: 'Royal Oak',
      reference: 'Not specified by seller',
      material: 'Not specified by seller',
      size: '23 mm',
      caliber: 'Not specified by seller',
      warranty: 'Two Years',
      priceUSD: '$1,450.00',
      priceAED: 'AED 5,325.13',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Quartz movement',
      casing: 'Not specified by seller',
      bezel: 'Not specified by seller',
      glass: 'Not specified by seller',
      waterResistance: '30m waterproof tested',
      description: 'The Audemars Piguet Royal Oak Mini is an exquisite ladies timepiece crafted with a petite 23mm case diameter and powered by a high-precision quartz movement. An icon of feminine elegance and horological jewelry.',
      features: [
        'Audience: Women’s / Ladies',
        'Movement: Quartz movement',
        'Casing Material: Not specified by seller',
        'Bezel: Not specified by seller',
        'Glass / Crystal: Not specified by seller',
        'Reference Number: Not specified by seller',
        'Material Composition: Not specified by seller',
        'Diameter Size: 23 mm',
        'Engine / Caliber: Not specified by seller',
        'Shipping: Free Shipping',
        'Warranty: Two Years'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'أوديمار بيغيه رويال أوك ميني النسائية',
      brandAr: 'أوديمار بيغيه',
      modelAr: 'رويال أوك',
      materialAr: 'غير محدد من قبل البائع',
      movementAr: 'حركة كوارتز دقيقة',
      casingAr: 'غير محدد من قبل البائع',
      bezelAr: 'غير محدد من قبل البائع',
      glassAr: 'غير محدد من قبل البائع',
      waterResistanceAr: 'مقاومة الماء حتى 30 متراً',
      warrantyAr: 'ضمان لمدة عامين',
      descriptionAr: 'ساعة أوديمار بيغيه رويال أوك ميني النسائية الفاخرة بقطر 23 مم أنيق وحركة كوارتز دقيقة تجمع بين الأناقة الراقية وجمال المجوهرات الكلاسيكية.',
      featuresAr: [
        'الفئة: نسائية',
        'الحركة: حركة كوارتز',
        'مادة الهيكل: غير محدد من قبل البائع',
        'الإطار: غير محدد من قبل البائع',
        'الزجاج: غير محدد من قبل البائع',
        'الرقم المرجعي: غير محدد من قبل البائع',
        'تركيبة المواد: غير محدد من قبل البائع',
        'الأبعاد: 23 مم',
        'العيار / المحرك: غير محدد من قبل البائع',
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
    console.log(`Audience: ${savedProduct.audience}`);
    console.log(`Sub-brand: ${savedProduct.model}`);
    console.log(`Edition / Maker: ${savedProduct.factory}`);
    console.log(`Price (USD): ${savedProduct.priceUSD}`);
    console.log(`Price (AED): ${savedProduct.priceAED}`);
    console.log(`Movement Spec: ${savedProduct.movement}`);
    console.log(`Casing Material Spec: ${savedProduct.casing}`);
    console.log(`Bezel Spec: ${savedProduct.bezel}`);
    console.log(`Glass Crystal Spec: ${savedProduct.glass}`);
    console.log(`Reference Number: ${savedProduct.reference}`);
    console.log(`Material Composition: ${savedProduct.material}`);
    console.log(`Diameter Size: ${savedProduct.size}`);
    console.log(`Engine / Caliber: ${savedProduct.caliber}`);
    console.log(`Warranty: ${savedProduct.warranty}`);
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
