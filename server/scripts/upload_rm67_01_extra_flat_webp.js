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
const IMAGES_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm67_01');

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

async function convertToWebpAndUpload(sourceFilename, publicId) {
  const sourcePath = path.join(IMAGES_DIR, sourceFilename);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`File not found: ${sourcePath}`);
  }

  console.log(`\nProcessing image (Direct WebP conversion): "${sourceFilename}"`);
  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  console.log(`  ⚙️  Converting to high-quality WebP...`);
  await sharp(sourcePath)
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
    console.log('Processing Richard Mille RM 67-01 Extra Flat (Direct WebP Upload)');
    console.log('========================================================================');

    // Richard Mille RM 67-01 Extra Flat.png is the main icon
    const imgMainName = 'Richard Mille RM 67-01 Extra Flat.png'; // MAIN ICON
    const img2Name = 'Richard Mille RM 67-01 Extra Flat2.png';
    const img3Name = 'Richard Mille RM 67-01 Extra Flat3.png';
    const img4Name = 'Richard Mille RM 67-01 Extra Flat4.png';
    const img5Name = 'Richard Mille RM 67-01 Extra Flat5.png';

    console.log('\n--- STEP 1: DIRECT WEBP CONVERSION & CLOUDINARY UPLOAD ---');
    const mainBannerUrl = await convertToWebpAndUpload(imgMainName, 'rm_67_01_extra_flat_main_banner');
    const img2Url = await convertToWebpAndUpload(img2Name, 'rm_67_01_extra_flat_2');
    const img3Url = await convertToWebpAndUpload(img3Name, 'rm_67_01_extra_flat_3');
    const img4Url = await convertToWebpAndUpload(img4Name, 'rm_67_01_extra_flat_4');
    const img5Url = await convertToWebpAndUpload(img5Name, 'rm_67_01_extra_flat_5');

    const galleryImages = [
      mainBannerUrl,
      img2Url,
      img3Url,
      img4Url,
      img5Url,
    ];

    console.log('\n--- STEP 2: CONNECTING TO MONGODB ---');
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
      name: { $regex: /Richard Mille RM 67-01 Extra Flat/i }
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 108;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 67-01 Extra Flat',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'RM 67-01 Extra Flat',
      model: 'RM Collection',
      reference: 'RM 67-01',
      material: 'Titanium',
      size: '39 × 47.5 mm',
      caliber: 'Not specified',
      warranty: 'Two Year Service',
      priceUSD: '$5,550.00',
      priceAED: 'AED 20,340.75',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic movement',
      casing: 'Titanium',
      bezel: 'Not specified',
      glass: 'Not specified',
      waterResistance: '30m waterproof tested',
      description: 'The Richard Mille RM 67-01 Extra Flat is an ultra-thin masterpiece in titanium, powered by an automatic movement and engineered with a sleek tonneau case.',
      features: [
        'Movement: Automatic movement',
        'Casing Material: Titanium',
        'Bezel: Not specified',
        'Glass / Crystal: Not specified',
        'Reference Number: RM 67-01',
        'Material Composition: Titanium',
        'Diameter Size: 39 × 47.5 mm',
        'Engine / Caliber: Not specified',
        'Shipping: Free Shipping',
        'Warranty: Two Year Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 67-01 إكسترا فلات',
      brandAr: 'ريتشارد ميل',
      modelAr: 'مجموعة RM',
      materialAr: 'تيتانيوم',
      movementAr: 'حركة أوتوماتيكية',
      casingAr: 'تيتانيوم',
      bezelAr: 'غير محدد',
      glassAr: 'غير محدد',
      waterResistanceAr: 'مقاومة الماء حتى 30 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 67-01 إكسترا فلات بتصميم فائق النحافة مصنوعة من التيتانيوم وتعمل بحركة أوتوماتيكية راقية تجمع بين الخفة والأناقة العالية.',
      featuresAr: [
        'الحركة: حركة أوتوماتيكية',
        'مادة الهيكل: تيتانيوم',
        'الإطار: غير محدد',
        'الزجاج: غير محدد',
        'الرقم المرجعي: RM 67-01',
        'تركيبة المواد: تيتانيوم',
        'الأبعاد: 39 × 47.5 مم',
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
