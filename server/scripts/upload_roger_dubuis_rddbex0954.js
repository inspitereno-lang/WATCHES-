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

const SOURCE_DIR = path.join(ROOT_DIR, 'images_all', 'watch', 'WATCH');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_rddbex0954');

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

const mainBannerName = 'Luxury Rose-Gold Skeleton Watch Cutout.png';
const galleryImageNames = [
  'Roger Dubuis Rose Gold Skeleton Watch.png',
  'Rose Gold Excalibur Skeleton Watch Back.png',
  'Rose Gold Roger Dubuis Skeleton Watch.png',
];

const spec = {
  name: 'Roger Dubuis Excalibur Monobalancier Rose Gold',
  brand: 'Roger Dubuis',
  audience: 'Mens',
  factory: 'Super Clone Edition',
  model: 'Excalibur',
  reference: 'RDDBEX0954',
  material: '18K Rose Gold, Leather, and Steel',
  size: '42 mm',
  caliber: 'RD720SQ Micro-Rotor Caliber',
  warranty: 'Two Years of Service',
  priceUSD: '$1,664',
  priceAED: 'AED 6,100',
  movement: 'Automatic Monobalancier movement',
  casing: '18K Rose Gold',
  bezel: 'Rose Gold fluted bezel',
  glass: 'Sapphire crystal with anti-reflective coating',
  waterResistance: '50m waterproof vacuum tested',
  description:
    'The Roger Dubuis Excalibur Monobalancier Rose Gold (Ref. RDDBEX0954) epitomizes expressive hyper-horology. Encased in a luxurious 42mm 18K rose gold case with signature notched fluted bezel, its openworked architecture features the iconic star-shaped bridge and micro-rotor automatic caliber. Fitted with an embossed calf leather strap and rose gold folding buckle, it unites mechanical virtuosity with bold elegance.',
  features: [
    'Brand: Roger Dubuis',
    'Sub-brand: Excalibur',
    'Edition / Maker: Monobalancier',
    'Reference Number: RDDBEX0954',
    'Movement: Automatic Monobalancier movement',
    'Casing Material: 18K Rose Gold',
    'Bezel: Rose Gold fluted bezel',
    'Glass / Crystal: Sapphire crystal with anti-reflective coating',
    'Material Composition: 18K Rose Gold, Leather, and Steel',
    'Diameter Size: 42 mm',
    'Engine / Caliber: RD720SQ Micro-Rotor Caliber',
    'Shipping: Free Shipping',
    'Warranty: Two Years of Service',
  ],
  nameAr: 'روجيه دوبوي إكسكاليبور مونو بالانسييه ذهب وردي',
  brandAr: 'روجيه دوبوي',
  modelAr: 'إكسكاليبور',
  materialAr: 'ذهب وردي عيار 18 قيراط، جلد، وفولاذ',
  movementAr: 'حركة أوتوماتيكية مونو بالانسييه عيار RD720SQ',
  casingAr: 'ذهب وردي عيار 18 قيراط',
  bezelAr: 'إطار مضلع ومحزز من الذهب الوردي عيار 18 قيراط',
  glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
  waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
  warrantyAr: 'ضمان خدمة لمدة عامين',
  descriptionAr:
    'ساعة روجيه دوبوي إكسكاليبور مونو بالانسييه من الذهب الوردي (الرقم المرجعي RDDBEX0954) تجمع بين الفخامة الجريئة والبراعة الميكانيكية. تأتي بعلبة ذهب وردي عيار 18 قيراط مقاس 42 مم وإطار مضلع بارز، مع حركة هيكلية بنجمة إكسكاليبور الشهيرة ونظام تعبئة أوتوماتيكي بمايكرو روتور متطور وحزام جلدي مدمج فاخر.',
  featuresAr: [
    'العلامة التجارية: روجيه دوبوي',
    'العلامة الفرعية: إكسكاليبور',
    'الإصدار: مونو بالانسييه',
    'الرقم المرجعي: RDDBEX0954',
    'الحركة: أوتوماتيك مونو بالانسييه عيار RD720SQ',
    'مادة العلبة: ذهب وردي عيار 18 قيراط',
    'الإطار: إطار ذهب وردي مضلع',
    'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
    'المواد: ذهب وردي، جلد، وفولاذ',
    'القطر: 42 مم',
    'المحرك: RD720SQ مايكرو روتور',
    'الشحن: شحن مجاني',
    'الضمان: ضمان خدمة لمدة عامين',
  ],
  inStock: true,
  isVisible: true,
};

