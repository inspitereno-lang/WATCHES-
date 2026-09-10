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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm027');

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
    console.log('Processing Richard Mille RM 027 Rafael Nadal Tourbillon LIMITED 50');
    console.log('========================================================================');

    // Image 1 is the main banner image as requested
    const img1Name = 'Richard Mille RM 027 Rafael Nadal Tourbillon LIMITED 50_1.png';
    const img2Name = 'Richard Mille RM 027 Rafael Nadal Tourbillon LIMITED 50_2.png';
    const img3Name = 'Richard Mille RM 027 Rafael Nadal Tourbillon LIMITED 50_3.png';
    const img4Name = 'Richard Mille RM 027 Rafael Nadal Tourbillon LIMITED 50_4.png';

    console.log('\n--- STEP 1: CONVERT TO WEBP & UPLOAD TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(img1Name, 'rm_027_rafael_nadal_tourbillon_main_banner_1');
    const img2Url = await convertToWebpAndUpload(img2Name, 'rm_027_rafael_nadal_tourbillon_2');
    const img3Url = await convertToWebpAndUpload(img3Name, 'rm_027_rafael_nadal_tourbillon_3');
    const img4Url = await convertToWebpAndUpload(img4Name, 'rm_027_rafael_nadal_tourbillon_4');

    const galleryImages = [
      mainBannerUrl,
      img2Url,
      img3Url,
      img4Url,
    ];

    console.log('\n--- STEP 2: CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // Look for existing product with similar name or reference
    const existingProduct = await Product.findOne({
      $or: [
        { name: { $regex: /RM 027.*Rafael Nadal/i } },
        { name: { $regex: /Richard Mille RM 027/i } }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 103;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 027 Tourbillon Rafael Nadal — Limited Edition of 50',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'RM 027 Tourbillon Rafael Nadal — Limited Edition of 50',
      model: 'RM Collection',
      reference: 'RM 027',
      material: 'Carbon case with Velcro strap',
      size: '38.5 mm',
      caliber: 'RM027',
      warranty: 'Two-Year Service Warranty',
      priceUSD: 'Not specified',
      priceAED: 'Not specified',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Manual-winding tourbillon movement with hours and minutes',
      casing: 'Carbon',
      bezel: 'Carbon',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Richard Mille RM 027 Tourbillon Rafael Nadal Limited Edition of 50 is an ultra-lightweight revolutionary sports timepiece developed specifically for tennis legend Rafael Nadal. Engineered with an ultra-light carbon composite case, skeletonized tourbillon caliber RM027, and extreme shock resistance capable of withstanding intense athletic impacts.',
      features: [
        'Manual-winding tourbillon movement with hours and minutes (Caliber RM027)',
        'Casing Material: Ultra-light carbon composite',
        'Bezel: Carbon',
        'Glass: Sapphire crystal',
        'Material Composition: Carbon case with Velcro strap',
        'Diameter Size: 38.5 mm',
        'Reference Number: RM 027',
        'Edition / Maker: RM 027 Tourbillon Rafael Nadal — Limited Edition of 50',
        'Shipping: Free Shipping',
        'Warranty: Two Years Service Warranty'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 027 توربيون رافائيل نادال — إصدار محدود من 50 قطعة',
      brandAr: 'ريتشارد ميل',
      modelAr: 'مجموعة RM',
      materialAr: 'علبة من الكربون مع حزام فيلكرو',
      movementAr: 'حركة توربيون بتعبئة يدوية مع الساعات والدقائق (عيار RM027)',
      casingAr: 'كربون',
      bezelAr: 'كربون',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 027 توربيون رافائيل نادال إصدار محدود من 50 قطعة، تمتاز بهيكل كربوني فائق الخفة ومقاوم للصدمات العنيفة، ومزودة بحركة توربيون يدوية التعبئة مصممة بالتعاون مع أسطورة التنس رافائيل نادال.',
      featuresAr: [
        'حركة توربيون بتعبئة يدوية مع الساعات والدقائق (عيار RM027)',
        'هيكل الساعة: مركب كربون فائق الخفة',
        'الإطار: كربون',
        'الزجاج: زجاج ياقوتي مقاوم للخدش',
        'تركيبة المواد: علبة كربونية مع حزام فيلكرو',
        'القطر: 38.5 مم',
        'الرقم المرجعي: RM 027',
        'الإصدار: RM 027 توربيون رافائيل نادال — إصدار محدود من 50',
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
