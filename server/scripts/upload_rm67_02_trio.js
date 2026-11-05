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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm67_trio');

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
    slug: 'richard_mille_rm67_02_italy_edition_2024',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Intricate Red-Strap Skeleton Watch.png',
      'Luxury Carbon Skeleton Watch with Red Strap.png',
      'Richard Mille RM67-02 Skeleton Watch Back.png',
    ],
    spec: {
      name: 'Richard Mille RM 67-02 Italy Edition 2024',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Italy Edition 2024',
      model: 'RM 67-02',
      reference: 'RM67-02 Italy Edition',
      material: 'Carbon case and bezel, red textile comfort strap, titanium clasp',
      size: '38.7 × 47.5 mm',
      caliber: 'Richard Mille Caliber CRMA7',
      warranty: 'Two Years of Service',
      priceUSD: '$4,200',
      priceAED: 'AED 15,393',
      movement: 'Automatic winding skeletonised movement (Caliber CRMA7)',
      casing: 'Carbon TPT®',
      bezel: 'Carbon TPT®',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 67-02 Italy Edition 2024 is an ultra-lightweight skeletonised athletic timepiece engineered for optimum ergonomics and high-performance durability. Encased in a robust Carbon TPT® case and bezel, powered by the openworked automatic Caliber CRMA7 with micro-rotor, and paired with an ergonomic red comfort strap.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 67',
        'Edition / Maker: RM 67-02 Italy Edition 2024',
        'Reference Number: RM67-02',
        'Movement: Automatic winding skeletonised movement (Caliber CRMA7)',
        'Casing Material: Carbon TPT®',
        'Bezel: Carbon TPT®',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Carbon case and bezel, red textile comfort strap, titanium clasp',
        'Diameter Size: 38.7 × 47.5 mm',
        'Engine / Caliber: Richard Mille Caliber CRMA7',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 67-02 إصدار إيطاليا 2024',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 67-02',
      materialAr: 'علبة وإطار كربون، حزام قماشي أحمر عالي الراحة، إبزيم تيتانيوم',
      movementAr: 'حركة أوتوماتيكية هيكلية عيار CRMA7',
      casingAr: 'كربون TPT®',
      bezelAr: 'كربون TPT®',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr:
        'تعتبر ساعة ريتشارد ميل RM 67-02 إصدار إيطاليا 2024 تحفة فنية فائقة الخفة مصممة لتحقيق أقصى درجات الأداء الرياضي والراحة. تأتي بعلبة وإطار من الكربون المتطور وحركة أوتوماتيكية هيكلية عيار CRMA7 مع حزام أحمر مريح للغاية.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 67',
        'الإصدار: RM 67-02 إصدار إيطاليا 2024',
        'الرقم المرجعي: RM67-02',
        'الحركة: حركة أوتوماتيكية هيكلية عيار CRMA7',
        'مادة العلبة: كربون TPT®',
        'الإطار: كربون TPT®',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'تركيب المواد: علبة وإطار كربون، حزام قماشي أحمر، إبزيم تيتانيوم',
        'حجم القطر: 38.7 × 47.5 مم',
        'المحرك: ريتشارد ميل كاليبر CRMA7',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    folderName: 'watch2',
    slug: 'richard_mille_rm67_02_mclaren_edition',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Orange Skeleton Tourbillon Watch.png',
      'Richard Mille Skeleton Watch Cutout.png',
    ],
    spec: {
      name: 'Richard Mille RM 67-02 McLaren Edition',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'McLaren Edition',
      model: 'RM 67-02',
      reference: 'RM 67-02 McLaren',
      material: 'Carbon TPT® and Orange Quartz TPT® case, orange elastic textile comfort strap',
      size: '38.7 × 47.5 mm (39 mm)',
      caliber: 'Richard Mille in-house Calibre CRMA7',
      warranty: 'Two Years of Service',
      priceUSD: '$4,200',
      priceAED: 'AED 15,393',
      movement: 'Automatic winding skeletonised movement (Caliber CRMA7)',
      casing: 'Carbon TPT® and Orange Quartz TPT®',
      bezel: 'Carbon TPT® and Orange Quartz TPT®',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 67-02 McLaren Edition celebrates the partnership between Richard Mille and McLaren Formula 1. Engineered with an ultralight tonneau case made of Carbon TPT® and vibrant Orange Quartz TPT®, housing the skeletonised in-house Calibre CRMA7 with a seamless elastic comfort strap.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 67-02',
        'Edition / Maker: RM 67-02 McLaren – Richard Mille × McLaren collaboration',
        'Reference Number: RM 67-02 McLaren',
        'Movement: Automatic winding skeletonised movement (Caliber CRMA7)',
        'Casing Material: Carbon TPT® and Orange Quartz TPT®',
        'Bezel: Carbon TPT® and Orange Quartz TPT®',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Carbon TPT® and Quartz TPT® case, elastic textile comfort strap',
        'Diameter Size: 38.7 × 47.5 mm (39 mm)',
        'Engine / Caliber: Richard Mille in-house Calibre CRMA7',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 67-02 إصدار ماكلارين',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 67-02',
      materialAr: 'علبة كربون TPT® وكوارتز TPT®، حزام قماشي مرن برتقالي',
      movementAr: 'حركة أوتوماتيكية هيكلية عيار CRMA7',
      casingAr: 'كربون TPT® وكوارتز TPT® برتقالي',
      bezelAr: 'كربون TPT® وكوارتز TPT® برتقالي',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr:
        'تجسد ساعة ريتشارد ميل RM 67-02 إصدار ماكلارين قمة التعاون بين صناعة الساعات الراقية وسباقات الفورمولا 1، بهيكل فائق الخفة من كربون TPT® وكوارتز TPT® برتقالي مع حركة هيكلية عيار CRMA7 وحزام مطاطي متطور.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 67-02',
        'الإصدار: RM 67-02 إصدار ماكلارين',
        'الرقم المرجعي: RM 67-02 McLaren',
        'الحركة: حركة أوتوماتيكية هيكلية عيار CRMA7',
        'مادة العلبة: كربون TPT® وكوارتز TPT® برتقالي',
        'الإطار: كربون TPT® وكوارتز TPT® برتقالي',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'تركيب المواد: علبة كربون وكوارتز TPT®، حزام قماشي مرن',
        'حجم القطر: 38.7 × 47.5 مم (39 مم)',
        'المحرك: ريتشارد ميل كاليبر CRMA7 الداخلي',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    folderName: 'watch3',
    slug: 'richard_mille_rm67_02_fernando_alonso',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Blue and Yellow Skeleton Watch Cutout.png',
      'Blue Richard Mille Skeleton Watch Cutout.png',
      'Richard Mille Skeleton Watch Caseback.png',
    ],
    spec: {
      name: 'Richard Mille RM 67-02 Fernando Alonso Edition',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Fernando Alonso Edition',
      model: 'RM 67-02',
      reference: 'LTINC202267',
      material: 'Quartz TPT® and Carbon TPT® case, blue elastic textile comfort strap',
      size: '38.7 × 47.5 mm',
      caliber: 'Richard Mille Caliber CRMA7',
      warranty: 'Two Years of Service',
      priceUSD: '$4,200',
      priceAED: 'AED 15,393',
      movement: 'Automatic winding skeletonised movement (Caliber CRMA7)',
      casing: 'Blue & Yellow Quartz TPT® and Carbon TPT®',
      bezel: 'Quartz TPT®',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 67-02 Fernando Alonso Edition is dedicated to Formula 1 world champion Fernando Alonso. Dressed in the iconic blue and yellow colors of his racing helmet, crafted from ultralight Quartz TPT® and Carbon TPT®, featuring the skeletonised Caliber CRMA7 and an ergonomic blue elastic strap.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 67',
        'Edition / Maker: Fernando Alonso',
        'Reference Number: LTINC202267',
        'Movement: Automatic winding skeletonised movement (Caliber CRMA7)',
        'Casing Material: Blue & Yellow Quartz TPT® and Carbon TPT®',
        'Bezel: Quartz TPT®',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Quartz TPT® and Carbon TPT® case, blue elastic comfort strap',
        'Diameter Size: 38.7 × 47.5 mm',
        'Engine / Caliber: Richard Mille Caliber CRMA7',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 67-02 إصدار فرناندو ألونسو',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 67-02',
      materialAr: 'علبة كوارتز وكربون TPT®، حزام قماشي أزرق عالي الراحة',
      movementAr: 'حركة أوتوماتيكية هيكلية عيار CRMA7',
      casingAr: 'كوارتز TPT® أزرق وأصفر وكربون TPT®',
      bezelAr: 'كوارتز TPT®',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr:
        'ساعة ريتشارد ميل RM 67-02 إصدار فرناندو ألونسو تكريماً لبطل العالم في الفورمولا 1، بتصميم مذهل يجمع ألوان الكوارتز TPT® الأزرق والأصفر مع الكربون TPT®، وحركة هيكلية أوتوماتيكية CRMA7 فائقة الخفة والمتانة.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 67',
        'الإصدار: فرناندو ألونسو',
        'الرقم المرجعي: LTINC202267',
        'الحركة: حركة أوتوماتيكية هيكلية عيار CRMA7',
        'مادة العلبة: كوارتز TPT® أزرق وأصفر وكربون TPT®',
        'الإطار: كوارتز TPT®',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'تركيب المواد: علبة كوارتز وكربون TPT®، حزام قماشي أزرق مرن',
        'حجم القطر: 38.7 × 47.5 مم',
        'المحرك: ريتشارد ميل كاليبر CRMA7',
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
  console.log('🚀 PROCESSING 3 RICHARD MILLE RM 67 WATCHES (CONVERT, CLOUDINARY & MONGO)');
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

  // Ensure RM 67-02 is listed under Richard Mille in CatalogueSettings
  try {
    const settings = await CatalogueSettings.findOne({ key: 'master-brands' });
    if (settings && Array.isArray(settings.brands)) {
      const rmBrand = settings.brands.find((b) => b.name === 'Richard Mille');
      if (rmBrand && !rmBrand.models.includes('RM 67-02')) {
        rmBrand.models.push('RM 67-02');
        await settings.save();
        console.log('✓ Added "RM 67-02" to CatalogueSettings');
      }
    }
  } catch (err) {
    console.warn('⚠️ CatalogueSettings notice:', err.message);
  }

  const results = [];

  for (let idx = 0; idx < productsToProcess.length; idx++) {
    const item = productsToProcess[idx];
    console.log(`\n========================================================================`);
    console.log(`[${idx + 1}/3] Processing: ${item.spec.name} (${item.folderName})`);
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
      assignedId = (latestProd && typeof latestProd.id === 'number' ? latestProd.id : 256) + 1;
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
  console.log('🎉 ALL 3 PRODUCTS SUCCESSFULLY ADDED & PUBLISHED!');
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

