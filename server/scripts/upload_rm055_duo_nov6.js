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

const WATCH_DIR = path.join(ROOT_DIR, 'images_all', 'watch', 'WATCH');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm055_nov6');

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
      await new Promise((r) => setTimeout(r, 2500));
    }
  }
}

const productsToProcess = [
  {
    folderName: 'watch1',
    slug: 'richard_mille_rm055_bubba_watson_forged_carbon_red_strap',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Forged Carbon Skeleton Watch with Red Strap.png',
      'Red Titanium Watch Strap Detail.png',
      'Titanium Strap Detail with Red Crown Button.png',
    ],
    spec: {
      name: 'Richard Mille RM 055 Bubba Watson Forged Carbon Red Strap',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Bubba Watson Carbon Edition',
      model: 'RM 055',
      reference: 'RM055 Carbon Red',
      material: 'Forged carbon case, black bezel, high-comfort red rubber strap, titanium folding clasp',
      size: '49.9 × 42.7 mm',
      caliber: 'Caliber RMUL2 (55-hour power reserve)',
      warranty: 'Two Years of Service',
      priceUSD: '$2,047',
      priceAED: 'AED 7,500',
      movement: 'Manual-winding skeletonised movement (Caliber RMUL2)',
      casing: 'Forged Carbon TPT®',
      bezel: 'Black Ceramic / Carbon',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 055 Bubba Watson Forged Carbon Red Strap edition showcases exceptional athletic resilience and avant-garde horology. Encased in high-performance forged carbon with an openworked skeleton dial exposing the manual-winding Caliber RMUL2 capable of withstanding extreme g-force, paired with a vibrant red rubber sports strap and titanium clasp.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 055',
        'Edition / Maker: Bubba Watson',
        'Reference Number: RM055 Carbon Red',
        'Movement: Manual-winding skeletonised movement (Caliber RMUL2)',
        'Casing Material: Forged Carbon TPT®',
        'Bezel: Black Ceramic / Carbon',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Carbon case, ceramic bezel, red rubber strap, titanium clasp',
        'Diameter Size: 49.9 × 42.7 mm',
        'Engine / Caliber: RMUL2 (55-hour power reserve)',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 055 بوبا واتسون كربون بحزام أحمر',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 055',
      materialAr: 'علبة كربون مطروق، إطار سيراميك، حزام مطاطي أحمر، إبزيم تيتانيوم',
      movementAr: 'حركة تعبئة يدوية هيكلية عيار RMUL2',
      casingAr: 'كربون مطروق TPT®',
      bezelAr: 'سيراميك أسود / كربون',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      descriptionAr:
        'تعتبر ساعة ريتشارد ميل RM 055 بوبا واتسون كربون بحزام أحمر رمزاً للمتانة الرياضية الفائقة، بعلبة من الكربون المطروق خفيف الوزن وحركة هيكلية يدوية عيار RMUL2 تقاوم قوى الجاذبية القصوى مع حزام مطاطي أحمر رياضي.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 055',
        'الإصدار: بوبا واتسون كربون',
        'الرقم المرجعي: RM055 Carbon Red',
        'الحركة: حركة تعبئة يدوية هيكلية عيار RMUL2',
        'مادة العلبة: كربون مطروق TPT®',
        'الإطار: سيراميك أسود / كربون',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'المواد: علبة كربون، حزام مطاطي أحمر، إبزيم تيتانيوم',
        'حجم القطر: 49.9 × 42.7 مم',
        'المحرك: كاليبر RMUL2 (احتياطي طاقة 55 ساعة)',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    folderName: 'watch2',
    slug: 'richard_mille_rm055_bubba_watson_asia_edition_limited',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Luxury Skeleton Watch in Black and Gold.png',
      'Luxury Skeleton Watch in Matte Black.png',
      'Richard Mille RM055 Skeleton Watch Back.png',
    ],
    spec: {
      name: 'Richard Mille RM 055 Bubba Watson Asia Edition Limited',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Bubba Watson Asia Edition',
      model: 'RM 055',
      reference: 'RM055 Asia Edition',
      material: 'Black ATZ ceramic case and bezel, rubberized titanium midcase, black rubber strap, rose-gold fold clasp',
      size: '42.7 × 50 mm',
      caliber: 'Caliber RMUL2 (55-hour power reserve, 24 jewels)',
      warranty: 'Two Years of Service',
      priceUSD: '$2,047',
      priceAED: 'AED 7,500',
      movement: 'Manual-winding skeletonised movement (Caliber RMUL2)',
      casing: 'Black ATZ Ceramic & Rubberized Titanium',
      bezel: 'Black ATZ Ceramic',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 055 Bubba Watson Asia Edition is an ultra-exclusive limited timepiece. Featuring a blasted Black ATZ ceramic bezel and caseback, rubberized titanium caseband, skeletonised Grade 5 titanium Caliber RMUL2 with luxurious gold accents, and a supple black rubber strap with a rose gold folding clasp.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 055',
        'Edition / Maker: Bubba Watson Asia Edition – Limited Edition',
        'Reference Number: RM055 Asia Edition',
        'Movement: Manual-winding skeletonised movement (Caliber RMUL2)',
        'Casing Material: Black ATZ ceramic with rubberized titanium midcase',
        'Bezel: ATZ ceramic',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Black ATZ ceramic case and bezel, rubberized titanium midcase, black rubber strap, rose-gold fold clasp',
        'Diameter Size: 42.7 × 50 mm',
        'Engine / Caliber: RMUL2, 55-hour power reserve, 24 jewels',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 055 بوبا واتسون إصدار آسيا المحدود',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 055',
      materialAr: 'علبة سيراميك ATZ أسود، تيتانيوم مطاطي، حزام مطاطي أسود، إبزيم ذهب وردي',
      movementAr: 'حركة تعبئة يدوية هيكلية عيار RMUL2',
      casingAr: 'سيراميك ATZ أسود وتيتانيوم مطاطي',
      bezelAr: 'سيراميك ATZ أسود',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      descriptionAr:
        'تعد ساعة ريتشارد ميل RM 055 بوبا واتسون إصدار آسيا المحدود تحفة حصرية، تجمع بين إطار وظهر علبة من سيراميك ATZ الأسود المقاوم للخدش وجوانب تيتانيوم مطاطية، مع حركة هيكلية RMUL2 بلمسات ذهبية وحزام مطاطي فاخر بإبزيم ذهب وردي.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 055',
        'الإصدار: بوبا واتسون إصدار آسيا المحدود',
        'الرقم المرجعي: RM055 Asia Edition',
        'الحركة: حركة تعبئة يدوية هيكلية عيار RMUL2',
        'مادة العلبة: سيراميك ATZ وتيتانيوم مطاطي',
        'الإطار: سيراميك ATZ أسود',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'المواد: علبة سيراميك أسود، حزام مطاطي أسود، إبزيم ذهب وردي',
        'حجم القطر: 42.7 × 50 مم',
        'المحرك: كاليبر RMUL2 (احتياطي طاقة 55 ساعة)',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
];

async function run() {
  console.log('========================================================================');
  console.log('🚀 PROCESSING 2 RICHARD MILLE RM 055 WATCHES (NOV 6 SECOND BATCH)');
  console.log('========================================================================\n');

  // Verify all source files exist
  for (const item of productsToProcess) {
    const itemDir = path.join(WATCH_DIR, item.folderName);
    const bannerPath = path.join(itemDir, item.mainBannerFile);
    if (!fs.existsSync(bannerPath)) {
      throw new Error(`Main banner not found: ${bannerPath}`);
    }
    for (const gName of item.galleryFiles) {
      const gPath = path.join(itemDir, gName);
      if (!fs.existsSync(gPath)) {
        throw new Error(`Gallery image not found: ${gPath}`);
      }
    }
    console.log(`✓ Verified source files for ${item.folderName}: ${item.spec.name}`);
  }

  // Connect to MongoDB
  console.log('\n--- CONNECTING TO MONGODB ATLAS ---');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('✓ Connected to MongoDB:', mongoose.connection.name);

  // Ensure RM 055 is listed under Richard Mille in CatalogueSettings
  try {
    const settings = await CatalogueSettings.findOne({ key: 'master-brands' });
    if (settings && Array.isArray(settings.brands)) {
      const rmBrand = settings.brands.find((b) => b.name === 'Richard Mille');
      if (rmBrand) {
        if (!rmBrand.models.includes('RM 055')) rmBrand.models.push('RM 055');
        if (!rmBrand.models.includes('RM 55')) rmBrand.models.push('RM 55');
        await settings.save();
        console.log('✓ Verified CatalogueSettings models for Richard Mille (RM 055).');
      }
    }
  } catch (err) {
    console.warn('⚠️ CatalogueSettings notice:', err.message);
  }

  const results = [];

  for (let idx = 0; idx < productsToProcess.length; idx++) {
    const item = productsToProcess[idx];
    console.log(`\n========================================================================`);
    console.log(`[${idx + 1}/2] Processing: ${item.spec.name} (${item.folderName})`);
    console.log(`========================================================================`);

    const itemDir = path.join(WATCH_DIR, item.folderName);

    // 1. Convert Main Banner to WebP and Upload to Cloudinary
    const bannerSrc = path.join(itemDir, item.mainBannerFile);
    const bannerPublicId = `${item.slug}_banner`;
    console.log(`  ⭐ Converting Main Banner "${item.mainBannerFile}" to WebP...`);
    const bannerWebp = await convertToWebP(bannerSrc, bannerPublicId);
    console.log(`  ☁️  Uploading Main Banner to Cloudinary...`);
    const bannerUrl = await uploadToCloudinary(bannerWebp, bannerPublicId);
    console.log(`  ✓ Main Banner uploaded: ${bannerUrl}`);

    // 2. Convert and Upload Gallery Images
    const galleryUrls = [bannerUrl]; // Main banner is first!
    for (let gIdx = 0; gIdx < item.galleryFiles.length; gIdx++) {
      const gName = item.galleryFiles[gIdx];
      const gSrc = path.join(itemDir, gName);
      const gPublicId = `${item.slug}_gallery_${gIdx + 1}`;
      console.log(`  🔄 Converting Gallery Image [${gIdx + 1}/${item.galleryFiles.length}]: "${gName}" to WebP...`);
      const gWebp = await convertToWebP(gSrc, gPublicId);
      console.log(`  ☁️  Uploading Gallery Image [${gIdx + 1}] to Cloudinary...`);
      const gUrl = await uploadToCloudinary(gWebp, gPublicId);
      galleryUrls.push(gUrl);
      console.log(`  ✓ Gallery Image [${gIdx + 1}] uploaded: ${gUrl}`);
    }

    // 3. Determine Product ID
    let existingProd = await Product.findOne({
      $or: [
        { reference: item.spec.reference },
        { name: item.spec.name },
      ],
    });

    let assignedId;
    if (existingProd) {
      assignedId = existingProd.id;
      console.log(`  ℹ️ Found existing product with ID ${assignedId}. Updating...`);
    } else {
      const latestProd = await Product.findOne({}, { id: 1 }).sort({ id: -1 });
      assignedId = (latestProd && typeof latestProd.id === 'number' ? latestProd.id : 262) + 1;
      console.log(`  🆕 Assigned new Product ID: ${assignedId}`);
    }

    const payload = {
      id: assignedId,
      ...item.spec,
      image: bannerUrl,
      thumbnail: bannerUrl,
      images: galleryUrls,
      url: '',
    };

    // 4. Save to MongoDB
    console.log(`  💾 Saving product to MongoDB Atlas (ID ${assignedId})...`);
    const mongoDoc = await Product.findOneAndUpdate(
      { $or: [{ reference: item.spec.reference }, { id: assignedId }, { name: item.spec.name }] },
      { $set: payload },
      { upsert: true, new: true }
    );
    console.log(`  ✓ Saved in MongoDB Atlas: ID ${mongoDoc.id} - ${mongoDoc.name}`);

    // 5. Sync to Live Site API
    console.log(`  🌐 Syncing to Live Site API (${API_BASE})...`);
    try {
      const checkRes = await fetch(`${API_BASE}/products/${assignedId}`);
      if (checkRes.ok) {
        const updateRes = await fetch(`${API_BASE}/products/${assignedId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (updateRes.ok) {
          console.log(`  ✓ Live product updated via API (ID ${assignedId})`);
        } else {
          console.warn(`  ⚠️ Live update returned ${updateRes.status}`);
        }
      } else {
        const createRes = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        });
        if (createRes.ok) {
          console.log(`  ✓ Live product created via API (ID ${assignedId})`);
        } else {
          console.warn(`  ⚠️ Live create returned ${createRes.status}`);
        }
      }
    } catch (apiErr) {
      console.warn(`  ⚠️ Live API sync note: ${apiErr.message}`);
    }

    // 6. Move source images to "images in"
    console.log(`  📦 Moving source images to "images in"...`);
    const allFiles = [item.mainBannerFile, ...item.galleryFiles];
    for (const fileName of allFiles) {
      const fromPath = path.join(itemDir, fileName);
      const ext = path.extname(fileName);
      const base = path.basename(fileName, ext);
      const destName = `${item.slug}_${base}${ext}`;
      const toPath = path.join(IMAGES_IN_DIR, destName);
      fs.copyFileSync(fromPath, toPath);
      fs.unlinkSync(fromPath);
      console.log(`    Moved "${fileName}" -> "images in/${destName}"`);
    }

    results.push({
      id: mongoDoc.id,
      name: mongoDoc.name,
      reference: mongoDoc.reference,
      priceUSD: mongoDoc.priceUSD,
      priceAED: mongoDoc.priceAED,
      liveUrl: `https://dubaiwatchesgallery.com/product/${mongoDoc.id}`,
      mainBannerUrl: bannerUrl,
      totalImages: galleryUrls.length,
    });
  }

  // Clean up temp directory
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('\n✓ Cleaned up temporary WebP directory.');
  } catch {}

  console.log('\n========================================================================');
  console.log('🎉 ALL 2 PRODUCTS SUCCESSFULLY ADDED & PUBLISHED!');
  console.log('========================================================================');
  for (const r of results) {
    console.log(`\n• ID: ${r.id}`);
    console.log(`  Name: ${r.name}`);
    console.log(`  Ref: ${r.reference}`);
    console.log(`  Price: ${r.priceUSD} (${r.priceAED})`);
    console.log(`  Main Banner: ${r.mainBannerUrl}`);
    console.log(`  Gallery Count: ${r.totalImages}`);
    console.log(`  Live URL: ${r.liveUrl}`);
  }

  await mongoose.connection.close();
  console.log('\nDatabase connection closed. Done!');
}

run().catch((err) => {
  console.error('\n❌ Fatal error in upload process:', err);
  mongoose.connection.close().finally(() => process.exit(1));
});

