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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm67_ogier');

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

  console.log(`\nProcessing image (Direct WebP conversion): "${sourceFilename}"`);
  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  console.log(`  ⚙️  Converting to high-quality WebP...`);
  await sharp(sourcePath)
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
    console.log('Processing Richard Mille RM 67-02 Sébastien Ogier (Direct WebP Upload)');
    console.log('========================================================================');

    // 3.png is specified as the main icon of the product
    const img1Name = 'Richard Mille RM 67-02 Sebastien Ogier1.png';
    const img2Name = 'Richard Mille RM 67-02 Sebastien Ogier2.png';
    const img3Name = 'Richard Mille RM 67-02 Sebastien Ogier3.png'; // MAIN ICON
    const img4Name = 'Richard Mille RM 67-02 Sebastien Ogier4.png';

    console.log('\n--- STEP 1: DIRECT WEBP CONVERSION & CLOUDINARY UPLOAD ---');
    const mainBannerUrl = await convertToWebpAndUpload(img3Name, 'rm_67_02_sebastien_ogier_main_banner_3');
    const img1Url = await convertToWebpAndUpload(img1Name, 'rm_67_02_sebastien_ogier_1');
    const img2Url = await convertToWebpAndUpload(img2Name, 'rm_67_02_sebastien_ogier_2');
    const img4Url = await convertToWebpAndUpload(img4Name, 'rm_67_02_sebastien_ogier_4');

    const galleryImages = [
      mainBannerUrl,
      img1Url,
      img2Url,
      img4Url,
    ];

    console.log('\n--- STEP 2: CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // Look for existing product
    const existingProduct = await Product.findOne({
      name: { $regex: /Richard Mille RM 67-02.*S[eé]bastien Ogier/i }
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 107;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 67-02 Sébastien Ogier',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Sébastien Ogier Edition',
      model: 'RM 67-02',
      reference: 'RM 67-02',
      material: 'Quartz TPT®, Carbon TPT®, Grade 5 titanium movement components, Carbon TPT® and white-gold rotor',
      size: '38.7 × 47.5 mm',
      caliber: 'CRMA7',
      warranty: 'Two-Year Service Warranty',
      priceUSD: '$4,200.00',
      priceAED: 'AED 15,393.00',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Skeletonised automatic-winding movement with hours and minutes',
      casing: 'Quartz TPT® and Carbon TPT®',
      bezel: 'Carbon TPT® / Quartz TPT®',
      glass: 'Sapphire crystal',
      waterResistance: '30m waterproof tested',
      description: 'The Richard Mille RM 67-02 Sébastien Ogier Edition is an ultra-light high-performance sports watch created for the French World Rally Champion. Engineered from Carbon TPT® and Quartz TPT® in the dynamic colors of the French flag, it houses the skeletonised automatic CRMA7 caliber.',
      features: [
        'Movement: Skeletonised automatic-winding movement with hours and minutes',
        'Casing Material: Quartz TPT® and Carbon TPT®',
        'Bezel: Carbon TPT® / Quartz TPT®',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: RM 67-02',
        'Material Composition: Quartz TPT®, Carbon TPT®, Grade 5 titanium movement components, Carbon TPT® and white-gold rotor',
        'Diameter Size: 38.7 × 47.5 mm',
        'Engine / Caliber: CRMA7',
        'Shipping: Free Shipping',
        'Warranty: Two-Year Service Warranty'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 67-02 سيباستيان أوجييه',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 67-02',
      materialAr: 'كوارتز TPT®، كربون TPT®، مكونات حركة من تيتانيوم الدرجة 5 ودوار من الذهب الأبيض',
      movementAr: 'حركة هيكلية أوتوماتيكية التعبئة مع الساعات والدقائق',
      casingAr: 'كوارتز TPT® وكربون TPT®',
      bezelAr: 'كربون TPT® / كوارتز TPT®',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 30 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 67-02 إصدار بطل الراليات سيباستيان أوجييه، مصنوعة من مركب كوارتز TPT® وكربون TPT® المتطور، تعمل بحركة هيكلية أوتوماتيكية عيار CRMA7 وتوفر أقصى درجات الراحة وخفة الوزن والأداء الرياضي.',
      featuresAr: [
        'الحركة: حركة هيكلية أوتوماتيكية التعبئة مع الساعات والدقائق',
        'مادة الهيكل: كوارتز TPT® وكربون TPT®',
        'الإطار: كربون TPT® / كوارتز TPT®',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: RM 67-02',
        'تركيبة المواد: كوارتز TPT®، كربون TPT®، تيتانيوم الدرجة 5 ودوار ذهب أبيض',
        'الأبعاد: 38.7 × 47.5 مم',
        'العيار / المحرك: CRMA7',
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
