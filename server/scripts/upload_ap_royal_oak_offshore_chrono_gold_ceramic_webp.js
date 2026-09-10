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
const TEMP_DIR = path.join(__dirname, 'temp_webp_ap_offshore_chrono');

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
    console.log('Processing Audemars Piguet Royal Oak Offshore Chronograph');
    console.log('========================================================================');

    const file1 = 'Audemars Piguet Royal Oak Offshore Chronograph_1.png'; // MAIN BANNER
    const file2 = 'Audemars Piguet Royal Oak Offshore Chronograph_2.png';
    const file3 = 'Audemars Piguet Royal Oak Offshore Chronograph_3.png';
    const file4 = 'Audemars Piguet Royal Oak Offshore Chronograph_4.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER ---');
    const path1 = moveFileToImagesIn(file1);
    const path2 = moveFileToImagesIn(file2);
    const path3 = moveFileToImagesIn(file3);
    const path4 = moveFileToImagesIn(file4);

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'ap_ro_offshore_chrono_main_1');
    const img2Url = await convertToWebpAndUpload(path2, 'ap_ro_offshore_chrono_2');
    const img3Url = await convertToWebpAndUpload(path3, 'ap_ro_offshore_chrono_3');
    const img4Url = await convertToWebpAndUpload(path4, 'ap_ro_offshore_chrono_4');

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
        { name: 'Audemars Piguet Royal Oak Offshore Chronograph', reference: '26420RO.OO.A002CA.01' },
        { reference: '26420RO.OO.A002CA.01' }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 114;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Audemars Piguet Royal Oak Offshore Chronograph',
      brand: 'Audemars Piguet',
      audience: 'Mens',
      factory: 'Royal Oak Offshore Chronograph',
      model: 'Royal Oak Offshore',
      reference: '26420RO.OO.A002CA.01',
      material: 'Rose-gold case, black ceramic bezel, sapphire crystal, and rubber strap',
      size: '43 mm',
      caliber: 'Caliber 4401',
      warranty: 'Two Years Service',
      priceUSD: '$1,647.00',
      priceAED: 'AED 6,036.26',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic chronograph movement',
      casing: 'Rose Gold',
      bezel: 'Black ceramic',
      glass: 'Sapphire crystal',
      waterResistance: '100m waterproof tested',
      description: 'The Audemars Piguet Royal Oak Offshore Chronograph 43mm in 18-carat rose gold features a contrasting black ceramic bezel, pushpieces and screw-locked crown. Powered by the integrated in-house flyback chronograph Calibre 4401.',
      features: [
        'Movement: Automatic chronograph movement (Caliber 4401)',
        'Casing Material: 18k Rose Gold',
        'Bezel: Black ceramic',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Reference Number: 26420RO.OO.A002CA.01',
        'Material Composition: Rose-gold case, black ceramic bezel, sapphire crystal, and rubber strap',
        'Diameter Size: 43 mm',
        'Engine / Caliber: Caliber 4401',
        'Shipping: Free Shipping',
        'Warranty: Two Years Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'أوديمار بيغيه رويال أوك أوفشور كرونوغراف',
      brandAr: 'أوديمار بيغيه',
      modelAr: 'رويال أوك أوفشور',
      materialAr: 'علبة من الذهب الوردي، إطار سيراميك أسود، زجاج ياقوتي، حزام مطاطي',
      movementAr: 'حركة كرونوغراف أوتوماتيكية (عيار 4401)',
      casingAr: 'ذهب وردي',
      bezelAr: 'سيراميك أسود',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 100 متر',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة أوديمار بيغيه رويال أوك أوفشور كرونوغراف بقطر 43 مم بهيكل من الذهب الوردي عيار 18 قيراط وإطار من السيراميك الأسود، تعمل بحركة كرونوغراف مصنعية عيار 4401 مع حزام مطاطي رياضي مريح.',
      featuresAr: [
        'الحركة: حركة كرونوغراف أوتوماتيكية (عيار 4401)',
        'مادة الهيكل: ذهب وردي عيار 18 قيراط',
        'الإطار: سيراميك أسود',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: 26420RO.OO.A002CA.01',
        'تركيبة المواد: علبة ذهب وردي، إطار سيراميك أسود، زجاج ياقوتي وحزام مطاطي',
        'الأبعاد: 43 مم',
        'العيار / المحرك: Caliber 4401',
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
