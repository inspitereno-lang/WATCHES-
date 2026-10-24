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
  'bhavana_watches201026'
);
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_omega_seamaster');

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
  console.log('🚀 PROCESSING OMEGA SEAMASTER DIVER 300M JAMES BOND 007 OHMSS');
  console.log('========================================================================\n');

  console.log('1. Checking source images in:', SOURCE_DIR);
  if (!fs.existsSync(SOURCE_DIR)) {
    throw new Error(`Source directory does not exist: ${SOURCE_DIR}`);
  }

  const mainBannerName = 'Gold Omega Seamaster on Black Rubber Strap.png';
  const galleryImageNames = [
    'Angled Omega Seamaster Dive Watch.png',
    'Omega Rubber Strap and Buckle Detail.png',
    'Omega Seamaster Dive Watch Cutout.png'
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

  const bannerWebp = await convertToWebP(mainBannerPath, 'omega_seamaster_james_bond_007_ohmss_banner');
  const bannerUrl = await uploadToCloudinary(bannerWebp, 'omega_seamaster_james_bond_007_ohmss_banner');
  console.log('  ⭐ Main Banner uploaded:', bannerUrl);

  const galleryUrls = [bannerUrl];
  for (let i = 0; i < galleryImageNames.length; i++) {
    const imageName = galleryImageNames[i];
    const imagePath = path.join(SOURCE_DIR, imageName);
    const publicId = `omega_seamaster_james_bond_007_ohmss_gallery_${i + 1}`;
    const gWebp = await convertToWebP(imagePath, publicId);
    const gUrl = await uploadToCloudinary(gWebp, publicId);
    galleryUrls.push(gUrl);
    console.log(`  ✓ Gallery image ${i + 1} uploaded:`, gUrl);
  }

  // 3. Prepare product specifications
  const spec = {
    name: 'Omega Seamaster Diver 300M James Bond 007 OHMSS Limited Edition',
    brand: 'Omega',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Seamaster',
    reference: '210.22.42.20.01.004',
    material: 'Stainless steel and 18K yellow gold case, black rubber strap, steel buckle',
    size: '42 mm',
    caliber: 'Omega Caliber 8800',
    warranty: 'Two Years of Service',
    priceUSD: '$1,146',
    priceAED: 'AED 4,200',
    movement: 'Automatic movement with date function',
    casing: 'Stainless steel and 18K yellow gold',
    bezel: 'Black ceramic bezel',
    glass: 'Domed, scratch-resistant sapphire crystal with anti-reflective treatment',
    waterResistance: '300m / 30 bar waterproof vacuum tested',
    description: 'The Omega Seamaster Diver 300M James Bond 007 OHMSS Limited Edition celebrates the 50th anniversary of "On Her Majesty\'s Secret Service". Crafted with a robust stainless steel case accented with 18K yellow gold and a black ceramic bezel, it features a spiral-brushed black ceramic dial engraved with a 9mm bullet icon and iconic gun-barrel pattern. An 18K yellow gold plate on the case side is inscribed with the unique edition number, powered by the Omega Caliber 8800 master chronometer movement with date display, fitted with an integrated black rubber strap.',
    features: [
      'Brand: Omega',
      'Sub-brand: Seamaster',
      'Edition / Maker: Seamaster Diver 300 M James Bond 007 OHMSS Limited Edition',
      'Reference Number: 210.22.42.20.01.004',
      'Movement: Automatic movement with date function',
      'Casing Material: Stainless steel and 18K yellow gold',
      'Bezel: Black ceramic bezel',
      'Glass / Crystal: Domed, scratch-resistant sapphire crystal with anti-reflective treatment',
      'Material Composition: Stainless steel and gold case, black rubber strap, steel buckle',
      'Diameter Size: 42 mm',
      'Engine / Caliber: Omega Caliber 8800',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'أوميغا سيماستر دايفر 300M جيمس بوند 007 إصدار محدود OHMSS',
    brandAr: 'أوميغا',
    modelAr: 'سيماستر',
    materialAr: 'ستانلس ستيل وذهب أصفر عيار 18 قيراط مع حزام مطاطي أسود',
    movementAr: 'حركة أوتوماتيكية مع وظيفة التاريخ، عيار أوميغا 8800',
    casingAr: 'ستانلس ستيل وذهب أصفر عيار 18 قيراط',
    bezelAr: 'إطار سيراميك أسود',
    glassAr: 'زجاج ياقوتي مقبب ومقاوم للخدش والانعكاس',
    waterResistanceAr: 'مقاومة الماء حتى 300 متر / 30 بار مع صمام تفريغ الهيليوم',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تحتفي ساعة أوميغا سيماستر دايفر 300M جيمس بوند 007 بالإصدار المحدود بمناسبة الذكرى الخمسين لفيلم جيمس بوند الشهير، تجمع بين علبة الستانلس ستيل والذهب الأصفر عيار 18 قيراط وميناء سيراميك أسود بنقش سبطانة المسدس، وتعمل بحركة أوميغا كاليبر 8800 الأوتوماتيكية.',
    featuresAr: [
      'العلامة التجارية: أوميغا',
      'العلامة الفرعية: سيماستر',
      'الإصدار: سيماستر دايفر 300M جيمس بوند 007 إصدار محدود OHMSS',
      'الرقم المرجعي: 210.22.42.20.01.004',
      'الحركة: حركة أوتوماتيكية مع وظيفة التاريخ',
      'مادة العلبة: ستانلس ستيل وذهب أصفر عيار 18 قيراط',
      'الإطار: سيراميك أسود',
      'الزجاج: زجاج ياقوتي مقبب ومقاوم للخدش والانعكاس',
      'المواد: ستانلس ستيل وذهب مع حزام مطاطي أسود ومشبك ستيل',
      'القطر: 42 مم',
      'المحرك: أوميغا كاليبر 8800',
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
  const checkRes = await fetch(`${API_BASE}/products?search=210.22.42.20.01.004`);
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

    // Ensure Omega has Seamaster in master-brands
    try {
      const settings = await CatalogueSettings.findOne({ key: 'master-brands' });
      if (settings && settings.brands) {
        const omegaBrand = settings.brands.find(b => b.name && b.name.toLowerCase() === 'omega');
        if (omegaBrand) {
          if (!omegaBrand.models.includes('Seamaster')) {
            omegaBrand.models.push('Seamaster');
            await settings.save();
            console.log('  ✓ Added Seamaster to Omega models in CatalogueSettings');
          }
        }
      }
    } catch (e) {
      console.warn('  ⚠️ Could not update master-brands:', e.message);
    }

    const assignedId = liveProduct ? liveProduct.id : 250;
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
  console.log('✅ OMEGA SEAMASTER 007 OHMSS HAS BEEN SUCCESSFULLY ADDED & PUBLISHED');
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
