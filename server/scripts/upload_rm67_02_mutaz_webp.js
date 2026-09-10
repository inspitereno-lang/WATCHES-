import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { removeBackground as localRemoveBg } from '@imgly/background-removal-node';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const IMAGES_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm67_mutaz');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, REMOVEBG_API_KEY } = process.env;
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

async function removeBgWithApi(filePath) {
  if (!REMOVEBG_API_KEY) throw new Error('No removebg key');
  const fileData = fs.readFileSync(filePath);
  const base64Image = fileData.toString('base64');
  
  const response = await fetch('https://api.remove.bg/v1.0/removebg', {
    method: 'POST',
    headers: {
      'X-Api-Key': REMOVEBG_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_file_b64: base64Image,
      size: 'auto',
      format: 'png',
      bg_color: '',
      type: 'product',
      type_level: '2',
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`remove.bg error ${response.status}: ${err}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function removeBgLocal(filePath) {
  const fileData = fs.readFileSync(filePath);
  const rgbaPngBuffer = await sharp(fileData)
    .ensureAlpha()
    .png()
    .toBuffer();

  const pngBlob = new Blob([rgbaPngBuffer], { type: 'image/png' });
  const resultBlob = await localRemoveBg(pngBlob, {
    debug: false,
    model: 'medium',
    output: {
      format: 'image/png',
      quality: 0.95,
    },
  });

  const arrayBuffer = await resultBlob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function processTransparentWebpAndUpload(sourceFilename, publicId) {
  const sourcePath = path.join(IMAGES_DIR, sourceFilename);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`File not found: ${sourcePath}`);
  }

  console.log(`\nProcessing image: "${sourceFilename}"`);
  let transparentPngBuffer;
  
  try {
    console.log('  🎨 Removing background via remove.bg API...');
    transparentPngBuffer = await removeBgWithApi(sourcePath);
    console.log('  ✓ Background removed via remove.bg API');
  } catch (apiErr) {
    console.warn(`  ⚠️  remove.bg API failed (${apiErr.message}), falling back to local AI background removal...`);
    transparentPngBuffer = await removeBgLocal(sourcePath);
    console.log('  ✓ Background removed via local AI');
  }

  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  console.log(`  ⚙️  Converting transparent PNG to high-quality WebP...`);
  await sharp(transparentPngBuffer)
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
    console.log('Processing Richard Mille RM 67-02 Mutaz (Transparent BG & WebP)');
    console.log('========================================================================');

    // 1.png is the main banner
    const img1Name = 'Richard Mille Rm 67-02 Mutaz1.png';
    const img3Name = 'Richard Mille Rm 67-02 Mutaz3.png';
    const img4Name = 'Richard Mille Rm 67-02 Mutaz4.png';
    const img5Name = 'Richard Mille Rm 67-02 Mutaz5.png';

    console.log('\n--- STEP 1: BACKGROUND REMOVAL, WEBP CONVERSION & CLOUDINARY UPLOAD ---');
    const mainBannerUrl = await processTransparentWebpAndUpload(img1Name, 'rm_67_02_mutaz_main_banner_1');
    const img3Url = await processTransparentWebpAndUpload(img3Name, 'rm_67_02_mutaz_3');
    const img4Url = await processTransparentWebpAndUpload(img4Name, 'rm_67_02_mutaz_4');
    const img5Url = await processTransparentWebpAndUpload(img5Name, 'rm_67_02_mutaz_5');

    const galleryImages = [
      mainBannerUrl,
      img3Url,
      img4Url,
      img5Url,
    ];

    console.log('\n--- STEP 2: CONNECTING TO MONGODB ---');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    // Look for existing product
    const existingProduct = await Product.findOne({
      name: { $regex: /Richard Mille RM 67-02.*Mutaz/i }
    });

    let targetId = existingProduct?.id;
    if (!targetId) {
      const maxProduct = await Product.findOne().sort({ id: -1 });
      targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 107;
    }

    console.log(`Using Product ID: ${targetId} (${existingProduct ? 'Updating existing: ' + existingProduct.name : 'Creating new'})`);

    const productPayload = {
      id: targetId,
      name: 'Richard Mille RM 67-02 Mutaz',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'RM 67-02 Mutaz',
      model: 'RM Collection',
      reference: 'RM 67-02',
      material: 'Carbon TPT®, Quartz TPT®, Grade 5 titanium and elastic strap',
      size: '38.7 × 47.5 mm',
      caliber: 'CRMA7',
      warranty: 'Two Years Service',
      priceUSD: '$4,200.00',
      priceAED: 'AED 15,393.00',
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryImages,
      movement: 'Skeletonised automatic-winding movement with hours and minutes',
      casing: 'Carbon TPT® and Quartz TPT®',
      bezel: 'Quartz TPT®',
      glass: 'Sapphire crystal',
      waterResistance: '30m waterproof tested',
      description: 'The Richard Mille RM 67-02 Mutaz Barshim edition is an ultra-light sports watch crafted from Carbon TPT® and Quartz TPT®. Driven by the skeletonised automatic CRMA7 caliber, it combines exceptional shock resistance with high ergonomics and an elastic comfort strap.',
      features: [
        'Movement: Skeletonised automatic-winding movement with hours and minutes',
        'Casing Material: Carbon TPT® and Quartz TPT®',
        'Bezel: Quartz TPT®',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: RM 67-02',
        'Material Composition: Carbon TPT®, Quartz TPT®, Grade 5 titanium and elastic strap',
        'Diameter Size: 38.7 × 47.5 mm',
        'Engine / Caliber: CRMA7',
        'Shipping: Free Shipping',
        'Warranty: Two Years Service'
      ],
      inStock: true,
      isVisible: true,
      // Arabic translations
      nameAr: 'ريتشارد ميل RM 67-02 معتز برشم',
      brandAr: 'ريتشارد ميل',
      modelAr: 'مجموعة RM',
      materialAr: 'كربون TPT®، كوارتز TPT®، تيتانيوم من الدرجة 5 وحزام مطاطي',
      movementAr: 'حركة هيكلية أوتوماتيكية التعبئة مع الساعات والدقائق',
      casingAr: 'كربون TPT® وكوارتز TPT®',
      bezelAr: 'كوارتز TPT®',
      glassAr: 'زجاج ياقوتي كريستال',
      waterResistanceAr: 'مقاومة الماء حتى 30 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 67-02 إصدار معتز برشم، مصنوعة من ألياف كربون TPT® وكوارتز TPT® فائقة الخفة والمتانة مع حركة هيكلية أوتوماتيكية عيار CRMA7 وحزام مطاطي مرن.',
      featuresAr: [
        'الحركة: حركة هيكلية أوتوماتيكية التعبئة مع الساعات والدقائق',
        'مادة الهيكل: كربون TPT® وكوارتز TPT®',
        'الإطار: كوارتز TPT®',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: RM 67-02',
        'تركيبة المواد: كربون TPT®، كوارتز TPT®، تيتانيوم الدرجة 5 وحزام مطاطي',
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
    console.log(`Main Image (Image 1 - Transparent WebP): ${savedProduct.image}`);
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
