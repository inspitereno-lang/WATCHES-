import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import Product from '../models/Product.js';
import CatalogueSettings from '../models/CatalogueSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(__dirname, '../.env') });

const SOURCE_DIR = path.join(
  ROOT_DIR,
  'images_all',
  'watch'
);
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_omega_snoopy');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_ATLAS;
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, JWT_SECRET } = process.env;
const API_BASE = 'https://dubaiwatchesgallery.com/api';

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error('❌ Missing Cloudinary environment variables in server/.env');
  process.exit(1);
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  timeout: 60000,
});

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

if (!fs.existsSync(IMAGES_IN_DIR)) {
  fs.mkdirSync(IMAGES_IN_DIR, { recursive: true });
}

const adminToken = jwt.sign(
  { userId: '6a588617f8a36d03a8a291a7', username: 'admin' },
  JWT_SECRET || 't24watches_dubai_luxury_secret_signature_jwt_hash_key_182937',
  { expiresIn: '24h' }
);

async function convertToWebP(srcFilePath, publicId) {
  const webpPath = path.join(TEMP_DIR, `${publicId}.webp`);
  await sharp(srcFilePath)
    .webp({ quality: 92, alphaQuality: 100, lossless: false })
    .toFile(webpPath);
  return webpPath;
}

async function uploadToCloudinary(filePath, publicId, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  [Upload attempt ${attempt}/${maxRetries}] Cloudinary: ${publicId}...`);
      const res = await cloudinary.uploader.upload(filePath, {
        folder: 't24_watches_clean',
        public_id: publicId,
        format: 'webp',
        overwrite: true,
        resource_type: 'image',
      });
      return res.secure_url;
    } catch (err) {
      console.warn(`  ⚠️ Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) throw err;
      await new Promise(r => setTimeout(r, 2500));
    }
  }
}

