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
const SOURCE_DIR = path.join(ROOT_DIR, 'images_all', 'watch');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_rolex_bruce_wayne');

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

function findFileInDir(dir, pattern) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const found = files.find(f => pattern.test(f));
  return found ? path.join(dir, found) : null;
}

function moveFileToImagesIn(pattern, standardTargetName) {
  const sourcePath = findFileInDir(SOURCE_DIR, pattern);
  const destPath = path.join(IMAGES_IN_DIR, standardTargetName);

  if (sourcePath && fs.existsSync(sourcePath)) {
    console.log(`📦 Moving "${path.basename(sourcePath)}" from "images_all/watch" to "images in/${standardTargetName}"...`);
    fs.copyFileSync(sourcePath, destPath);
    fs.unlinkSync(sourcePath);
    console.log(`✓ Successfully moved and removed from source`);
  } else if (fs.existsSync(destPath)) {
    console.log(`ℹ️ "${standardTargetName}" already exists in "images in"`);
  } else {
    throw new Error(`File matching ${pattern} not found in source (${SOURCE_DIR}) or destination (${IMAGES_IN_DIR})`);
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
    console.log('Processing Rolex GMT-Master II Bruce Wayne (126710GRNR)');
    console.log('========================================================================');

    // 1: Main banner
    // 2, 3, 4: Gallery images
    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER & REMOVING FROM images_all/watch ---');
    const path1 = moveFileToImagesIn(/Bruce\s*Wayne.*1\.png$/i, 'Rolex GMT-Master II Bruce Wayne 1.png');
    const path2 = moveFileToImagesIn(/Bruce\s*Wayne.*2\.png$/i, 'Rolex GMT-Master II Bruce Wayne 2.png');
    const path3 = moveFileToImagesIn(/Bruce\s*Wayne.*3\.png$/i, 'Rolex GMT-Master II Bruce Wayne 3.png');
    const path4 = moveFileToImagesIn(/Bruce\s*Wayne.*4\.png$/i, 'Rolex GMT-Master II Bruce Wayne 4.png');

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'rolex_gmt_master_ii_bruce_wayne_1');
    const img2Url = await convertToWebpAndUpload(path2, 'rolex_gmt_master_ii_bruce_wayne_2');
    const img3Url = await convertToWebpAndUpload(path3, 'rolex_gmt_master_ii_bruce_wayne_3');
    const img4Url = await convertToWebpAndUpload(path4, 'rolex_gmt_master_ii_bruce_wayne_4');

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
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
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
        { name: { $regex: /Bruce Wayne/i } },
        { factory: { $regex: /Bruce Wayne/i } },
        { reference: '126710GRNR' }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 125;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing ID ' + existingProduct.id + ': ' + existingProduct.name : 'Creating new product with ID ' + targetId})`);

    const productPayload = {
      id: targetId,
      name: 'Rolex GMT-Master II Bruce Wayne',
      brand: 'Rolex',
      audience: 'Mens',
      factory: 'GMT-Master II Bruce Wayne',
      model: 'GMT-Master',
      reference: '126710GRNR',
      material: 'Steel case',
      size: '40 mm',
      caliber: 'Not specified',
      warranty: 'Two Years of Service',
      priceUSD: '$1,473',
      priceAED: 'AED 5,400',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Not specified',
      casing: 'Steel',
      bezel: 'Ceramic',
      glass: 'Not specified',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Rolex GMT-Master II Bruce Wayne (Reference 126710GRNR) is an exceptional luxury timepiece featuring a 40mm steel case, iconic black and grey ceramic bezel, and precision craftsmanship. Complete with Two Years of Service warranty and Free Shipping.',
      features: [
        'Brand: Rolex',
        'Sub-brand: GMT-Master',
        'Edition / Maker: GMT-Master II Bruce Wayne',
        'Movement: Not specified',
        'Casing Material: Steel',
        'Bezel: Ceramic',
        'Glass / Crystal: Not specified',
        'Reference Number: 126710GRNR',
        'Material Composition: Steel case',
        'Diameter Size: 40 mm',
        'Engine / Caliber: Not specified',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'رولكس جي إم تي ماستر 2 بروس واين',
      brandAr: 'رولكس',
      modelAr: 'جي إم تي ماستر',
      materialAr: 'علبة من الفولاذ',
      movementAr: 'غير محدد',
      casingAr: 'فولاذ',
      bezelAr: 'سيراميك',
      glassAr: 'غير محدد',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة رولكس جي إم تي ماستر II بروس واين (المرجع 126710GRNR) الفاخرة، تتميز بهيكل فولاذي مقاس 40 مم مع إطار سيراميك أسود ورمادي أنيق وحرفية متقنة، مع ضمان خدمة لمدة عامين وشحن مجاني.',
      featuresAr: [
        'الماركة: رولكس',
        'الموديل الفرعي: جي إم تي ماستر',
        'الإصدار / الصانع: جي إم تي ماستر 2 بروس واين',
        'الحركة: غير محدد',
        'مادة الهيكل: فولاذ',
        'الإطار: سيراميك',
        'الزجاج: غير محدد',
        'الرقم المرجعي: 126710GRNR',
        'تركيبة المواد: علبة من الفولاذ',
        'الأبعاد: 40 مم',
        'العيار / المحرك: غير محدد',
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
