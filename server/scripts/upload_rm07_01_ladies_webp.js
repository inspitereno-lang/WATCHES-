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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm07');

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

  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  console.log(`Converting "${sourceFilename}" to WebP format...`);
  await sharp(sourcePath)
    .webp({ quality: 90 })
    .toFile(tempWebpPath);
  console.log(`✓ Converted to ${tempWebpPath} (${fs.statSync(tempWebpPath).size} bytes)`);

  console.log(`Uploading ${webpFilename} as public_id="${publicId}" to Cloudinary...`);
  const result = await cloudinary.uploader.upload(tempWebpPath, {
    folder: 't24_watches_clean',
    public_id: publicId,
    format: 'webp',
    overwrite: true,
    resource_type: 'image',
  });

  console.log(`✓ Cloudinary WebP URL: ${result.secure_url}`);
  return result.secure_url;
}

async function main() {
  try {
    console.log('========================================================================');
    console.log('Processing Richard Mille RM 07-01 “Ladies” Rose Gold Diamond Jasper Dial');
    console.log('========================================================================');

    // Image 1 is the main banner
    const img1Name = 'Richard Mille RM 007 07-01 ‘Ladies’ Rose Gold Diamond Set Jasper Dial1.png';
    const img3Name = 'Richard Mille RM 007 07-01 ‘Ladies’ Rose Gold Diamond Set Jasper Dial3.png';
    const img2Name = 'Richard Mille RM 007 07-01 ‘Ladies’ Rose Gold Diamond Set Jasper Dial2.png';
    const img4Name = 'Richard Mille RM 007 07-01 ‘Ladies’ Rose Gold Diamond Set Jasper Dial4.png';

    console.log('\n--- STEP 1: CONVERT TO WEBP & UPLOAD TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(img1Name, 'rm_07_01_ladies_rose_gold_jasper_main_banner_1');
    const img3Url = await convertToWebpAndUpload(img3Name, 'rm_07_01_ladies_rose_gold_jasper_3');
    const img2Url = await convertToWebpAndUpload(img2Name, 'rm_07_01_ladies_rose_gold_jasper_2');
    const img4Url = await convertToWebpAndUpload(img4Name, 'rm_07_01_ladies_rose_gold_jasper_4');

    const galleryImages = [
      mainBannerUrl,
      img3Url,
      img2Url,
      img4Url,
    ];

    console.log('\n--- STEP 2: CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // Look for existing product with similar name or reference
    const existingProduct = await Product.findOne({
      $or: [
        { name: { $regex: /RM 07-01.*Jasper/i } },
        { name: { $regex: /RM 007.*Jasper/i } },
        { name: { $regex: /Richard Mille RM 07-01/i } }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 102;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 07-01 “Ladies” Rose Gold Diamond Set Jasper Dial',
      brand: 'Richard Mille',
      audience: 'Ladies',
      factory: 'Ladies Edition',
      model: 'RM 07',
      reference: 'RM 07-01',
      material: 'Rose gold case with diamond-set bezel and jasper dial',
      size: 'Approx. 45 × 31 mm',
      caliber: 'Automatic movement',
      warranty: 'Two-Year Service Warranty',
      priceUSD: '$1,590.00',
      priceAED: 'AED 5,838.28 approx.',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic movement with working tourbillon function',
      casing: 'Rose Gold',
      bezel: 'Diamond-set rose gold',
      glass: 'Sapphire crystal',
      waterResistance: '30m waterproof tested',
      description: 'The Richard Mille RM 07-01 Ladies Edition combines exquisite elegance and cutting-edge horological mastery. Featuring a stunning rose gold tonneau case, diamond-set bezel, vibrant jasper dial, and a precision automatic movement with working tourbillon function.',
      features: [
        'Automatic movement with working tourbillon function',
        'Casing Material: Rose Gold',
        'Bezel: Diamond-set rose gold',
        'Glass: Sapphire crystal',
        'Material Composition: Rose gold case with diamond-set bezel and jasper dial',
        'Diameter Size: Approx. 45 × 31 mm',
        'Reference Number: RM 07-01',
        'Edition / Maker: Ladies Edition',
        'Shipping: Free Shipping',
        'Warranty: Two-Year Service Warranty'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 07-01 للسيدات من الذهب الوردي المرصع بالألماس وميناء يشب',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 07',
      materialAr: 'علبة من الذهب الوردي مع إطار مرصع بالألماس وميناء من حجر اليشب',
      movementAr: 'حركة أوتوماتيكية مع وظيفة توربيون شغالة',
      casingAr: 'ذهب وردي',
      bezelAr: 'ذهب وردي مرصع بالألماس',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 30 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 07-01 للسيدات تجمع بين الفخامة الاستثنائية والبراعة السويسرية، بهيكل من الذهب الوردي الأنيق وإطار مرصع بقطع الألماس الفاخرة مع ميناء يشب طبيعي وحركة أوتوماتيكية متطورة.',
      featuresAr: [
        'حركة أوتوماتيكية مع وظيفة توربيون شغالة',
        'هيكل الساعة: ذهب وردي فاخر',
        'الإطار: ذهب وردي مرصع بالألماس',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'تركيبة المواد: علبة ذهب وردي مع إطار ألماس وميناء يشب',
        'القطر والأبعاد: حوالي 45 × 31 مم',
        'الرقم المرجعي: RM 07-01',
        'الإصدار: إصدار السيدات (Ladies Edition)',
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
    console.log(`Audience: ${savedProduct.audience}`);
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
    console.log(`Main Image (Image 1 - WebP): ${savedProduct.image}`);
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
