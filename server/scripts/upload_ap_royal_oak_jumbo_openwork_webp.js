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
const TEMP_DIR = path.join(__dirname, 'temp_webp_ap_jumbo_openwork');

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
    console.log('Processing Audemars Piguet Royal Oak Jumbo Open Work Extra Thin');
    console.log('========================================================================');

    const file1 = 'Audemars Piguet Royal Oak Jumbo Open Work Extra Thin_1.png'; // MAIN BANNER
    const file2 = 'Audemars Piguet Royal Oak Jumbo Open Work Extra Thin_2.png';
    const file3 = 'Audemars Piguet Royal Oak Jumbo Open Work Extra Thin_3.png';
    const file4 = 'Audemars Piguet Royal Oak Jumbo Open Work Extra Thin_4.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER ---');
    const path1 = moveFileToImagesIn(file1);
    const path2 = moveFileToImagesIn(file2);
    const path3 = moveFileToImagesIn(file3);
    const path4 = moveFileToImagesIn(file4);

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'ap_ro_jumbo_openwork_main_1');
    const img2Url = await convertToWebpAndUpload(path2, 'ap_ro_jumbo_openwork_2');
    const img3Url = await convertToWebpAndUpload(path3, 'ap_ro_jumbo_openwork_3');
    const img4Url = await convertToWebpAndUpload(path4, 'ap_ro_jumbo_openwork_4');

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
        { name: { $regex: /Royal Oak Jumbo Open Work Extra Thin/i } },
        { reference: '16204OR.OO.1240OR.03' }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 112;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Royal Oak Jumbo Open Work Extra Thin',
      brand: 'Audemars Piguet',
      audience: 'Mens',
      factory: 'Royal Oak Jumbo Open Work Extra Thin',
      model: 'Royal Oak',
      reference: '16204OR.OO.1240OR.03',
      material: 'Rose gold case and integrated rose gold bracelet, open-worked movement, sapphire crystal',
      size: '39 mm',
      caliber: 'Not specified',
      warranty: 'Two Years Service',
      priceUSD: '$1,670.00',
      priceAED: 'AED 6,120.55',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic movement with open-worked / skeletonised design',
      casing: 'Rose Gold',
      bezel: 'Rose Gold, octagonal Royal Oak bezel with exposed screws',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Audemars Piguet Royal Oak Jumbo Open Work Extra Thin in 18-carat rose gold combines ultra-thin proportions with a mesmerizing skeletonised dial, showcasing the high-horology mechanical architecture with warm rose gold tones.',
      features: [
        'Movement: Automatic movement with open-worked / skeletonised design',
        'Casing Material: Rose Gold',
        'Bezel: Rose Gold, octagonal Royal Oak bezel with exposed screws',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: 16204OR.OO.1240OR.03',
        'Material Composition: Rose gold case and integrated rose gold bracelet, open-worked movement, sapphire crystal',
        'Diameter Size: 39 mm',
        'Engine / Caliber: Not specified in the supplied listing',
        'Shipping: Free Shipping',
        'Warranty: Two Years Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'رويال أوك جامبو أوبن وورك فائقة النحافة الهيكلية',
      brandAr: 'أوديمار بيغيه',
      modelAr: 'رويال أوك',
      materialAr: 'علبة وسوار متكامل من الذهب الوردي، حركة هيكلية مخرمة، زجاج ياقوتي كريستال',
      movementAr: 'حركة أوتوماتيكية بتصميم هيكلي مخرم',
      casingAr: 'ذهب وردي',
      bezelAr: 'ذهب وردي، إطار رويال أوك ثماني الأضلاع مع براغٍ مكشوفة',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة أوديمار بيغيه رويال أوك جامبو أوبن وورك فائقة النحافة مصنوعة من الذهب الوردي عيار 18 قيراطاً مع تصميم هيكلي مخرم يبرز براعة الهندسة الميكانيكية الراقية.',
      featuresAr: [
        'الحركة: حركة أوتوماتيكية بتصميم هيكلي مخرم',
        'مادة الهيكل: ذهب وردي',
        'الإطار: ذهب وردي، إطار رويال أوك ثماني الأضلاع مع براغٍ مكشوفة',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: 16204OR.OO.1240OR.03',
        'تركيبة المواد: علبة وسوار من الذهب الوردي، حركة هيكلية، زجاج ياقوتي',
        'الأبعاد: 39 مم',
        'المحرك / العيار: غير محدد في القائمة المرفقة',
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