async function run() {
  console.log('========================================================================');
  console.log('🚀 PROCESSING OMEGA SPEEDMASTER PROFESSIONAL MOONWATCH SNOOPY 2024');
  console.log('========================================================================\n');

  console.log('1. Checking source images in:', SOURCE_DIR);
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory does not exist: ${SOURCE_DIR}`);
  }

  const mainBannerName = 'Omega Speedmaster Snoopy Chronograph Watch.png';
  const galleryImageNames = [
    'Omega Speedmaster Silver Snoopy Caseback.png',
    'Side-Profile Blue Bezel Chronograph Watch.png',
    'Side-Profile Omega-Style Chronograph Watch.png'
  ];

  const mainBannerPath = path.join(SOURCE_DIR, mainBannerName);
  if (!fs.existsSync(mainBannerPath)) {
    throw new Error(`Main banner not found at: ${mainBannerPath}`);
  }

  for (const name of galleryImageNames) {
    const p = path.join(SOURCE_DIR, name);
    if (!fs.existsSync(p)) {
      throw new Error(`Gallery image not found: ${p}`);
    }
  }

  console.log('  ✓ All 4 source image files verified.');

  // 2. Convert to WebP and Upload to Cloudinary
  console.log('\n2. Converting images to WebP & Uploading to Cloudinary...');

  const bannerWebp = await convertToWebP(mainBannerPath, 'omega_speedmaster_snoopy_moonwatch_banner');
  const bannerUrl = await uploadToCloudinary(bannerWebp, 'omega_speedmaster_snoopy_moonwatch_banner');
  console.log('  ⭐ Main Banner uploaded:', bannerUrl);

  const galleryUrls = [bannerUrl];
  for (let i = 0; i < galleryImageNames.length; i++) {
    const imageName = galleryImageNames[i];
    const imagePath = path.join(SOURCE_DIR, imageName);
    const publicId = `omega_speedmaster_snoopy_moonwatch_gallery_${i + 1}`;
    const gWebp = await convertToWebP(imagePath, publicId);
    const gUrl = await uploadToCloudinary(gWebp, publicId);
    galleryUrls.push(gUrl);
    console.log(`  ✓ Gallery image ${i + 1} uploaded:`, gUrl);
  }

  // 3. Prepare product specifications
  const spec = {
    name: 'Omega Speedmaster Professional Moonwatch Snoopy 2024',
    brand: 'Omega',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Speedmaster',
    reference: '310.32.42.50.02.001',
    material: 'Stainless-steel case with rubber strap',
    size: '42 mm',
    caliber: 'Omega Caliber 3861',
    warranty: 'Two Years of Service',
    priceUSD: '$1,146',
    priceAED: 'AED 4,200',
    movement: 'Manual-winding chronograph movement',
    casing: 'Stainless steel',
    bezel: 'Black tachymeter bezel',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Omega Speedmaster Professional Moonwatch Silver Snoopy Award edition pays tribute to the legendary Silver Snoopy Award presented to Omega by NASA astronauts. Encased in 42mm stainless steel with an Ag925 silver dial, blue PVD hour markers, and an embossed Snoopy medallion in the subdial at 9 o\'clock. Driven by the manual-winding Co-Axial Master Chronometer Calibre 3861, it pairs precision chronometric performance with an iconic tribute caseback.',
    features: [
      'Brand: Omega',
      'Sub-brand: Speedmaster',
      'Edition / Maker: Speedmaster Professional Moonwatch Snoopy 2024',
      'Reference Number: 310.32.42.50.02.001',
      'Movement: Manual-winding chronograph movement',
      'Casing Material: Stainless steel',
      'Bezel: Black tachymeter bezel',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Stainless-steel case with rubber strap',
      'Diameter Size: 42 mm',
      'Engine / Caliber: Omega Caliber 3861',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'أوميغا سبيدماستر بروفيشنال مون ووتش سنوبي 2024',
    brandAr: 'أوميغا',
    modelAr: 'سبيدماستر',
    materialAr: 'علبة من الستانلس ستيل مع حزام مطاطي',
    movementAr: 'حركة كرونوغراف تعبئة يدوية، عيار أوميغا 3861',
    casingAr: 'ستانلس ستيل',
    bezelAr: 'إطار تاكيميتر أسود',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة أوميغا سبيدماستر بروفيشنال مون ووتش سيلفر سنوبي تكريماً لجائزة سنوبي الفضية التي منحتها وكالة ناسا لأوميغا. تأتي بعلبة ستانلس ستيل مقاس 42 مم وميناء فضي راقٍ مع ميدالية سنوبي الزرقاء المميزة، وتعمل بحركة أوميغا كاليبر 3861 اليدوية المعتمدة.',
    featuresAr: [
      'العلامة التجارية: أوميغا',
      'العلامة الفرعية: سبيدماستر',
      'الإصدار: سبيدماستر بروفيشنال مون ووتش سنوبي 2024',
      'الرقم المرجعي: 310.32.42.50.02.001',
      'الحركة: حركة كرونوغراف تعبئة يدوية',
      'مادة العلبة: ستانلس ستيل',
      'الإطار: إطار تاكيميتر أسود',
      'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
      'المواد: علبة ستانلس ستيل مع حزام مطاطي',
      'القطر: 42 مم',
      'المحرك: أوميغا عيار 3861',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ],
    inStock: true,
    isVisible: true
  };

  const payload = {
    ...spec,
    image: bannerUrl,
    thumbnail: bannerUrl,
    images: galleryUrls,
    url: ''
  };

  // 4. Save to Live Site via API
  console.log('\n3. Syncing product to Live Site (https://dubaiwatchesgallery.com/api)...');
  const checkRes = await fetch(`${API_BASE}/products?search=310.32.42.50.02.001`);
  const checkData = await checkRes.json();
  const existingLive = (checkData.products || []).find(
    p => p.reference === spec.reference || p.name === spec.name
  );

  let liveProduct;
  if (existingLive) {
    console.log(`  Updating existing live product ID ${existingLive.id}...`);
    const updateRes = await fetch(`${API_BASE}/products/${existingLive.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const updateData = await updateRes.json();
    if (!updateRes.ok) throw new Error(`Live update failed: ${JSON.stringify(updateData)}`);
    liveProduct = updateData.product || existingLive;
    console.log(`  ✓ Updated live product ID ${liveProduct.id}`);
  } else {
    console.log('  Creating new product on live site...');
    const createRes = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify(payload)
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(`Live creation failed: ${JSON.stringify(createData)}`);
    liveProduct = createData.product;
    console.log(`  🎉 Created new live product ID ${liveProduct.id}: ${liveProduct.name}`);
  }

  // 5. Upsert to MongoDB (Atlas) directly
  console.log('\n4. Connecting to MongoDB to upsert product record...');
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('  ✓ Connected to MongoDB:', mongoose.connection.name);

    const assignedId = liveProduct ? liveProduct.id : 251;
    const mongoDoc = await Product.findOneAndUpdate(
      { $or: [{ reference: spec.reference }, { id: assignedId }, { name: spec.name }] },
      {
        $set: {
          id: assignedId,
          ...payload
        }
      },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Successfully upserted product in MongoDB (ID: ${mongoDoc.id})`);
    await mongoose.connection.close();
  } catch (err) {
    console.warn('  ⚠️ Direct MongoDB upsert notice:', err.message);
  }

  // 6. Move the 4 images to "images in"
  console.log('\n5. Moving images to "images in" directory...');
  const allImageFiles = [mainBannerName, ...galleryImageNames];
  for (const fileName of allImageFiles) {
    const fromPath = path.join(SOURCE_DIR, fileName);
    const toPath = path.join(IMAGES_IN_DIR, fileName);
    fs.copyFileSync(fromPath, toPath);
    fs.unlinkSync(fromPath);
    console.log(`  ✓ Moved "${fileName}" -> "images in/${fileName}"`);
  }

  // Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('  ✓ Cleaned up temporary WebP files.');
  } catch { }

  console.log('\n========================================================================');
  console.log('✅ OMEGA SPEEDMASTER SNOOPY HAS BEEN SUCCESSFULLY ADDED & PUBLISHED');
  console.log('========================================================================');
  console.log(`Product ID: ${liveProduct.id}`);
  console.log(`Name: ${liveProduct.name}`);
  console.log(`Reference: ${liveProduct.reference}`);
  console.log(`Price: ${liveProduct.priceUSD} (${liveProduct.priceAED})`);
  console.log(`Live URL: https://dubaiwatchesgallery.com/product/${liveProduct.id}`);
  console.log(`Banner Image: ${bannerUrl}`);
  console.log(`Gallery Images (${galleryUrls.length}):`, galleryUrls);
}

run().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
