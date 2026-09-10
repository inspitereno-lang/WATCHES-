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
const TEMP_DIR = path.join(__dirname, 'temp_webp_ro_chrono_blue');

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
    console.log('Processing Royal Oak Chronograph Selfwinding Chronograph Blue Dial');
    console.log('========================================================================');

    const file1 = 'Royal Oak Chronograph Self Winding Blue Dial_1.png'; // MAIN BANNER
    const file2 = 'Royal Oak Chronograph Self Winding Blue Dial_2.png';
    const file3 = 'Royal Oak Chronograph Self Winding Blue Dial_3.png';
    const file4 = 'Royal Oak Chronograph Self Winding Blue Dial_4.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER ---');
    const path1 = moveFileToImagesIn(file1);
    const path2 = moveFileToImagesIn(file2);
    const path3 = moveFileToImagesIn(file3);
    const path4 = moveFileToImagesIn(file4);

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'ro_chrono_selfwinding_blue_dial_main_1');
    const img2Url = await convertToWebpAndUpload(path2, 'ro_chrono_selfwinding_blue_dial_2');
    const img3Url = await convertToWebpAndUpload(path3, 'ro_chrono_selfwinding_blue_dial_3');
    const img4Url = await convertToWebpAndUpload(path4, 'ro_chrono_selfwinding_blue_dial_4');

    const galleryImages = [
      mainBannerUrl,
      img2Url,
      img3Url,
      img4Url,
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
      $or: [
        { name: 'Royal Oak Chronograph Selfwinding Chronograph Blue Dial' },
        { reference: '26240BC.00.1320BC.01' }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 117;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Royal Oak Chronograph Selfwinding Chronograph Blue Dial',
      brand: 'Audemars Piguet',
      audience: 'Mens',
      factory: 'Selfwinding Chronograph Blue Dial',
      model: 'Royal Oak',
      reference: '26240BC.00.1320BC.01',
      material: '916L Stainless Steel case and bracelet, blue dial',
      size: '41 mm',
      caliber: 'Not specified',
      warranty: 'Two Year Service',
      priceUSD: '$1,690.00',
      priceAED: 'AED 6,193.85',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic chronograph movement',
      casing: '916L Stainless Steel',
      bezel: '916L Stainless Steel',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Audemars Piguet Royal Oak Chronograph Selfwinding in stainless steel showcases an iconic blue "Grande Tapisserie" dial, matching subdials, and integrated steel bracelet.',
      features: [
        'Movement: Automatic chronograph movement',
        'Casing Material: 916L Stainless Steel',
        'Bezel: 916L Stainless Steel',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: 26240BC.00.1320BC.01',
        'Material Composition: 916L Stainless Steel case and bracelet, blue dial',
        'Diameter Size: 41 mm',
        'Engine / Caliber: Not specified',
        'Shipping: Free Shipping',
        'Warranty: Two Year Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'رويال أوك كرونوغراف أوتوماتيكية ميناء أزرق',
      brandAr: 'أوديمار بيغيه',
      modelAr: 'رويال أوك',
      materialAr: 'علبة وسوار من الفولاذ المقاوم للصدأ 916L، ميناء أزرق',
      movementAr: 'حركة كرونوغراف أوتوماتيكية',
      casingAr: 'فولاذ مقاوم للصدأ 916L',
      bezelAr: 'فولاذ مقاوم للصدأ 916L',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة أوديمار بيغيه رويال أوك كرونوغراف أوتوماتيكية بهيكل وسوار من الفولاذ المقاوم للصدأ وميناء أزرق بنمط "غراند تابسيري" الكلاسيكي الفاخر.',
      featuresAr: [
        'الحركة: حركة كرونوغراف أوتوماتيكية',
        'مادة الهيكل: فولاذ مقاوم للصدأ 916L',
        'الإطار: فولاذ مقاوم للصدأ 916L',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: 26240BC.00.1320BC.01',
        'تركيبة المواد: علبة وسوار من الستانلس ستيل 916L وميناء أزرق',
        'الأبعاد: 41 مم',
        'المحرك / العيار: غير محدد',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين'
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
