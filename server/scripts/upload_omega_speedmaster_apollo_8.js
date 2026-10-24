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
  'watch',
  'bhavana_watches201026',
  'Watch 1'
);
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_omega_apollo8');

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
  console.log('🚀 PROCESSING OMEGA SPEEDMASTER DARK SIDE OF THE MOON APOLLO 8');
  console.log('========================================================================\n');

  console.log('1. Checking source images in:', SOURCE_DIR);
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory does not exist: ${SOURCE_DIR}`);
  }

  const mainBannerName = 'Isolated Black and Yellow Speedmaster Watch.png';
  const galleryImageNames = [
    'Omega Speedmaster Dark Side Rear View.png',
    'Omega Speedmaster Black and Yellow Loop.png',
    'Black Leather Watch Strap with Horseshoe Clasp.png'
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

  const bannerWebp = await convertToWebP(mainBannerPath, 'omega_speedmaster_apollo_8_banner');
  const bannerUrl = await uploadToCloudinary(bannerWebp, 'omega_speedmaster_apollo_8_banner');
  console.log('  ⭐ Main Banner uploaded:', bannerUrl);

  const galleryUrls = [bannerUrl];
  for (let i = 0; i < galleryImageNames.length; i++) {
    const imageName = galleryImageNames[i];
    const imagePath = path.join(SOURCE_DIR, imageName);
    const publicId = `omega_speedmaster_apollo_8_gallery_${i + 1}`;
    const gWebp = await convertToWebP(imagePath, publicId);
    const gUrl = await uploadToCloudinary(gWebp, publicId);
    galleryUrls.push(gUrl);
    console.log(`  ✓ Gallery image ${i + 1} uploaded:`, gUrl);
  }

  // 3. Prepare product data
  const spec = {
    name: 'Omega Speedmaster Dark Side of the Moon Apollo 8',
    brand: 'Omega',
    audience: 'Mens',
    factory: 'Dark Side of the Moon Edition',
    model: 'Speedmaster',
    reference: '310.92.44.50.01.001',
    material: 'Black ceramic case and black rubber strap with yellow interior',
    size: '44.25 mm',
    caliber: 'Omega 3869',
    warranty: 'Two Years of Service',
    priceUSD: '$1,146',
    priceAED: 'AED 4,200',
    movement: 'Manual-winding chronograph movement',
    casing: 'Black ceramic',
    bezel: 'Black ceramic',
    glass: 'Scratch-resistant sapphire crystal with anti-reflective treatment on both sides',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Omega Speedmaster Dark Side of the Moon Apollo 8 commemorates the historic Apollo 8 lunar orbit mission. Expertly crafted from a single block of black ceramic with yellow accent details, it features a skeletonized dial displaying a laser-ablated lunar surface representing the near side of the Moon. Powered by the manual-winding Calibre Omega 3869 chronograph movement visible through the transparent sapphire caseback, it is paired with a perforated black rubber strap with yellow interior.',
    features: [
      'Brand: Omega',
      'Sub-brand: Speedmaster',
      'Edition / Maker: Dark Side of the Moon Apollo 8',
      'Reference Number: 310.92.44.50.01.001',
      'Movement: Manual-winding chronograph movement',
      'Casing Material: Black ceramic',
      'Bezel: Black ceramic',
      'Glass / Crystal: Scratch-resistant sapphire crystal with anti-reflective treatment on both sides',
      'Material Composition: Black ceramic case and black rubber strap with yellow interior',
      'Diameter Size: 44.25 mm',
      'Engine / Caliber: Omega 3869',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'أوميغا سبيدماستر دارك سايد أوف ذا مون أبولو 8',
    brandAr: 'أوميغا',
    modelAr: 'سبيدماستر',
    materialAr: 'علبة من السيراميك الأسود وحزام مطاطي أسود ببطانة صفراء',
    movementAr: 'حركة كرونوغراف تعبئة يدوية، عيار أوميغا 3869',
    casingAr: 'سيراميك أسود',
    bezelAr: 'سيراميك أسود',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش مع معالجة مضادة للانعكاس على الوجهين',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة أوميغا سبيدماستر دارك سايد أوف ذا مون أبولو 8 تحتفي بمهمة أبولو 8 التاريخية بميناء هيكلي منقوش بالليزر يمثل سطح القمر، مصنوعة من السيراميك الأسود مع لمسات صفراء مميزة وتعمل بحركة أوميغا 3869 اليدوية الفاخرة.',
    featuresAr: [
      'العلامة التجارية: أوميغا',
      'العلامة الفرعية: سبيدماستر',
      'الإصدار: دارك سايد أوف ذا مون أبولو 8',
      'الرقم المرجعي: 310.92.44.50.01.001',
      'الحركة: حركة كرونوغراف تعبئة يدوية',
      'مادة العلبة: سيراميك أسود',
      'الإطار: سيراميك أسود',
      'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش والانعكاس على الوجهين',
      'المواد: سيراميك أسود ومطاط ببطانة صفراء',
      'القطر: 44.25 مم',
      'المحرك: أوميغا 3869',
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
  const checkRes = await fetch(`${API_BASE}/products?search=310.92.44.50.01.001`);
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

  // 5. Also upsert to MongoDB (Atlas) directly
  console.log('\n4. Connecting to MongoDB to upsert product record...');
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('  ✓ Connected to MongoDB:', mongoose.connection.name);

    // Ensure Omega exists in CatalogueSettings master-brands
    try {
      const settings = await CatalogueSettings.findOne({ key: 'master-brands' });
      if (settings && settings.brands) {
        const omegaBrand = settings.brands.find(b => b.name && b.name.toLowerCase() === 'omega');
        if (omegaBrand) {
          if (!omegaBrand.models.includes('Speedmaster')) {
            omegaBrand.models.push('Speedmaster');
            await settings.save();
            console.log('  ✓ Added Speedmaster to Omega models in CatalogueSettings');
          }
        }
      }
    } catch (e) {
      console.warn('  ⚠️ Could not update master-brands:', e.message);
    }

    const assignedId = liveProduct ? liveProduct.id : 249;
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

  // Clean up source dir if empty
  try {
    const remaining = fs.readdirSync(SOURCE_DIR);
    if (remaining.length === 0) {
      fs.rmdirSync(SOURCE_DIR);
      console.log(`  ✓ Removed empty folder: ${SOURCE_DIR}`);
    }
  } catch {}

  // Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('  ✓ Cleaned up temporary WebP files.');
  } catch {}

  console.log('\n========================================================================');
  console.log('✅ OMEGA SPEEDMASTER APOLLO 8 HAS BEEN SUCCESSFULLY ADDED & PUBLISHED');
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
