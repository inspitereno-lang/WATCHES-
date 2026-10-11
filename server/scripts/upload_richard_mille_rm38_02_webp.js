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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm38_02');

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
    console.log('Processing Richard Mille RM 38-02 (Conversion to WebP, Cloudinary & MongoDB)');
    console.log('========================================================================');

    // Step 1: Move the 4 RM 38-02 images to "images in"
    console.log('\n--- STEP 1: MOVING FILES TO "images in" FOLDER & REMOVING FROM images_all/watch ---');
    const path1 = moveFileToImagesIn(/Richard\s*Mille.*RM\s*38-02.*1\.png$/i, 'Richard Mille RM 38-02 1.png');
    const path2 = moveFileToImagesIn(/Richard\s*Mille.*RM\s*38-02.*2\.png$/i, 'Richard Mille RM 38-02 2.png');
    const path3 = moveFileToImagesIn(/Richard\s*Mille.*RM\s*38-02.*3\.png$/i, 'Richard Mille RM 38-02 3.png');
    const path4 = moveFileToImagesIn(/Richard\s*Mille.*RM\s*38-02.*4\.png$/i, 'Richard Mille RM 38-02 4.png');

    console.log('\n--- STEP 2: CONVERTING TO WEBP & UPLOADING TO CLOUDINARY ---');
    // Main banner is image 1 as requested
    const mainBannerUrl = await convertToWebpAndUpload(path1, 'richard_mille_rm38_02_1');
    const img2Url = await convertToWebpAndUpload(path2, 'richard_mille_rm38_02_2');
    const img3Url = await convertToWebpAndUpload(path3, 'richard_mille_rm38_02_3');
    const img4Url = await convertToWebpAndUpload(path4, 'richard_mille_rm38_02_4');

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
        { reference: 'RM3802' },
        { reference: 'RM 38-02' },
        { reference: 'RM38-02' },
        { name: { $regex: /^Richard Mille\s+RM\s*38-02/i } }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 194;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing ID ' + existingProduct.id + ': ' + existingProduct.name : 'Creating new product with ID ' + targetId})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 38-02',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'RM 38-02',
      model: 'RM',
      reference: 'RM3802',
      material: 'Carbon case and rubber bracelet',
      size: '43.7 × 50.0 mm',
      caliber: 'RM38-02',
      warranty: 'Two Years of Service',
      priceUSD: '$2,019',
      priceAED: 'AED 7,400',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Manual-winding movement',
      casing: 'Carbon',
      bezel: 'Carbon',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Richard Mille RM 38-02 is a pinnacle of high-performance horology and avant-garde design. Featuring an ultra-resistant Carbon case, high-grade rubber bracelet, scratch-resistant sapphire crystal, and powered by the precision RM38-02 manual-winding movement. Includes Two Years of Service warranty and Free Shipping.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM',
        'Edition / Maker: RM 38-02',
        'Movement: Manual-winding movement',
        'Casing Material: Carbon',
        'Bezel: Carbon',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: RM3802',
        'Material Composition: Carbon case and rubber bracelet',
        'Diameter Size: 43.7 × 50.0 mm',
        'Engine / Caliber: RM38-02',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 38-02',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM',
      materialAr: 'علبة من الكربون وسوار مطاطي',
      movementAr: 'حركة يدوية التعبئة',
      casingAr: 'كربون',
      bezelAr: 'كربون',
      glassAr: 'كريستال الياقوت السافاير',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'تعتبر ساعة ريتشارد ميل RM 38-02 تحفة هندسية في صناعة الساعات الفاخرة، تتميز بهيكل مصنوع من الكربون عالي المتانة، وسوار مطاطي مريح، وزجاج ياقوتي مقاوم للخدش، مع حركة يدوية التعبئة عيار RM38-02. تشمل ضمان خدمة لمدة عامين وشحن مجاني.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة التجارية الفرعية: RM',
        'الإصدار / الصانع: RM 38-02',
        'الحركة: حركة يدوية التعبئة',
        'مادة الهيكل: كربون',
        'الإطار: كربون',
        'الزجاج / الكريستال: كريستال الياقوت السافاير',
        'الرقم المرجعي: RM3802',
        'تركيبة المواد: علبة من الكربون وسوار مطاطي',
        'حجم القطر: 43.7 × 50.0 مم',
        'المحرك / العيار: RM38-02',
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
    console.log(`Main Image / Banner (WebP): ${savedProduct.image}`);
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
