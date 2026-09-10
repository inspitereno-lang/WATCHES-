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
const TEMP_DIR = path.join(__dirname, 'temp_webp');

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

  const webpFilename = `${path.parse(sourceFilename).name}.webp`;
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
    console.log('=====================================================');
    console.log('Processing Richard Mille RM 67-02 Alexis Pinturault');
    console.log('=====================================================');

    // Images to process
    // 3.png is the main banner image
    const img3Name = 'Richard Mille RM 67-02 Automatic Alexis Pinturault3.png';
    const img1Name = 'Richard Mille RM 67-02 Automatic Alexis Pinturault1.png';
    const img5Name = 'Richard Mille RM 67-02 Automatic Alexis Pinturault5.png';
    const img2Name = 'Richard Mille RM 67-02 Automatic Alexis Pinturault2.png';

    console.log('\n--- STEP 1: CONVERT TO WEBP & UPLOAD TO CLOUDINARY ---');
    const mainBannerUrl = await convertToWebpAndUpload(img3Name, 'rm_67_02_alexis_pinturault_main_banner_3');
    const img1Url = await convertToWebpAndUpload(img1Name, 'rm_67_02_alexis_pinturault_1');
    const img5Url = await convertToWebpAndUpload(img5Name, 'rm_67_02_alexis_pinturault_5');
    const img2Url = await convertToWebpAndUpload(img2Name, 'rm_67_02_alexis_pinturault_2');

    const galleryImages = [
      mainBannerUrl,
      img1Url,
      img5Url,
      img2Url,
    ];

    console.log('\n--- STEP 2: CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // Look for existing product with similar name or reference
    const existingProduct = await Product.findOne({
      name: { $regex: /Richard Mille RM 67-02 Automatic Alexis Pinturault/i }
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 101;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing' : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 67-02 Automatic Alexis Pinturault',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Alexis Pinturault',
      model: 'RM 67-02',
      reference: 'RM 67-02',
      material: 'Quartz TPT®, Carbon TPT®, Grade 5 titanium, and Carbon TPT® / white gold rotor',
      size: '38.70 × 47.52 mm',
      caliber: 'CRMA7',
      warranty: '2-Year Service Warranty',
      priceUSD: '$4,300',
      priceAED: 'AED 15,791.75 approx.',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Automatic winding, skeletonised movement with hours and minutes',
      casing: 'Quartz TPT® bezel and caseback; Carbon TPT® caseband',
      bezel: 'Quartz TPT®',
      glass: 'Sapphire crystal',
      waterResistance: '30m waterproof tested',
      description: 'The Richard Mille RM 67-02 Automatic Alexis Pinturault is an ultra-light ergonomic masterpiece. Powered by the skeletonised CRMA7 caliber, crafted with Quartz TPT® bezel and caseback and a Carbon TPT® caseband, representing the pinnacle of high-performance luxury sports horology.',
      features: [
        'Automatic winding skeletonised movement with hours and minutes (Caliber CRMA7)',
        'Casing: Quartz TPT® bezel and caseback; Carbon TPT® caseband',
        'Bezel: Quartz TPT®',
        'Glass: Sapphire crystal',
        'Material Composition: Quartz TPT®, Carbon TPT®, Grade 5 titanium, and Carbon TPT® / white gold rotor',
        'Diameter Size: 38.70 × 47.52 mm',
        'Reference Number: RM 67-02',
        'Edition / Maker: Alexis Pinturault'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 67-02 أوتوماتيك ألكسيس بينتورولت',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 67-02',
      materialAr: 'كوارتز TPT®، كربون TPT®، تيتانيوم من الدرجة 5 ودوار من الذهب الأبيض',
      movementAr: 'تعبئة أوتوماتيكية، حركة هيكلية مع الساعات والدقائق (عيار CRMA7)',
      casingAr: 'إطار وظهر علبة من كوارتز TPT®؛ حزام علبة من كربون TPT®',
      bezelAr: 'كوارتز TPT®',
      glassAr: 'زجاج ياقوتي',
      waterResistanceAr: 'مقاومة الماء حتى 30 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 67-02 أوتوماتيك ألكسيس بينتورولت فائقة الخفة والأناقة، بهيكل من كوارتز TPT® وكربون TPT® وحركة هيكلية أوتوماتيكية عيار CRMA7.',
      featuresAr: [
        'حركة هيكلية بتعبئة أوتوماتيكية مع الساعات والدقائق (عيار CRMA7)',
        'الهيكل: إطار وظهر علبة من كوارتز TPT®؛ حزام علبة من كربون TPT®',
        'الإطار: كوارتز TPT®',
        'الزجاج: زجاج ياقوتي كريستال',
        'المواد: كوارتز TPT®، كربون TPT®، تيتانيوم الدرجة 5، دوار كربون TPT® / ذهب أبيض',
        'الحجم والقطر: 38.70 × 47.52 مم',
        'الرقم المرجعي: RM 67-02',
        'الإصدار: ألكسيس بينتورولت'
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
    console.log(`Main Image (Image 3 - WebP): ${savedProduct.image}`);
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
