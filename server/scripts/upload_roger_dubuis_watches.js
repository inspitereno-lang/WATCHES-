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

const SOURCE_BASE_DIR = path.join(ROOT_DIR, 'images_all', 'watch', 'WATCH');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_roger_dubuis');

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

const WATCHES = [
  {
    subfolder: 'watch1',
    bannerName: 'Main banner 1.1.jpeg',
    galleryNames: ['1.2.jpeg', '1.3.png', '1.4.png'],
    publicPrefix: 'roger_dubuis_excalibur_minute_repeater_tourbillon_rddbex0774',
    spec: {
      name: 'Roger Dubuis Excalibur Minute Repeater Tourbillon King of Racing',
      brand: 'Roger Dubuis',
      audience: 'Mens',
      factory: 'Super Clone Edition',
      model: 'Excalibur',
      reference: 'RDDBEX0774',
      material: 'Carbon fiber and black DLC-coated titanium alloy',
      size: '47 mm',
      caliber: 'RD107 Super Clone Caliber',
      warranty: 'Two Years of Service',
      priceUSD: '$1,623',
      priceAED: 'AED 5,950',
      movement: 'Automatic Minute Repeater Flying Tourbillon',
      casing: 'Carbon fiber and black DLC-coated titanium alloy',
      bezel: 'Carbon fiber and black DLC-coated titanium alloy fluted bezel',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Roger Dubuis Excalibur King of Racing Minute Repeater Flying Tourbillon (Ref. RDDBEX0774) showcases audacious haute horlogerie engineering. Crafted with an ultralight 47mm case blending high-tech carbon fiber and black DLC-coated titanium, it features a skeletonized architecture revealing the intricate minute repeater chime and flying tourbillon complication. Fitted on a high-durability composite rubber strap, delivering superlative avant-garde design and acoustic mastery.',
      features: [
        'Brand: Roger Dubuis',
        'Sub-brand: Excalibur',
        'Edition / Maker: King of Racing Series – Minute Repeater Tourbillon',
        'Reference Number: RDDBEX0774',
        'Movement: Automatic Minute Repeater Flying Tourbillon',
        'Casing Material: Carbon fiber and black DLC-coated titanium alloy',
        'Bezel: Carbon fiber and black DLC-coated titanium alloy fluted bezel',
        'Glass / Crystal: Sapphire crystal with anti-reflective coating',
        'Material Composition: Carbon fiber and black DLC-coated titanium alloy',
        'Diameter Size: 47 mm',
        'Engine / Caliber: RD107 Super Clone Caliber',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'روجيه دوبوي إكسكاليبور مينيت ريبيتر توربيون كينغ أوف ريسينغ',
      brandAr: 'روجيه دوبوي',
      modelAr: 'إكسكاليبور',
      materialAr: 'ألياف الكربون وسبائك التيتانيوم المطلية بـ DLC الأسود',
      movementAr: 'حركة أوتوماتيكية مينيت ريبيتر توربيون طائر',
      casingAr: 'ألياف الكربون وتيتانيوم DLC أسود',
      bezelAr: 'إطار مضلع من ألياف الكربون وتيتانيوم DLC أسود',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr:
        'ساعة روجيه دوبوي إكسكاليبور كينغ أوف ريسينغ مينيت ريبيتر توربيون (الرقم المرجعي RDDBEX0774) بتصميم هندسي فائق يجمع بين ألياف الكربون فائقة الخفة وسبائك التيتانيوم المطلية بـ DLC الأسود مقاس 47 مم، مع حركة هيكلية معقدة تكشف عن آلية التوربيون الطائر ومكرر الدقائق الصوتي المتقن.',
      featuresAr: [
        'العلامة التجارية: روجيه دوبوي',
        'العلامة الفرعية: إكسكاليبور',
        'الإصدار: كينغ أوف ريسينغ سيريز – مينيت ريبيتر توربيون',
        'الرقم المرجعي: RDDBEX0774',
        'الحركة: أوتوماتيك مينيت ريبيتر توربيون طائر',
        'مادة العلبة: ألياف الكربون وتيتانيوم مطلي بـ DLC أسود',
        'الإطار: ألياف الكربون وتيتانيوم DLC أسود',
        'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش',
        'المواد: ألياف الكربون وتيتانيوم مطلي بـ DLC أسود',
        'القطر: 47 مم',
        'المحرك: عيار RD107 سوبر كلون',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    subfolder: 'watch2',
    bannerName: 'Main banner2.1.png',
    galleryNames: ['2.2.png', '2.3.png', '2.4.png'],
    publicPrefix: 'roger_dubuis_excalibur_monobalancier_ceramic_dbex0955',
    spec: {
      name: 'Roger Dubuis Excalibur Monobalancier 2022 Boutique Exclusive',
      brand: 'Roger Dubuis',
      audience: 'Mens',
      factory: 'Super Clone Edition',
      model: 'Excalibur',
      reference: 'DBEX0955',
      material: 'Ceramic, Leather, and Titanium',
      size: '42 mm',
      caliber: 'RD720SQ Micro-Rotor Caliber',
      warranty: 'Two Years of Service',
      priceUSD: '$1,623',
      priceAED: 'AED 5,950',
      movement: 'Automatic Monobalancier movement',
      casing: 'High-tech Ceramic',
      bezel: 'Notched black ceramic fluted bezel',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Roger Dubuis Excalibur Monobalancier 2022 Boutique Exclusive (Ref. DBEX0955) in 42mm black ceramic exemplifies hyper-horology. Featuring the signature star-shaped skeleton architecture and micro-rotor automatic movement, this boutique exclusive edition combines high-tech scratchproof ceramic casing with an integrated calf leather and rubber strap secured by a titanium folding clasp.',
      features: [
        'Brand: Roger Dubuis',
        'Sub-brand: Excalibur',
        'Edition / Maker: Monobalancier 2022 Boutique Exclusive',
        'Reference Number: DBEX0955',
        'Movement: Automatic Monobalancier movement',
        'Casing Material: High-tech Ceramic',
        'Bezel: Notched Ceramic fluted bezel',
        'Glass / Crystal: Sapphire crystal',
        'Material Composition: Ceramic, Leather, and Titanium',
        'Diameter Size: 42 mm',
        'Engine / Caliber: RD720SQ Micro-Rotor Caliber',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'روجيه دوبوي إكسكاليبور مونو بالانسييه 2022 بوتيك حصري',
      brandAr: 'روجيه دوبوي',
      modelAr: 'إكسكاليبور',
      materialAr: 'سيراميك، جلد، وتيتانيوم',
      movementAr: 'حركة أوتوماتيكية مونو بالانسييه عيار RD720SQ',
      casingAr: 'سيراميك عالي التقنية',
      bezelAr: 'إطار سيراميك مضلع ومحزز',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr:
        'ساعة روجيه دوبوي إكسكاليبور مونو بالانسييه 2022 إصدار البوتيك الحصري (الرقم المرجعي DBEX0955) بهيكل سيراميك أسود مقاس 42 مم فائق المتانة ومقاوم للخدش، مع حركة هيكلية بنجمة إكسكاليبور المميزة ونظام تعبئة أوتوماتيكي بمايكرو روتور وحزام مدمج من الجلد والمطاط وقفل تيتانيوم.',
      featuresAr: [
        'العلامة التجارية: روجيه دوبوي',
        'العلامة الفرعية: إكسكاليبور',
        'الإصدار: مونو بالانسييه 2022 بوتيك إكسكلوسيف',
        'الرقم المرجعي: DBEX0955',
        'الحركة: أوتوماتيك مونو بالانسييه عيار RD720SQ',
        'مادة العلبة: سيراميك أسود عالي التقنية',
        'الإطار: إطار سيراميك محزز',
        'الزجاج: زجاج ياقوتي كريستال',
        'المواد: سيراميك، جلد، وتيتانيوم',
        'القطر: 42 مم',
        'المحرك: RD720SQ مايكرو روتور',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    subfolder: 'watch3',
    bannerName: 'Main banner 3.1.png',
    galleryNames: ['3.2.png', '3.3.png', '3.4.png'],
    publicPrefix: 'roger_dubuis_excalibur_skeleton_tourbillon_ex45018000',
    spec: {
      name: 'Roger Dubuis Excalibur Skeleton Flying Tourbillon',
      brand: 'Roger Dubuis',
      audience: 'Mens',
      factory: 'Super Clone Edition',
      model: 'Excalibur',
      reference: 'EX45018000/0RR00/B',
      material: 'Titanium and Stainless Steel with Crocodile Leather Strap',
      size: '45 mm',
      caliber: 'RD505SQ Skeleton Flying Tourbillon Caliber',
      warranty: 'Two Years of Service',
      priceUSD: '$1,623',
      priceAED: 'AED 5,950',
      movement: 'Manual-winding Flying Tourbillon movement',
      casing: 'Grade 5 Titanium and Stainless Steel',
      bezel: 'Signature notched fluted bezel',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        "The Roger Dubuis Excalibur Skeleton Flying Tourbillon (Ref. EX45018000/0RR00/B) is an astonishing expression of Swiss hyper-horology. Housed in a commanding 45mm casing with signature triple lugs and notched bezel, it reveals a fully skeletonized star-shaped movement centered around an open flying tourbillon cage at 7 o'clock, fitted with a genuine crocodile leather strap with folding buckle.",
      features: [
        'Brand: Roger Dubuis',
        'Sub-brand: Excalibur',
        'Edition / Maker: Excalibur Skeleton Flying Tourbillon',
        'Reference Number: EX45018000/0RR00/B',
        'Movement: Manual-winding Flying Tourbillon movement',
        'Casing Material: Grade 5 Titanium and Stainless Steel',
        'Bezel: Signature notched fluted bezel',
        'Glass / Crystal: Sapphire crystal',
        'Material Composition: Titanium case with Crocodile Skin Leather strap',
        'Diameter Size: 45 mm',
        'Engine / Caliber: RD505SQ Skeleton Flying Tourbillon Caliber',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'روجيه دوبوي إكسكاليبور توربيون طائر هيكلي',
      brandAr: 'روجيه دوبوي',
      modelAr: 'إكسكاليبور',
      materialAr: 'تيتانيوم وعلبة ستيل مع حزام جلد تمساح فاخر',
      movementAr: 'حركة توربيون طائر هيكلية تعبئة يدوية',
      casingAr: 'تيتانيوم عالي الجودة / ستانلس ستيل',
      bezelAr: 'إطار مضلع ومحزز إكسكاليبور المميز',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr:
        'ساعة روجيه دوبوي إكسكاليبور توربيون طائر الهيكلية (الرقم المرجعي EX45018000/0RR00/B) بعلبة 45 مم بارزة بحواف مضلعة وحزام جلد التمساح الأصلي، تكشف عن حركة هيكلية بالغة التعقيد بتوربيون طائر مهيب عند الساعة السابعة يوفر أداءً ميكانيكياً مذهلاً.',
      featuresAr: [
        'العلامة التجارية: روجيه دوبوي',
        'العلامة الفرعية: إكسكاليبور',
        'الإصدار: توربيون طائر هيكلي',
        'الرقم المرجعي: EX45018000/0RR00/B',
        'الحركة: توربيون طائر تعبئة يدوية',
        'مادة العلبة: تيتانيوم / ستانلس ستيل',
        'الإطار: إطار إكسكاليبور المضلع',
        'الزجاج: زجاج ياقوتي كريستال',
        'المواد: علبة معدنية مع حزام جلد تمساح',
        'القطر: 45 مم',
        'المحرك: RD505SQ توربيون طائر',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين',
      ],
      inStock: true,
      isVisible: true,
    },
  },
  {
    subfolder: 'watch4',
    bannerName: 'Main banner4.1.png',
    galleryNames: ['4.2.png', '4.3.png'],
    publicPrefix: 'roger_dubuis_excalibur_skeleton_rosegold_rddbex0422',
    spec: {
      name: 'Roger Dubuis Excalibur Automatic Skeleton Rose Gold',
      brand: 'Roger Dubuis',
      audience: 'Mens',
      factory: 'Super Clone Edition',
      model: 'Excalibur',
      reference: 'RDDBEX0422',
      material: '18K Rose Gold and Rubber',
      size: '42 mm',
      caliber: 'RD820SQ Micro-Rotor Skeleton Caliber',
      warranty: 'Two Years of Service',
      priceUSD: '$1,664',
      priceAED: 'AED 6,100',
      movement: 'Automatic Skeleton movement with Micro-Rotor',
      casing: '18K Rose Gold',
      bezel: '18K Rose Gold fluted bezel',
      glass: 'Sapphire crystal with anti-reflective coating',
      waterResistance: '50m waterproof vacuum tested',
      description:
        'The Roger Dubuis Excalibur Automatic Skeleton Rose Gold (Ref. RDDBEX0422) demonstrates exceptional architectural skeletonization. Fashioned in warm 18K rose gold with a 42mm case and fluted bezel, its star-shaped openworked dial reveals the finely finished automatic Calibre RD820SQ with micro-rotor, complemented by an ergonomic black rubber strap with rose gold folding clasp.',
      features: [
        'Brand: Roger Dubuis',
        'Sub-brand: Excalibur',
        'Edition / Maker: Naked Automatic Skeleton Rose Gold',
        'Reference Number: RDDBEX0422',
        'Movement: Automatic Skeleton movement with Micro-Rotor',
        'Casing Material: 18K Rose Gold',
        'Bezel: 18K Rose Gold fluted bezel',
        'Glass / Crystal: Sapphire crystal',
        'Material Composition: 18K Rose Gold and Rubber',
        'Diameter Size: 42 mm',
        'Engine / Caliber: RD820SQ Micro-Rotor Skeleton Caliber',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service',
      ],
      nameAr: 'روجيه دوبوي إكسكاليبور أوتوماتيك سكيليتون ذهب وردي',
      brandAr: 'روجيه دوبوي',
      modelAr: 'إكسكاليبور',
      materialAr: 'ذهب وردي عيار 18 قيراط ومطاط عالي الجودة',
      movementAr: 'حركة أوتوماتيكية هيكلية بمايكرو روتور عيار RD820SQ',
      casingAr: 'ذهب وردي عيار 18 قيراط',
      bezelAr: 'إطار مضلع من الذهب الوردي عيار 18 قيراط',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr:
        'ساعة روجيه دوبوي إكسكاليبور أوتوماتيك سكيليتون (الرقم المرجعي RDDBEX0422) مصممة بعلبة فاخرة من الذهب الوردي عيار 18 قيراط مقاس 42 مم وإطار مضلع، تكشف عن حركة أوتوماتيكية هيكلية متطورة بمايكرو روتور عيار RD820SQ وحزام مطاطي أسود أنيق ومريح.',
      featuresAr: [
        'العلامة التجارية: روجيه دوبوي',
        'العلامة الفرعية: إكسكاليبور',
        'الإصدار: نيكد أوتوماتيك سكيليتون ذهب وردي',
        'الرقم المرجعي: RDDBEX0422',
        'الحركة: أوتوماتيك هيكلي بمايكرو روتور عيار RD820SQ',
        'مادة العلبة: ذهب وردي عيار 18 قيراط',
        'الإطار: إطار ذهب وردي مضلع',
        'الزجاج: زجاج ياقوتي كريستال',
        'المواد: ذهب وردي ومطاط',
        'القطر: 42 مم',
        'المحرك: RD820SQ مايكرو روتور',
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
  console.log('🚀 PROCESSING & UPLOADING 4 ROGER DUBUIS WATCHES');
  console.log('========================================================================\n');

  // 1. Connect to MongoDB Atlas
  console.log('1. Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 20000 });
  console.log('  ✓ Connected to MongoDB:', mongoose.connection.name);

  // Find max product ID
  const latestProd = await Product.findOne({}, { id: 1 }).sort({ id: -1 });
  let nextId = (latestProd && latestProd.id ? latestProd.id : 251) + 1;
  console.log(`  ✓ Next available Product ID: ${nextId}`);

  const processedResults = [];

  for (let idx = 0; idx < WATCHES.length; idx++) {
    const watchConfig = WATCHES[idx];
    const { subfolder, bannerName, galleryNames, publicPrefix, spec } = watchConfig;
    const folderPath = path.join(SOURCE_BASE_DIR, subfolder);

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`▶ [${idx + 1}/4] Processing: ${spec.name} (${spec.reference})`);
    console.log(`------------------------------------------------------------------------`);

    // Verify files exist
    const bannerPath = path.join(folderPath, bannerName);
    if (!fs.existsSync(bannerPath)) {
      throw new Error(`Banner file not found: ${bannerPath}`);
    }

    for (const gName of galleryNames) {
      const gPath = path.join(folderPath, gName);
      if (!fs.existsSync(gPath)) {
        throw new Error(`Gallery file not found: ${gPath}`);
      }
    }
    console.log(`  ✓ Found banner and ${galleryNames.length} gallery images in ${subfolder}`);

    // Convert banner to WebP & upload
    console.log(`  🔄 Converting banner to WebP...`);
    const bannerPublicId = `${publicPrefix}_banner`;
    const bannerWebp = await convertToWebP(bannerPath, bannerPublicId);
    const bannerUrl = await uploadToCloudinary(bannerWebp, bannerPublicId);
    console.log(`  ⭐ Main Banner uploaded:`, bannerUrl);

    // Convert gallery images to WebP & upload
    const galleryUrls = [bannerUrl];
    for (let gIdx = 0; gIdx < galleryNames.length; gIdx++) {
      const gName = galleryNames[gIdx];
      const gPath = path.join(folderPath, gName);
      const galleryPublicId = `${publicPrefix}_gallery_${gIdx + 1}`;
      console.log(`  🔄 Converting gallery image ${gIdx + 1}/${galleryNames.length} to WebP...`);
      const gWebp = await convertToWebP(gPath, galleryPublicId);
      const gUrl = await uploadToCloudinary(gWebp, galleryPublicId);
      galleryUrls.push(gUrl);
      console.log(`  ✓ Gallery image ${gIdx + 1} uploaded:`, gUrl);
    }

    const payload = {
      ...spec,
      image: bannerUrl,
      thumbnail: bannerUrl,
      images: galleryUrls,
      url: '',
    };

    // Check if product already exists in MongoDB
    let existingProd = await Product.findOne({
      $or: [{ reference: spec.reference }, { name: spec.name }],
    });

    const assignedId = existingProd ? existingProd.id : nextId++;
    console.log(`  💾 Upserting into MongoDB (ID: ${assignedId})...`);

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
    console.log(`  ✓ Upserted in MongoDB (ID: ${mongoDoc.id}, Reference: ${mongoDoc.reference})`);

    // Sync to Live Site API
    console.log(`  🌐 Syncing to Live Site API (${API_BASE})...`);
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

    // Move source images to "images in"
    console.log(`  📦 Moving images to "images in" directory...`);
    const allImagesToMove = [bannerName, ...galleryNames];
    for (const imgName of allImagesToMove) {
      const fromPath = path.join(folderPath, imgName);
      const ext = path.extname(imgName);
      const base = path.basename(imgName, ext);
      const destName = `roger_dubuis_${subfolder}_${base}${ext}`;
      const toPath = path.join(IMAGES_IN_DIR, destName);
      fs.copyFileSync(fromPath, toPath);
      fs.unlinkSync(fromPath);
      console.log(`    ✓ Moved ${imgName} -> "images in/${destName}"`);
    }

    processedResults.push({
      id: mongoDoc.id,
      name: mongoDoc.name,
      reference: mongoDoc.reference,
      priceUSD: mongoDoc.priceUSD,
      priceAED: mongoDoc.priceAED,
      imagesCount: galleryUrls.length,
      bannerUrl,
    });
  }

  // Ensure Roger Dubuis is active in CatalogueSettings
  console.log('\n2. Verifying CatalogueSettings...');
  const settings = await CatalogueSettings.findOne({ key: 'master-brands' });
  if (settings) {
    const rdBrand = settings.brands.find((b) => b.name.toLowerCase() === 'roger dubuis');
    if (rdBrand) {
      rdBrand.isActive = true;
      if (!rdBrand.models.includes('Excalibur')) {
        rdBrand.models.push('Excalibur');
      }
      await settings.save();
      console.log('  ✓ Verified Roger Dubuis brand and models in CatalogueSettings.');
    }
  }

  // Clean up temp WebP directory
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('\n3. Cleaned up temporary WebP files.');
  } catch (err) {
    console.warn('  Notice during temp cleanup:', err.message);
  }

  console.log('\n========================================================================');
  console.log('🎉 ALL 4 ROGER DUBUIS WATCHES HAVE BEEN SUCCESSFULLY UPLOADED & PUBLISHED');
  console.log('========================================================================');
  console.table(processedResults);

  await mongoose.connection.close();
  console.log('\nDatabase connection closed. Execution finished.');
}

run().catch((err) => {
  console.error('\n❌ Fatal error during execution:', err);
  mongoose.connection.close().finally(() => process.exit(1));
});
