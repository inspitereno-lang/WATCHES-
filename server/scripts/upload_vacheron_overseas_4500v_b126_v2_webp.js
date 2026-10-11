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
const TEMP_DIR = path.join(__dirname, 'temp_webp_vacheron_overseas_4500v_b126_v2');

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
    console.log('Processing Vacheron Constantin Overseas Steel 4500V/110A-B126 (5 images)');
    console.log('========================================================================');

    // 1. ChatGPT Image Sep 18, 2026, 11_05_47 AM.png -> MAIN BANNER (as requested)
    // 2. ChatGPT Image Sep 18, 2026, 11_05_54 AM.png -> Image 2
    // 3. ChatGPT Image Sep 18, 2026, 11_06_01 AM.png -> Image 3
    // 4. ChatGPT Image Sep 18, 2026, 11_06_07 AM.png -> Image 4
    // 5. ChatGPT Image Sep 18, 2026, 11_06_16 AM.png -> Image 5
    const file1 = 'ChatGPT Image Sep 18, 2026, 11_05_47 AM.png'; // MAIN BANNER
    const file2 = 'ChatGPT Image Sep 18, 2026, 11_05_54 AM.png';
    const file3 = 'ChatGPT Image Sep 18, 2026, 11_06_01 AM.png';
    const file4 = 'ChatGPT Image Sep 18, 2026, 11_06_07 AM.png';
    const file5 = 'ChatGPT Image Sep 18, 2026, 11_06_16 AM.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER & REMOVING FROM images_all/watch ---');
    const path1 = moveFileToImagesIn(file1, 'Vacheron Constantin Overseas Steel 4500V 110A B126 v2_1.png');
    const path2 = moveFileToImagesIn(file2, 'Vacheron Constantin Overseas Steel 4500V 110A B126 v2_2.png');
    const path3 = moveFileToImagesIn(file3, 'Vacheron Constantin Overseas Steel 4500V 110A B126 v2_3.png');
    const path4 = moveFileToImagesIn(file4, 'Vacheron Constantin Overseas Steel 4500V 110A B126 v2_4.png');
    const path5 = moveFileToImagesIn(file5, 'Vacheron Constantin Overseas Steel 4500V 110A B126 v2_5.png');

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'vacheron_constantin_overseas_4500v_b126_v2_main_1');
    const img2Url = await convertToWebpAndUpload(path2, 'vacheron_constantin_overseas_4500v_b126_v2_2');
    const img3Url = await convertToWebpAndUpload(path3, 'vacheron_constantin_overseas_4500v_b126_v2_3');
    const img4Url = await convertToWebpAndUpload(path4, 'vacheron_constantin_overseas_4500v_b126_v2_4');
    const img5Url = await convertToWebpAndUpload(path5, 'vacheron_constantin_overseas_4500v_b126_v2_5');

    const galleryImages = [
      mainBannerUrl,
      img2Url,
      img3Url,
      img4Url,
      img5Url,
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
        { reference: '4500V/110A-B126' },
        { name: 'Vacheron Constantin Overseas 4500V/110A-B126' }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 180;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Vacheron Constantin Overseas 4500V/110A-B126',
      brand: 'Vacheron Constantin',
      audience: 'Mens',
      factory: 'Overseas',
      model: 'Overseas',
      reference: '4500V/110A-B126',
      material: 'Steel case and steel bracelet',
      size: '41 mm',
      caliber: '5100',
      warranty: 'Two Years of Service',
      priceUSD: '$1,550.00',
      priceAED: 'AED 5,680',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic movement',
      casing: 'Steel',
      bezel: 'Steel',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Vacheron Constantin Overseas reference 4500V/110A-B126 is an iconic luxury sports watch in stainless steel. Featuring a 41 mm case, elegant dial with luminescent markers, sapphire crystal, interchangeable stainless steel bracelet, and the in-house self-winding Calibre 5100 movement.',
      features: [
        'Movement: Automatic movement',
        'Casing Material: Steel',
        'Bezel: Steel',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: 4500V/110A-B126',
        'Material Composition: Steel case and steel bracelet',
        'Diameter Size: 41 mm',
        'Engine / Caliber: 5100',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'فاشيرون كونستانتين أوفرسيز 4500V/110A-B126',
      brandAr: 'فاشيرون كونستانتين',
      modelAr: 'أوفرسيز',
      materialAr: 'علبة وسوار من الفولاذ المقاوم للصدأ',
      movementAr: 'حركة أوتوماتيكية',
      casingAr: 'فولاذ',
      bezelAr: 'فولاذ',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة فاشيرون كونستانتين أوفرسيز الفاخرة المرجعية 4500V/110A-B126 مصنوعة من الفولاذ المقاوم للصدأ بحجم 41 مم مع ميناء أنيق وزجاج ياقوتي كريستال وحركة أوتوماتيكية عيار 5100.',
      featuresAr: [
        'الحركة: حركة أوتوماتيكية',
        'مادة الهيكل: فولاذ',
        'الإطار: فولاذ',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: 4500V/110A-B126',
        'تركيبة المواد: علبة وسوار من الفولاذ',
        'الأبعاد: 41 مم',
        'العيار / المحرك: 5100',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين'
      ]
    };

    const savedProduct = await Product.findOneAndUpdate(
      { $or: [{ id: targetId }, { reference: '4500V/110A-B126' }] },
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
    } catch { }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed. All tasks completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Execution error:', error);
    try {
      await mongoose.connection.close();
    } catch { }
    process.exit(1);
  }
}

main();
