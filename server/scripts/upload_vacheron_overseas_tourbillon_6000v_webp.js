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
const TEMP_DIR = path.join(__dirname, 'temp_webp_vacheron_tourbillon_6000v');

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

function moveFileToImagesIn(sourceFilename, targetFilename) {
  const srcPath = path.join(SOURCE_DIR, sourceFilename);
  const destPath = path.join(IMAGES_IN_DIR, targetFilename || sourceFilename);

  if (fs.existsSync(srcPath)) {
    console.log(`📦 Moving "${sourceFilename}" from "images_all/watch" to "images in/${targetFilename || sourceFilename}"...`);
    fs.copyFileSync(srcPath, destPath);
    fs.unlinkSync(srcPath);
    console.log(`✓ Successfully moved and removed from source: ${sourceFilename}`);
  } else if (fs.existsSync(destPath)) {
    console.log(`ℹ️ "${targetFilename || sourceFilename}" already exists in "images in"`);
  } else {
    throw new Error(`File not found in source (${srcPath}) or destination (${destPath})`);
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
    console.log('Processing Vacheron Constantin Overseas Tourbillon 6000V/110A-B544');
    console.log('========================================================================');

    // 1. ChatGPT Image Sep 16, 2026, 11_10_54 AM.png -> MAIN BANNER
    // 2. ChatGPT Image Sep 16, 2026, 11_11_04 AM.png -> Image 2
    // 3. ChatGPT Image Sep 16, 2026, 11_11_13 AM.png -> Image 3
    // 4. ChatGPT Image Sep 16, 2026, 11_11_25 AM.png -> Image 4
    const file1 = 'ChatGPT Image Sep 16, 2026, 11_10_54 AM.png'; // MAIN BANNER
    const file2 = 'ChatGPT Image Sep 16, 2026, 11_11_04 AM.png';
    const file3 = 'ChatGPT Image Sep 16, 2026, 11_11_13 AM.png';
    const file4 = 'ChatGPT Image Sep 16, 2026, 11_11_25 AM.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER & REMOVING FROM images_all/watch ---');
    const path1 = moveFileToImagesIn(file1, 'Vacheron Constantin Overseas Tourbillon 6000V 110A B544_1.png');
    const path2 = moveFileToImagesIn(file2, 'Vacheron Constantin Overseas Tourbillon 6000V 110A B544_2.png');
    const path3 = moveFileToImagesIn(file3, 'Vacheron Constantin Overseas Tourbillon 6000V 110A B544_3.png');
    const path4 = moveFileToImagesIn(file4, 'Vacheron Constantin Overseas Tourbillon 6000V 110A B544_4.png');

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'vacheron_constantin_overseas_tourbillon_6000v_main_1');
    const img2Url = await convertToWebpAndUpload(path2, 'vacheron_constantin_overseas_tourbillon_6000v_2');
    const img3Url = await convertToWebpAndUpload(path3, 'vacheron_constantin_overseas_tourbillon_6000v_3');
    const img4Url = await convertToWebpAndUpload(path4, 'vacheron_constantin_overseas_tourbillon_6000v_4');

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
        { reference: '6000V/110A-B544' },
        { name: 'Vacheron Constantin Overseas Tourbillon 6000V/110A-B544' },
        { name: 'Vacheron Constantin Overseas Tourbillon' }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 168;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Vacheron Constantin Overseas Tourbillon 6000V/110A-B544',
      brand: 'Vacheron Constantin',
      audience: 'Mens',
      factory: 'Tourbillon',
      model: 'Overseas',
      reference: '6000V/110A-B544',
      material: 'Stainless steel case and bracelet',
      size: '42.5 mm',
      caliber: '2160',
      warranty: 'Two Years of Service',
      priceUSD: '$76,176',
      priceAED: 'AED 279,185',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic tourbillon movement with approximately 80 hours of power reserve and 30 jewels',
      casing: 'Stainless steel',
      bezel: 'Stainless steel',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Vacheron Constantin Overseas Tourbillon reference 6000V/110A-B544 is a masterpiece of haute horlogerie in stainless steel with a 42.5 mm case, iconic Maltese cross-inspired tourbillon cage at 6 o’clock, peripheral rotor Calibre 2160 with 80 hours of power reserve, and translucent blue-lacquered dial.',
      features: [
        'Movement: Automatic tourbillon movement with approximately 80 hours of power reserve and 30 jewels',
        'Casing Material: Stainless steel',
        'Bezel: Stainless steel',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: 6000V/110A-B544',
        'Material Composition: Stainless steel case and bracelet',
        'Diameter Size: 42.5 mm',
        'Engine / Caliber: 2160',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'فاشيرون كونستانتين أوفرسيز توربيون 6000V/110A-B544',
      brandAr: 'فاشيرون كونستانتين',
      modelAr: 'أوفرسيز توربيون',
      materialAr: 'علبة وسوار من الفولاذ المقاوم للصدأ',
      movementAr: 'حركة توربيون أوتوماتيكية مع احتياطي طاقة يصل إلى 80 ساعة و30 حجراً كريماً',
      casingAr: 'فولاذ مقاوم للصدأ',
      bezelAr: 'فولاذ مقاوم للصدأ',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة فاشيرون كونستانتين أوفرسيز توربيون 6000V/110A-B544 الفاخرة، مصنوعة من الفولاذ المقاوم للصدأ بحجم 42.5 مم، ومزودة بقفص توربيون مميز بتصميم صليب مالطا عند موضع الساعة 6 وعيار 2160 فائق الدقة مع روتر محيطي.',
      featuresAr: [
        'الحركة: حركة توربيون أوتوماتيكية مع احتياطي طاقة 80 ساعة و30 حجراً',
        'مادة الهيكل: فولاذ مقاوم للصدأ',
        'الإطار: فولاذ مقاوم للصدأ',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'الرقم المرجعي: 6000V/110A-B544',
        'تركيبة المواد: علبة وسوار من الفولاذ المقاوم للصدأ',
        'الأبعاد: 42.5 مم',
        'العيار / المحرك: 2160',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين'
      ]
    };

    const savedProduct = await Product.findOneAndUpdate(
      { $or: [{ id: targetId }, { reference: '6000V/110A-B544' }] },
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
