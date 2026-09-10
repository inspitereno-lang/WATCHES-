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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm055_classic');

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
    console.log('Processing Richard Mille RM 055 Bubba Watson');
    console.log('========================================================================');

    // Image 1 is the main banner image
    const img1Name = 'Richard Mille RM 055 Bubba Watson1.png';
    const img2Name = 'Richard Mille RM 055 Bubba Watson2.png';
    const img3Name = 'Richard Mille RM 055 Bubba Watson3.png';
    const img6Name = 'Richard Mille RM 055 Bubba Watson6.png';

    console.log('\n--- STEP 1: CONVERT TO WEBP & UPLOAD TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(img1Name, 'rm_055_bubba_watson_classic_main_banner_1');
    const img2Url = await convertToWebpAndUpload(img2Name, 'rm_055_bubba_watson_classic_2');
    const img3Url = await convertToWebpAndUpload(img3Name, 'rm_055_bubba_watson_classic_3');
    const img6Url = await convertToWebpAndUpload(img6Name, 'rm_055_bubba_watson_classic_6');

    const galleryImages = [
      mainBannerUrl,
      img2Url,
      img3Url,
      img6Url,
    ];

    console.log('\n--- STEP 2: CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // Ensure we do not overwrite RM 055 White Legend (ID 104)
    const existingProduct = await Product.findOne({
      name: 'Richard Mille RM 055 Bubba Watson'
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 105;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 055 Bubba Watson',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'RM 055 Bubba Watson',
      model: 'RM Collection',
      reference: 'RM055',
      material: 'Ceramic case, Grade 5 titanium movement/case components, rubber strap',
      size: '49.9 mm × 42.7 mm',
      caliber: 'RMUL2',
      warranty: '2-Year Service Warranty',
      priceUSD: '$1,698.00',
      priceAED: 'AED 6,236.51 approx.',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Manual-winding skeletonised movement with hours, minutes and seconds; double-barrel system',
      casing: 'Ceramic with Grade 5 titanium components',
      bezel: 'Ceramic',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Richard Mille RM 055 Bubba Watson features an ultra-resistant ceramic case construction with skeletonised manual-winding caliber RMUL2. Designed in collaboration with professional golfer Bubba Watson, this timepiece delivers exceptional shock resistance and aerodynamic wrist presence.',
      features: [
        'Manual-winding skeletonised movement with hours, minutes and seconds (Caliber RMUL2)',
        'Double-barrel system for optimal torque and chronometric consistency',
        'Casing: Ceramic with Grade 5 titanium components',
        'Bezel: Ceramic',
        'Glass: Sapphire crystal',
        'Material Composition: Ceramic case, Grade 5 titanium movement/case components, rubber strap',
        'Diameter Size: 49.9 mm × 42.7 mm',
        'Reference Number: RM055',
        'Edition / Maker: RM 055 Bubba Watson',
        'Shipping: Free Shipping',
        'Warranty: 2-Year Service Warranty'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 055 بوبا واتسون',
      brandAr: 'ريتشارد ميل',
      modelAr: 'مجموعة RM',
      materialAr: 'علبة سيراميك، مكونات حركة وهيكل من التيتانيوم درجة 5، حزام مطاطي',
      movementAr: 'حركة هيكلية بتعبئة يدوية مع ساعات، دقائق وثواني؛ نظام أسطوانة مزدوجة (عيار RMUL2)',
      casingAr: 'سيراميك مع مكونات تيتانيوم من الدرجة 5',
      bezelAr: 'سيراميك',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون بهيكل سيراميكي متطور مقاوم للصدمات، مع حركة هيكلية يدوية التعبئة عيار RMUL2 وسوار مطاطي فاخر للراحة والأداء العالي.',
      featuresAr: [
        'حركة هيكلية بتعبئة يدوية مع ساعات ودقائق وثواني (عيار RMUL2)',
        'نظام أسطوانة مزدوجة لعزم دوران منتظم ودقة فائقة',
        'الهيكل: سيراميك مع تيتانيوم درجة 5',
        'الإطار: سيراميك',
        'الزجاج: زجاج ياقوتي كريستال',
        'المواد: سيراميك، تيتانيوم درجة 5، حزام مطاطي',
        'الأبعاد: 49.9 مم × 42.7 مم',
        'الرقم المرجعي: RM055',
        'الإصدار: RM 055 بوبا واتسون',
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
