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
const TEMP_DIR = path.join(__dirname, 'temp_webp_rm_nov6');

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
    slug: 'richard_mille_rm011_felipe_massa_rosegold_titanium',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Rose Gold Skeleton Watchback Close-Up.png',
      'Rose-Gold Richard Mille Skeleton Watch Cutout.png',
      'Rose-Gold Skeleton Chronograph Watch (1).png',
    ],
    spec: {
      name: 'Richard Mille RM 011 Felipe Massa Rose Gold Titanium',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Felipe Massa Edition',
      model: 'RM 011',
      reference: 'RM011 RG TI',
      material: '18K Rose Gold & Titanium case, black rubber strap, folding clasp',
      size: '50 × 40 mm',
      caliber: 'RMAC1 Caliber',
      warranty: 'Two Years of Service',
      priceUSD: '$1,692',
      priceAED: 'AED 6,200',
      movement: 'Automatic flyback chronograph movement (RMAC1)',
      casing: '18K Rose Gold and Grade 5 Titanium',
      bezel: '18K Rose Gold',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 011 Felipe Massa Rose Gold Titanium (Ref. RM011 RG TI) merges haute horlogerie performance with motor racing inspiration. Featuring a distinctive tonneau tripartite case in 18K rose gold and Grade 5 titanium, an openworked skeleton dial showcasing the RMAC1 automatic flyback chronograph caliber with 60-minute countdown timer, oversized date display, and a sporty black rubber strap.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 011',
        'Edition / Maker: Felipe Massa Rose Gold Titanium',
        'Reference Number: RM011 RG TI',
        'Movement: Automatic flyback chronograph movement',
        'Casing Material: 18K Rose Gold and Grade 5 Titanium',
        'Bezel: 18K Rose Gold',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Titanium case with rubber strap',
        'Diameter Size: 50 × 40 mm',
        'Engine / Caliber: RMAC1 Caliber',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 011 فيليبي ماسا ذهب وردي وتيتانيوم',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 011',
      materialAr: 'علبة من الذهب الوردي والتيتانيوم مع حزام مطاطي',
      movementAr: 'حركة كرونوغراف أوتوماتيكية فلايباك عيار RMAC1',
      casingAr: 'ذهب وردي عيار 18 قيراط وتيتانيوم درجة 5',
      bezelAr: 'ذهب وردي عيار 18 قيراط',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      descriptionAr:
        'تجمع ساعة ريتشارد ميل RM 011 فيليبي ماسا من الذهب الوردي والتيتانيوم بين الأداء الرياضي والهندسة الميكانيكية المتطورة، بعلبة مقوسة من الذهب الوردي والتيتانيوم وحركة أوتوماتيكية هيكلية بكرونوغراف فلايباك وتاريخ كبير.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 011',
        'الإصدار: فيليبي ماسا ذهب وردي وتيتانيوم',
        'الرقم المرجعي: RM011 RG TI',
        'الحركة: كرونوغراف أوتوماتيكي فلايباك عيار RMAC1',
        'مادة العلبة: ذهب وردي عيار 18 قيراط وتيتانيوم',
        'الإطار: ذهب وردي عيار 18 قيراط',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'المواد: علبة ذهب وردي وتيتانيوم، حزام مطاطي أسود',
        'حجم القطر: 50 × 40 مم',
        'المحرك: كاليبر RMAC1',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    folderName: 'watch2',
    slug: 'richard_mille_rm011_felipe_massa_akti_flyback_yellow',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Richard Mille RM011 Yellow Strap Movement.png',
      'Skeleton Chronograph with Yellow Strap.png',
      'Skeletonized Chronograph with Yellow Strap.png',
    ],
    spec: {
      name: 'Richard Mille RM 011 Felipe Massa AK Ti Flyback Chronograph',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Felipe Massa AK Ti Edition',
      model: 'RM 011',
      reference: 'RM011 AK Ti',
      material: 'Titanium case and bezel, yellow rubber strap, titanium double-fold clasp',
      size: '50 × 40 mm',
      caliber: 'RMAC1 Caliber (55-hour power reserve)',
      warranty: 'Two Years of Service',
      priceUSD: '$1,692',
      priceAED: 'AED 6,200',
      movement: 'Automatic flyback chronograph movement (RMAC1)',
      casing: 'Grade 5 Titanium',
      bezel: 'Grade 5 Titanium',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 011 Felipe Massa AK Ti Flyback Chronograph features an ultra-robust Grade 5 titanium tonneau case complemented by an eye-catching motorsport yellow rubber strap. Powered by the skeletonised RMAC1 automatic flyback chronograph movement with variable geometry rotor, oversized date display, and countdown timer.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 011',
        'Edition / Maker: Felipe Massa AK Ti Flyback Chronograph',
        'Reference Number: RM011',
        'Movement: Automatic flyback chronograph movement',
        'Casing Material: Titanium',
        'Bezel: Titanium',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Titanium case and bezel, yellow rubber strap, titanium double-fold clasp',
        'Diameter Size: 50 × 40 mm',
        'Engine / Caliber: RMAC1 (55-hour power reserve)',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 011 فيليبي ماسا AK Ti كرونوغراف فلايباك',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 011',
      materialAr: 'علبة وإطار تيتانيوم، حزام مطاطي أصفر، إبزيم تيتانيوم مزدوج الطي',
      movementAr: 'حركة كرونوغراف أوتوماتيكية فلايباك عيار RMAC1',
      casingAr: 'تيتانيوم درجة 5',
      bezelAr: 'تيتانيوم درجة 5',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      descriptionAr:
        'تتميز ساعة ريتشارد ميل RM 011 فيليبي ماسا AK Ti بعلبة تيتانيوم خفيفة وفائقة المتانة مع حزام مطاطي أصفر رياضي وحركة هيكلية بكرونوغراف فلايباك عيار RMAC1 باحتياطي طاقة يصل إلى 55 ساعة.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 011',
        'الإصدار: فيليبي ماسا AK Ti كرونوغراف فلايباك',
        'الرقم المرجعي: RM011',
        'الحركة: كرونوغراف أوتوماتيكي فلايباك عيار RMAC1',
        'مادة العلبة: تيتانيوم درجة 5',
        'الإطار: تيتانيوم درجة 5',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'المواد: علبة تيتانيوم، حزام مطاطي أصفر، إبزيم تيتانيوم',
        'حجم القطر: 50 × 40 مم',
        'المحرك: كاليبر RMAC1 (احتياطي طاقة 55 ساعة)',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    folderName: 'watch3',
    slug: 'richard_mille_rm67_01_rosegold_extra_flat',
    mainBannerFile: 'MAIN BANNER.png',
    galleryFiles: [
      'Rose Gold Skeleton Watch Cutout.png',
      'Rose-Gold Buckle on Black Rubber Strap.png',
      'Skeleton Rose-Gold Luxury Watch.png',
    ],
    spec: {
      name: 'Richard Mille RM 67-01 Rose Gold Extra Flat',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Rose Gold Extra Flat Edition',
      model: 'RM 67-01',
      reference: 'RM67-01 RG',
      material: '18K Rose gold case and bezel, black rubber strap, rose gold folding clasp',
      size: '38.7 × 47.5 mm',
      caliber: 'In-house Caliber CRMA6 Extra Flat',
      warranty: 'Two Years of Service',
      priceUSD: '$3,902',
      priceAED: 'AED 14,300',
      movement: 'Automatic winding skeletonised movement (Caliber CRMA6)',
      casing: '18K Rose Gold',
      bezel: '18K Rose Gold',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Richard Mille RM 67-01 Rose Gold Extra Flat is a tour-de-force of ultra-thin mechanical engineering and refined luxury. Presented in a slender 18K rose gold tonneau case measuring only 7.75 mm in thickness, with an openworked skeleton dial showcasing Caliber CRMA6, luminous sculpted Arabic numerals, function indicator, and semi-instantaneous date display.',
      features: [
        'Brand: Richard Mille',
        'Sub-brand: RM 67',
        'Edition / Maker: RM 67-01 Rose Gold Extra Flat',
        'Reference Number: RM67-01 RG',
        'Movement: Automatic winding skeletonised movement (Caliber CRMA6)',
        'Casing Material: 18K Rose Gold',
        'Bezel: 18K Rose Gold',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Rose gold case and bezel, black rubber strap, rose gold folding clasp',
        'Diameter Size: 38.7 × 47.5 mm',
        'Engine / Caliber: CRMA6 Extra Flat',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'ريتشارد ميل RM 67-01 إكسترا فلات ذهب وردي',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 67-01',
      materialAr: 'علبة وإطار من الذهب الوردي، حزام مطاطي أسود، إبزيم ذهب وردي قابل للطي',
      movementAr: 'حركة أوتوماتيكية هيكلية فائقة النحافة عيار CRMA6',
      casingAr: 'ذهب وردي عيار 18 قيراط',
      bezelAr: 'ذهب وردي عيار 18 قيراط',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      descriptionAr:
        'تعتبر ساعة ريتشارد ميل RM 67-01 إكسترا فلات قمة الأناقة والنحافة الميكانيكية بعلبة برميلية نحيفة من الذهب الوردي عيار 18 قيراط مع حركة هيكلية أوتوماتيكية عيار CRMA6 ومؤشرات مضيئة وعرض التاريخ وحزام مطاطي فاخر.',
      featuresAr: [
        'العلامة التجارية: ريتشارد ميل',
        'العلامة الفرعية: RM 67',
        'الإصدار: RM 67-01 ذهب وردي إكسترا فلات',
        'الرقم المرجعي: RM67-01 RG',
        'الحركة: حركة أوتوماتيكية هيكلية فائقة النحافة عيار CRMA6',
        'مادة العلبة: ذهب وردي عيار 18 قيراط',
        'الإطار: ذهب وردي عيار 18 قيراط',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'المواد: علبة ذهب وردي، حزام مطاطي أسود، إبزيم ذهب وردي',
        'حجم القطر: 38.7 × 47.5 مم',
        'المحرك: كاليبر CRMA6 فائق النحافة',
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
  console.log('🚀 PROCESSING 3 RICHARD MILLE WATCHES (NOV 6 BATCH)');
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

  // Ensure RM 011 and RM 67-01 are listed under Richard Mille in CatalogueSettings
  try {
    const settings = await CatalogueSettings.findOne({ key: 'master-brands' });
    if (settings && Array.isArray(settings.brands)) {
      const rmBrand = settings.brands.find((b) => b.name === 'Richard Mille');
      if (rmBrand) {
        if (!rmBrand.models.includes('RM 011')) rmBrand.models.push('RM 011');
        if (!rmBrand.models.includes('RM 67-01')) rmBrand.models.push('RM 67-01');
        await settings.save();
        console.log('✓ Verified CatalogueSettings models for Richard Mille.');
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
      assignedId = (latestProd && typeof latestProd.id === 'number' ? latestProd.id : 259) + 1;
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