async function run() {
  console.log('========================================================================');
  console.log('🚀 PROCESSING ROGER DUBUIS EXCALIBUR MONOBALANCIER ROSE GOLD (RDDBEX0954)');
  console.log('========================================================================\n');

  // 1. Verify files exist
  const bannerPath = path.join(SOURCE_DIR, mainBannerName);
  if (!fs.existsSync(bannerPath)) {
    throw new Error(`Main banner not found: ${bannerPath}`);
  }
  for (const gName of galleryImageNames) {
    const gPath = path.join(SOURCE_DIR, gName);
    if (!fs.existsSync(gPath)) {
      throw new Error(`Gallery image not found: ${gPath}`);
    }
  }
  console.log('1. All 4 source image files verified.');

  // 2. Convert to WebP & Upload to Cloudinary
  console.log('\n2. Converting to WebP and uploading to Cloudinary...');
  const publicPrefix = 'roger_dubuis_excalibur_monobalancier_rosegold_rddbex0954';
  const bannerPublicId = `${publicPrefix}_banner`;
  const bannerWebp = await convertToWebP(bannerPath, bannerPublicId);
  const bannerUrl = await uploadToCloudinary(bannerWebp, bannerPublicId);
  console.log('  ⭐ Main Banner uploaded:', bannerUrl);

  const galleryUrls = [bannerUrl];
  for (let i = 0; i < galleryImageNames.length; i++) {
    const gName = galleryImageNames[i];
    const gPath = path.join(SOURCE_DIR, gName);
    const gPublicId = `${publicPrefix}_gallery_${i + 1}`;
    console.log(`  🔄 Converting gallery image ${i + 1}/${galleryImageNames.length} to WebP...`);
    const gWebp = await convertToWebP(gPath, gPublicId);
    const gUrl = await uploadToCloudinary(gWebp, gPublicId);
    galleryUrls.push(gUrl);
    console.log(`  ✓ Gallery image ${i + 1} uploaded:`, gUrl);
  }

  const payload = {
    ...spec,
    image: bannerUrl,
    thumbnail: bannerUrl,
    images: galleryUrls,
    url: '',
  };

  // 3. Connect to MongoDB Atlas & Upsert Product
  console.log('\n3. Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('  ✓ Connected to MongoDB:', mongoose.connection.name);

  const latestProd = await Product.findOne({}, { id: 1 }).sort({ id: -1 });
  const nextId = (latestProd && latestProd.id ? latestProd.id : 255) + 1;

  let existingProd = await Product.findOne({
    $or: [{ reference: spec.reference }, { name: spec.name }],
  });

  const assignedId = existingProd ? existingProd.id : nextId;
  console.log(`  💾 Upserting product with ID ${assignedId}...`);

  const mongoDoc = await Product.findOneAndUpdate(
    { $or: [{ reference: spec.reference }, { id: assignedId }, { name: spec.name }] },
    {
      $set: {
        id: assignedId,
        ...payload,
      },
    },
    { upsert: true, new: true }
  );
  console.log(`  ✓ Successfully upserted in MongoDB: ID ${mongoDoc.id} (${mongoDoc.name})`);

  // 4. Sync to Live Site API
  console.log(`\n4. Syncing to Live Site API (${API_BASE})...`);
  let liveProduct = null;
  try {
    const checkRes = await fetch(`${API_BASE}/products?search=${encodeURIComponent(spec.reference)}`);
    if (checkRes.ok) {
      const checkData = await checkRes.json();
      const existingLive = (checkData.products || []).find(
        (p) => p.reference === spec.reference || p.name === spec.name
      );

      if (existingLive) {
        console.log(`  Updating existing live product ID ${existingLive.id}...`);
        const updateRes = await fetch(`${API_BASE}/products/${existingLive.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify(payload),
        });
        const updateData = await updateRes.json();
        if (updateRes.ok) {
          liveProduct = updateData.product || existingLive;
          console.log(`  ✓ Live product updated: ID ${liveProduct.id}`);
        } else {
          console.warn(`  ⚠️ Live update returned status ${updateRes.status}:`, updateData);
        }
      } else {
        console.log(`  Creating new product on live site...`);
        const createRes = await fetch(`${API_BASE}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ ...payload, id: assignedId }),
        });
        const createData = await createRes.json();
        if (createRes.ok) {
          liveProduct = createData.product;
          console.log(`  ✓ Live product created: ID ${liveProduct.id}`);
        } else {
          console.warn(`  ⚠️ Live create returned status ${createRes.status}:`, createData);
        }
      }
    }
  } catch (apiErr) {
    console.warn(`  ⚠️ Live API notice:`, apiErr.message);
  }

  // 5. Move source images to "images in"
  console.log('\n5. Moving images to "images in" directory...');
  const allImageFiles = [mainBannerName, ...galleryImageNames];
  for (const fileName of allImageFiles) {
    const fromPath = path.join(SOURCE_DIR, fileName);
    const ext = path.extname(fileName);
    const base = path.basename(fileName, ext);
    const destName = `roger_dubuis_rddbex0954_${base}${ext}`;
    const toPath = path.join(IMAGES_IN_DIR, destName);
    fs.copyFileSync(fromPath, toPath);
    fs.unlinkSync(fromPath);
    console.log(`  ✓ Moved "${fileName}" -> "images in/${destName}"`);
  }

  // 6. Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('\n6. Cleaned up temporary WebP files.');
  } catch {}

  console.log('\n========================================================================');
  console.log('🎉 ROGER DUBUIS RDDBEX0954 SUCCESSFULLY ADDED & PUBLISHED');
  console.log('========================================================================');
  console.log(`Product ID: ${mongoDoc.id}`);
  console.log(`Name: ${mongoDoc.name}`);
  console.log(`Reference: ${mongoDoc.reference}`);
  console.log(`Price: ${mongoDoc.priceUSD} (${mongoDoc.priceAED})`);
  console.log(`Live URL: https://dubaiwatchesgallery.com/product/${mongoDoc.id}`);
  console.log(`Main Banner: ${bannerUrl}`);
  console.log(`Gallery Images (${galleryUrls.length}):`, galleryUrls);

  await mongoose.connection.close();
  console.log('\nDatabase connection closed. Done!');
}

run().catch((err) => {
  console.error('\n❌ Fatal error:', err);
  mongoose.connection.close().finally(() => process.exit(1));
});
