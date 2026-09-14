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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rolex_gmt_126711chnr');

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
    console.log('Processing Rolex GMT-Master II "Root Beer" 126711CHNR');
    console.log('========================================================================');

    // 1. ChatGPT Image Sep 14, 2026, 12_34_49 PM.png -> MAIN BANNER
    // 2. ChatGPT Image Sep 14, 2026, 12_35_11 PM.png -> image 2
    // 3. ChatGPT Image Sep 14, 2026, 12_35_20 PM.png -> image 3
    // 4. ChatGPT Image Sep 14, 2026, 12_35_46 PM.png -> image 4
    const file1 = 'ChatGPT Image Sep 14, 2026, 12_34_49 PM.png'; // MAIN BANNER
    const file2 = 'ChatGPT Image Sep 14, 2026, 12_35_11 PM.png';
    const file3 = 'ChatGPT Image Sep 14, 2026, 12_35_20 PM.png';
    const file4 = 'ChatGPT Image Sep 14, 2026, 12_35_46 PM.png';

    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER & REMOVING FROM images_all/watch ---');
    const path1 = moveFileToImagesIn(file1, 'Rolex GMT-Master II 126711CHNR Root Beer_1.png');
    const path2 = moveFileToImagesIn(file2, 'Rolex GMT-Master II 126711CHNR Root Beer_2.png');
    const path3 = moveFileToImagesIn(file3, 'Rolex GMT-Master II 126711CHNR Root Beer_3.png');
    const path4 = moveFileToImagesIn(file4, 'Rolex GMT-Master II 126711CHNR Root Beer_4.png');

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'rolex_gmt_master_ii_126711chnr_main_1');
    const img2Url = await convertToWebpAndUpload(path2, 'rolex_gmt_master_ii_126711chnr_2');
    const img3Url = await convertToWebpAndUpload(path3, 'rolex_gmt_master_ii_126711chnr_3');
    const img4Url = await convertToWebpAndUpload(path4, 'rolex_gmt_master_ii_126711chnr_4');

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
        { reference: '126711CHNR' },
        { name: 'Rolex GMT-Master II 126711CHNR' }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 164;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Rolex GMT-Master II 126711CHNR',
      brand: 'Rolex',
      audience: 'Mens',
      factory: 'Root Beer / Everose Rolesor',
      model: 'GMT-Master II',
      reference: '126711CHNR',
      material: 'Everose Rolesor case with Oystersteel monobloc middle case, screw-down Everose gold crown, Everose Rolesor Oyster bracelet',
      size: '40 mm',
      caliber: 'Rolex Calibre 3285',
      warranty: 'Two Years Service',
      priceUSD: '$1,582',
      priceAED: 'AED 5,800',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Rolex Calibre 3285 self-winding automatic movement with second time-zone (GMT) hour hand and instantaneous date, approximately 70 hours power reserve',
      casing: 'Everose Rolesor — Oystersteel and Everose gold',
      bezel: 'Everose gold bidirectional rotatable 24-hour graduated bezel with brown and black Cerachrom insert and engraved numerals',
      glass: 'Scratch-resistant sapphire crystal with Cyclops lens over the date',
      waterResistance: '100m waterproof vacuum tested',
      description: 'The Rolex GMT-Master II "Root Beer" reference 126711CHNR is crafted in Everose Rolesor (combination of Oystersteel and 18ct Everose gold) featuring a black dial and a two-colour brown and black Cerachrom bezel insert. Powered by the high-precision Rolex Calibre 3285 mechanical movement with GMT function and 70-hour power reserve.',
      features: [
        'Movement: Rolex Calibre 3285 self-winding automatic movement with second time-zone (GMT) hour hand and instantaneous date, approximately 70 hours power reserve',
        'Casing Material: Everose Rolesor — Oystersteel and Everose gold',
        'Bezel: Everose gold bidirectional rotatable 24-hour graduated bezel with brown and black Cerachrom insert and engraved numerals',
        'Glass / Crystal: Scratch-resistant sapphire crystal with Cyclops lens over the date',
        'Reference Number: 126711CHNR',
        'Material Composition: Everose Rolesor case with Oystersteel monobloc middle case, screw-down Everose gold crown, Everose Rolesor Oyster bracelet',
        'Diameter Size: 40 mm',
        'Engine / Caliber: Rolex Calibre 3285',
        'Shipping: Free Shipping',
        'Warranty: Two Years Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'رولكس جي إم تي ماستر 2 "روت بير" 126711CHNR',
      brandAr: 'رولكس',
      modelAr: 'جي إم تي ماستر II',
      materialAr: 'علبة وسوار من إيفروز روليسور (فولاذ وذهب إيفروز عيار 18 قيراط) مع إطار سيراميك بني وأسود',
      movementAr: 'حركة ميكانيكية أوتوماتيكية عيار 3285 مع منطقة زمنية ثانية واحتياطي طاقة 70 ساعة',
      casingAr: 'إيفروز روليسور (فولاذ وذهب إيفروز)',
      bezelAr: 'إطار سيراميك سيراكروم ثنائي اللون بني وأسود قابل للدوران في الاتجاهين',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش مع عدسة سايكلوبس',
      waterResistanceAr: 'مقاومة الماء حتى 100 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة رولكس جي إم تي ماستر II "روت بير" موديل 126711CHNR الأيقونية، مصممة من ذهب إيفروز والفولاذ (Everose Rolesor) مع إطار سيراكروم سيراميك بني وأسود عيار 24 ساعة، ومزودة بعيار 3285 فائق الدقة.',
      featuresAr: [
        'الحركة: حركة رولكس أوتوماتيكية عيار 3285 مع منطقة زمنية ثانية واحتياطي طاقة 70 ساعة',
        'مادة الهيكل: إيفروز روليسور (فولاذ أويستر وذهب إيفروز)',
        'الإطار: إطار سيراكروم سيراميك بني وأسود عيار 24 ساعة قابل للدوران في الاتجاهين',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش مع عدسة مكبرة للتاريخ',
        'الرقم المرجعي: 126711CHNR',
        'تركيبة المواد: علبة وسوار إيفروز روليسور مع تاج من ذهب إيفروز',
        'الأبعاد: 40 مم',
        'العيار / المحرك: Rolex Calibre 3285',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين'
      ]
    };

    const savedProduct = await Product.findOneAndUpdate(
      { $or: [{ id: targetId }, { reference: '126711CHNR' }] },
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
