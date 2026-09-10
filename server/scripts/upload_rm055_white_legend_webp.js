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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm055');

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
    console.log('Processing Richard Mille RM 055 Bubba Watson “White Legend”');
    console.log('========================================================================');

    // Image 1 is the main banner image
    const img1Name = 'Richard Mille Rm 055 Bubba Watson Rm 055_1.png';
    const img2Name = 'Richard Mille Rm 055 Bubba Watson Rm 055_2.png';
    const img3Name = 'Richard Mille Rm 055 Bubba Watson Rm 055_3.png';
    const img4Name = 'Richard Mille Rm 055 Bubba Watson Rm 055_4.png';

    console.log('\n--- STEP 1: CONVERT TO WEBP & UPLOAD TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(img1Name, 'rm_055_bubba_watson_white_legend_main_banner_1');
    const img2Url = await convertToWebpAndUpload(img2Name, 'rm_055_bubba_watson_white_legend_2');
    const img3Url = await convertToWebpAndUpload(img3Name, 'rm_055_bubba_watson_white_legend_3');
    const img4Url = await convertToWebpAndUpload(img4Name, 'rm_055_bubba_watson_white_legend_4');

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
        { name: { $regex: /RM 055.*White Legend/i } },
        { name: { $regex: /Richard Mille RM 055 Bubba Watson/i } }
      ]
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 104;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 055 Bubba Watson “White Legend”',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Bubba Watson Edition',
      model: 'RM 055',
      reference: 'RM 055',
      material: 'White ceramic, fluororubber, Grade 5 titanium alloy, PVD-coated/TiAl-treated movement components',
      size: '49.98 × 42.70 mm',
      caliber: 'RMUL2',
      warranty: 'Two-Year Service Warranty',
      priceUSD: '$1,968.00',
      priceAED: 'AED 7,227.48 approx.',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Manual-winding skeletonised movement with double-barrel system and shock-prevention system',
      casing: 'White ceramic (upper case) with white fluororubber sides/case back and Grade 5 titanium alloy',
      bezel: 'White ceramic',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Richard Mille RM 055 Bubba Watson “White Legend” is an ultra-modern sporting icon inspired by the RM 038 Bubba Watson tourbillon watch. Designed for athletes with high shock-resistance, it boasts a skeletonised manual-winding RMUL2 caliber, an ultra-hard ATZ white ceramic bezel, and a lightweight grade 5 titanium caseband coated with protective white rubber.',
      features: [
        'Manual-winding skeletonised movement with double-barrel system (Caliber RMUL2)',
        'Shock-prevention system engineered for high-impact sports',
        'Casing: White ceramic (upper case) with white fluororubber sides/case back and Grade 5 titanium alloy',
        'Bezel: White ceramic (ATZ)',
        'Glass: Sapphire crystal with anti-reflective coating',
        'Material Composition: White ceramic, fluororubber, Grade 5 titanium alloy, PVD-coated/TiAl-treated movement components',
        'Diameter Size: 49.98 × 42.70 mm',
        'Reference Number: RM 055',
        'Edition / Maker: Bubba Watson Edition',
        'Shipping: Free Shipping',
        'Warranty: Two-Year Service Warranty'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 055 بوبا واتسون "الأسطورة البيضاء"',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 055',
      materialAr: 'سيراميك أبيض، مطاط الفلورو، سبيكة تيتانيوم الدرجة 5، مكونات حركة معالجة بـ PVD/TiAl',
      movementAr: 'حركة هيكلية بتعبئة يدوية مع نظام أسطوانة مزدوجة ونظام مقاومة الصدمات (عيار RMUL2)',
      casingAr: 'سيراميك أبيض (العلبة العلوية) مع جوانب وظهر علبة من مطاط الفلورو الأبيض وتيتانيوم درجة 5',
      bezelAr: 'سيراميك أبيض',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون "الأسطورة البيضاء" أيقونة رياضية عصرية مصممة لتحمل الصدمات العالية بحركة هيكلية أوتوماتيكية عيار RMUL2 وإطار سيراميكي أبيض فائق الصلابة.',
      featuresAr: [
        'حركة هيكلية بتعبئة يدوية مع نظام أسطوانة مزدوجة (عيار RMUL2)',
        'نظام حماية ضد الصدمات مصمم للرياضات عالية الشدة',
        'الهيكل: سيراميك أبيض مع جوانب مطاطية وتيتانيوم درجة 5',
        'الإطار: سيراميك أبيض صلب',
        'الزجاج: زجاج ياقوتي مقاوم للخدش والانعكاس',
        'تركيبة المواد: سيراميك أبيض، مطاط الفلورو، تيتانيوم الدرجة 5',
        'الأبعاد: 49.98 × 42.70 مم',
        'الرقم المرجعي: RM 055',
        'الإصدار: إصدار بوبا واتسون',
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
