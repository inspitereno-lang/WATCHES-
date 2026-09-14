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
const TODAY_DIR = path.join(ROOT_DIR, 'images_all', 'watch', 'todays-watches-14-sep-2026');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_todays_rolex_batch_webp');

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

if (!fs.existsSync(IMAGES_IN_DIR)) {
  fs.mkdirSync(IMAGES_IN_DIR, { recursive: true });
}

function moveFileToImagesIn(srcPath, targetFilename) {
  const destPath = path.join(IMAGES_IN_DIR, targetFilename);

  if (fs.existsSync(srcPath)) {
    console.log(`📦 Moving "${path.basename(srcPath)}" -> "images in/${targetFilename}"...`);
    fs.copyFileSync(srcPath, destPath);
    fs.unlinkSync(srcPath);
    console.log(`  ✓ Moved and removed from source`);
  } else if (fs.existsSync(destPath)) {
    console.log(`  ℹ️ "${targetFilename}" already exists in "images in"`);
  } else {
    throw new Error(`File not found: ${srcPath}`);
  }

  return destPath;
}

async function convertToWebpAndUpload(sourceFilePath, publicId) {
  console.log(`\nProcessing image (Direct WebP conversion): "${path.basename(sourceFilePath)}"`);
  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  console.log(`  ⚙️  Converting to high-quality WebP...`);
  await sharp(sourceFilePath)
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

const WATCH_CONFIGS = [
  {
    folderName: 'rolex-gmt-master-ii-126710blnr',
    prefix: 'Rolex GMT-Master II 126710BLNR Batman',
    publicIdPrefix: 'rolex_gmt_master_ii_126710blnr',
    name: 'Rolex GMT-Master II "Batman" 126710BLNR',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Black & Blue Cerachrom Bezel on Jubilee Bracelet',
    model: 'GMT-Master II',
    reference: '126710BLNR',
    material: 'Oystersteel case and Jubilee bracelet with black & blue Cerachrom ceramic bezel and sapphire crystal',
    size: '40 mm',
    caliber: 'Rolex Calibre 3285',
    warranty: 'Five years international warranty',
    priceUSD: '$19,500',
    priceAED: 'AED 85,000',
    movement: 'Rolex Calibre 3285 self-winding automatic movement with 70-hour power reserve and GMT function',
    casing: 'Oystersteel (904L stainless steel)',
    bezel: 'Bidirectional rotatable 24-hour graduated Cerachrom bezel insert in black and blue ceramic ("Batman"), platinum-coated numerals',
    glass: 'Sapphire crystal with scratch-resistant coating, Cyclops lens over date',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex GMT-Master II reference 126710BLNR "Batman" features a 40mm Oystersteel case, iconic bidirectional rotatable Cerachrom bezel in black and blue ceramic, black dial with Chromalight luminescence, and Jubilee bracelet. Driven by the Rolex Calibre 3285 self-winding movement offering 70 hours of power reserve.',
    features: [
      'Movement: Rolex Calibre 3285 self-winding automatic movement with 70-hour power reserve and GMT function',
      'Casing Material: Oystersteel (904L stainless steel)',
      'Bezel: Bidirectional rotatable 24-hour graduated Cerachrom bezel insert in black and blue ceramic ("Batman"), platinum-coated numerals',
      'Glass / Crystal: Sapphire crystal with scratch-resistant coating, Cyclops lens over date',
      'Reference Number: 126710BLNR',
      'Material Composition: Oystersteel case and Jubilee bracelet with black & blue Cerachrom ceramic bezel and sapphire crystal',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3285',
      'Shipping: Free Shipping',
      'Warranty: Five years international warranty'
    ],
    nameAr: 'رولكس جي إم تي ماستر 2 "باتمان" 126710BLNR',
    brandAr: 'رولكس',
    modelAr: 'جي إم تي ماستر II',
    materialAr: 'علبة وسوار أويسترسيل من الفولاذ المقاوم للصدأ مع سوار جوبيلي وإطار سيراميك أسود وأزرق',
    movementAr: 'حركة ميكانيكية أوتوماتيكية عيار 3285 مع خاصية التوقيت المزدوج GMT واحتياطي طاقة 70 ساعة',
    casingAr: 'فولاذ أويسترسيل (904L)',
    bezelAr: 'إطار سيراميك سيراكروم ثنائي اللون أسود وأزرق ("باتمان") عيار 24 ساعة قابل للدوران في الاتجاهين',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش مع عدسة سايكلوبس مكبرة للتاريخ',
    waterResistanceAr: 'مقاومة الماء حتى 100 متراً',
    warrantyAr: 'ضمان دولي لمدة 5 سنوات',
    descriptionAr: 'ساعة رولكس جي إم تي ماستر II "باتمان" موديل 126710BLNR الأيقونية، تتميز بهيكل وسوار جوبيلي من فولاذ أويسترسيل مع إطار سيراكروم سيراميك باللونين الأسود والأزرق ومحرك رولكس عيار 3285 فائق الدقة.',
    featuresAr: [
      'الحركة: حركة ميكانيكية أوتوماتيكية عيار 3285 مع خاصية التوقيت المزدوج واحتياطي طاقة 70 ساعة',
      'مادة الهيكل: فولاذ أويسترسيل (904L)',
      'الإطار: إطار سيراكروم سيراميك ثنائي اللون أسود وأزرق ("باتمان") عيار 24 ساعة',
      'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش مع عدسة مكبرة',
      'الرقم المرجعي: 126710BLNR',
      'تركيبة المواد: فولاذ أويسترسيل مع سوار جوبيلي وإطار سيراكروم',
      'الأبعاد: 40 مم',
      'العيار / المحرك: Rolex Calibre 3285',
      'الشحن: شحن مجاني',
      'الضمان: ضمان دولي لمدة 5 سنوات'
    ]
  },
  {
    folderName: 'rolex-gmt-master-ii-126710blro',
    prefix: 'Rolex GMT-Master II 126710BLRO Pepsi',
    publicIdPrefix: 'rolex_gmt_master_ii_126710blro',
    name: 'Rolex GMT-Master II "Pepsi" 126710BLRO',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Red & Blue Cerachrom Bezel on Jubilee Bracelet (2019)',
    model: 'GMT-Master II',
    reference: '126710BLRO',
    material: 'Oystersteel case and Jubilee bracelet with red & blue Cerachrom ceramic bezel and sapphire crystal',
    size: '40 mm',
    caliber: 'Rolex Calibre 3285',
    warranty: 'Five years international warranty',
    priceUSD: '$21,500',
    priceAED: 'AED 93,643',
    movement: 'Self-winding mechanical, Perpetual, bidirectional rotor, independently adjustable 24-hour hand (second time zone), COSC-certified Superlative Chronometer',
    casing: 'Oystersteel (904L stainless steel)',
    bezel: 'Bidirectional rotatable 24-hour graduated Cerachrom bezel insert in red and blue ceramic ("Pepsi"), platinum-coated numerals and graduations',
    glass: 'Sapphire crystal with scratch-resistant coating, Cyclops lens over date at 3 o\'clock',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex GMT-Master II reference 126710BLRO "Pepsi" features the legendary red and blue Cerachrom ceramic bezel on an Oystersteel 40mm case and Jubilee bracelet. Equipped with the Calibre 3285 movement with 70-hour power reserve, independently adjustable local hour hand, and date display.',
    features: [
      'Movement: Self-winding mechanical, Perpetual, bidirectional rotor, independently adjustable 24-hour hand (second time zone), COSC-certified Superlative Chronometer',
      'Casing Material: Oystersteel (904L stainless steel)',
      'Bezel: Bidirectional rotatable 24-hour graduated Cerachrom bezel insert in red and blue ceramic ("Pepsi"), platinum-coated numerals and graduations',
      'Glass / Crystal: Sapphire crystal with scratch-resistant coating, Cyclops lens over date at 3 o\'clock',
      'Reference Number: 126710BLRO',
      'Material Composition: Oystersteel case and Jubilee bracelet with red & blue Cerachrom ceramic bezel and sapphire crystal',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3285',
      'Shipping: Free Shipping',
      'Warranty: Five years international warranty'
    ],
    nameAr: 'رولكس جي إم تي ماستر 2 "بيبسي" 126710BLRO',
    brandAr: 'رولكس',
    modelAr: 'جي إم تي ماستر II',
    materialAr: 'علبة وسوار أويسترسيل من الفولاذ المقاوم للصدأ مع سوار جوبيلي وإطار سيراميك أحمر وأزرق',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة عيار 3285 مع عقرب 24 ساعة قابل للضبط المستقل واحتياطي طاقة 70 ساعة',
    casingAr: 'فولاذ أويسترسيل (904L)',
    bezelAr: 'إطار سيراميك سيراكروم ثنائي اللون أحمر وأزرق ("بيبسي") عيار 24 ساعة قابل للدوران في الاتجاهين',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش مع عدسة مكبرة عند الساعة 3',
    waterResistanceAr: 'مقاومة الماء حتى 100 متراً',
    warrantyAr: 'ضمان دولي لمدة 5 سنوات',
    descriptionAr: 'ساعة رولكس جي إم تي ماستر II "بيبسي" موديل 126710BLRO الأسطورية، مصنوعة من فولاذ أويسترسيل المقاوم للصدأ مع سوار جوبيلي وإطار سيراكروم أحمر وأزرق مع محرك رولكس عيار 3285 فائق الأداء.',
    featuresAr: [
      'الحركة: حركة ميكانيكية ذاتية التعبئة عيار 3285 مع عقرب 24 ساعة مستقل واحتياطي طاقة 70 ساعة',
      'مادة الهيكل: فولاذ أويسترسيل (904L)',
      'الإطار: إطار سيراكروم سيراميك ثنائي اللون أحمر وأزرق ("بيبسي") عيار 24 ساعة',
      'الزجاج: زجاج ياقوتي كريستال مقاوم للخدش مع عدسة مكبرة',
      'الرقم المرجعي: 126710BLRO',
      'تركيبة المواد: فولاذ أويسترسيل مع سوار جوبيلي وإطار سيراكروم',
      'الأبعاد: 40 مم',
      'العيار / المحرك: Rolex Calibre 3285',
      'الشحن: شحن مجاني',
      'الضمان: ضمان دولي لمدة 5 سنوات'
    ]
  }
];

async function main() {
  try {
    console.log('========================================================================');
    console.log('Processing Today\'s Rolex Watches Batch (14-Sep-2026)');
    console.log('========================================================================');

    console.log('\n--- STEP 1: CONNECTING TO MONGODB ---');
    let connected = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`Connecting to MongoDB (attempt ${attempt}/5)...`);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
        connected = true;
        break;
      } catch (err) {
        console.warn(`Attempt ${attempt} failed (${err.message}). Retrying in 2 seconds...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (!connected) throw new Error('Could not connect to MongoDB after multiple attempts');
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    for (const config of WATCH_CONFIGS) {
      console.log(`\n========================================================================`);
      console.log(`Processing: ${config.name} (${config.reference})`);
      console.log(`========================================================================`);

      const folderPath = path.join(TODAY_DIR, config.folderName);
      if (!fs.existsSync(folderPath) && !fs.existsSync(path.join(IMAGES_IN_DIR, `${config.prefix}_1.png`))) {
        console.warn(`Folder ${folderPath} not found!`);
        continue;
      }

      // Move 4 images from folder to "images in"
      const movedPaths = [];
      for (let i = 1; i <= 4; i++) {
        const srcFilename = `watch-0${i}.png`;
        const srcPath = path.join(folderPath, srcFilename);
        const targetFilename = `${config.prefix}_${i}.png`;
        const movedPath = moveFileToImagesIn(srcPath, targetFilename);
        movedPaths.push(movedPath);
      }

      // Convert to WebP & upload
      const mainBannerUrl = await convertToWebpAndUpload(movedPaths[0], `${config.publicIdPrefix}_main_1`);
      const img2Url = await convertToWebpAndUpload(movedPaths[1], `${config.publicIdPrefix}_2`);
      const img3Url = await convertToWebpAndUpload(movedPaths[2], `${config.publicIdPrefix}_3`);
      const img4Url = await convertToWebpAndUpload(movedPaths[3], `${config.publicIdPrefix}_4`);

      const galleryImages = [
        mainBannerUrl,
        img2Url,
        img3Url,
        img4Url,
      ];

      // Find or assign ID
      const existingProduct = await Product.findOne({
        $or: [
          { reference: config.reference },
          { name: config.name }
        ]
      });

      let targetId = existingProduct?.id;
      if (!targetId) {
        const maxProduct = await Product.findOne().sort({ id: -1 });
        targetId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 165;
      }

      const productPayload = {
        id: targetId,
        name: config.name,
        brand: config.brand,
        audience: config.audience,
        factory: config.factory,
        model: config.model,
        reference: config.reference,
        material: config.material,
        size: config.size,
        caliber: config.caliber,
        warranty: config.warranty,
        priceUSD: config.priceUSD,
        priceAED: config.priceAED,
        url: '',
        image: mainBannerUrl,
        thumbnail: mainBannerUrl,
        images: galleryImages,
        movement: config.movement,
        casing: config.casing,
        bezel: config.bezel,
        glass: config.glass,
        waterResistance: config.waterResistance,
        description: config.description,
        features: config.features,
        inStock: true,
        isVisible: true,
        nameAr: config.nameAr,
        brandAr: config.brandAr,
        modelAr: config.modelAr,
        materialAr: config.materialAr,
        movementAr: config.movementAr,
        casingAr: config.casingAr,
        bezelAr: config.bezelAr,
        glassAr: config.glassAr,
        waterResistanceAr: config.waterResistanceAr,
        warrantyAr: config.warrantyAr,
        descriptionAr: config.descriptionAr,
        featuresAr: config.featuresAr,
      };

      const savedProduct = await Product.findOneAndUpdate(
        { $or: [{ id: targetId }, { reference: config.reference }] },
        { $set: productPayload },
        { upsert: true, new: true }
      );

      console.log(`\n✓ SAVED ${savedProduct.name} (ID: ${savedProduct.id}) TO MONGODB SUCCESSFULLY!`);
      console.log(`  Reference: ${savedProduct.reference}`);
      console.log(`  Main Image (WebP): ${savedProduct.image}`);
      console.log(`  Price (USD): ${savedProduct.priceUSD} | Price (AED): ${savedProduct.priceAED}`);
      console.log(`  Gallery Images: ${savedProduct.images.length}`);

      // Clean up empty folder
      try {
        if (fs.existsSync(folderPath)) {
          const remaining = fs.readdirSync(folderPath);
          if (remaining.length === 0) {
            fs.rmdirSync(folderPath);
            console.log(`  ✓ Cleaned up source folder: ${config.folderName}`);
          }
        }
      } catch (err) {
        console.warn(`  Could not remove folder ${config.folderName}:`, err.message);
      }
    }

    // Clean up temp dir
    try {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    } catch {}

    // Check if todays directory is empty or just has documentation.md
    try {
      if (fs.existsSync(TODAY_DIR)) {
        const remaining = fs.readdirSync(TODAY_DIR);
        console.log(`Remaining in ${path.basename(TODAY_DIR)}:`, remaining);
      }
    } catch {}

    await mongoose.connection.close();
    console.log('\nDatabase connection closed. All watches in batch completed successfully!');
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
