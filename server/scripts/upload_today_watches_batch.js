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
const TODAY_WATCHES_DIR = path.join(ROOT_DIR, 'images_all', 'today_watches');
const WATCHES_DOC_PATH = path.join(TODAY_WATCHES_DIR, 'documentation.md');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_today_watches_webp');

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

// Map the 4 folders to their metadata and image specifications
const PRODUCTS_CONFIG = [
  {
    folderName: 'patek-philippe-aquanaut-5968a-001',
    docHeading: 'Watch 11: Patek Philippe Aquanaut Chronograph 5968A-001',
    audience: 'Mens',
    waterResistance: '120m waterproof vacuum tested',
    waterResistanceAr: 'مقاومة الماء حتى 120 متراً',
    nameAr: 'باتيك فيليب أكوانوت كرونوغراف 5968A-001',
    brandAr: 'باتيك فيليب',
    modelAr: 'أكوانوت',
    materialAr: 'فولاذ مقاوم للصدأ مع حزام مطاطي تروبيكال أسود وبرتقالي',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة، كرونوغراف فلايباك، عداد 60 دقيقة، نافذة للتاريخ',
    casingAr: 'فولاذ مقاوم للصدأ',
    bezelAr: 'إطار من الفولاذ المقاوم للصدأ بتشطيب ساتاني وحواف مصقولة',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة باتيك فيليب أكوانوت كرونوغراف 5968A-001 الفاخرة، تجمع بين الطابع الرياضي العصري ودقة الكرونوغراف الميكانيكي السويسري فائق الأداء.',
    // Custom file sorter/mapper for this folder
    getImageFiles: (dir) => {
      const files = fs.readdirSync(dir).filter(f => !f.startsWith('.'));
      // Find banner image
      const banner = files.find(f => f.toLowerCase().includes('main baner') || f.toLowerCase().includes('watch-01'));
      const others = files.filter(f => f !== banner).sort();
      const ordered = [banner, ...others].filter(Boolean);
      return ordered;
    }
  },
  {
    folderName: 'patek-philippe-nautilus-7118-1200r-010',
    docHeading: 'Watch 23: Patek Philippe Nautilus 7118/1200R-010',
    audience: 'Ladies',
    waterResistance: '60m waterproof vacuum tested',
    waterResistanceAr: 'مقاومة الماء حتى 60 متراً',
    nameAr: 'باتيك فيليب نوتيلوس نسائية أوتوماتيك 7118/1200R-010',
    brandAr: 'باتيك فيليب',
    modelAr: 'نوتيلوس',
    materialAr: 'ذهب وردي عيار 18 قيراط مع ترصيع ألماس وميناء بني أوبالين',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة، نافذة تاريخ عند الساعة 6، عقرب ثوانٍ مركزي',
    casingAr: 'ذهب وردي عيار 18 قيراط',
    bezelAr: 'إطار من الذهب الوردي عيار 18 قيراط مرصع بـ 56 ماسة بريليانت (~0.67 قيراط)',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش مع خلفية شفافة',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة باتيك فيليب نوتيلوس 7118/1200R-010 النسائية المصنوعة من الذهب الوردي عيار 18 قيراط والمرصعة بالألماس الفاخر مع ميناء بني ذهبي متموج.',
    getImageFiles: (dir) => {
      return fs.readdirSync(dir).filter(f => !f.startsWith('.')).sort();
    }
  },
  {
    folderName: 'patek-philippe-nautilus-5711-1a-018',
    docHeading: 'Watch 24: Patek Philippe Nautilus 5711/1A-018 "Tiffany & Co."',
    audience: 'Mens',
    waterResistance: '120m waterproof vacuum tested',
    waterResistanceAr: 'مقاومة الماء حتى 120 متراً',
    nameAr: 'باتيك فيليب نوتيلوس 5711/1A-018 "تيفاني آند كو"',
    brandAr: 'باتيك فيليب',
    modelAr: 'نوتيلوس',
    materialAr: 'فولاذ مقاوم للصدأ مع ميناء تيفاني أزرق فيروزي',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة، نافذة تاريخ عند الساعة 3، خاصية إيقاف الثواني',
    casingAr: 'فولاذ مقاوم للصدأ',
    bezelAr: 'إطار فولاذي بتشطيب ساتاني مصقول وحواف مشطوفة',
    glassAr: 'زجاج ياقوتي كريستال مع نقش تذكاري للذكرى 170 لتيفاني وباتيك فيليب',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة باتيك فيليب نوتيلوس 5711/1A-018 إصدار تيفاني آند كو الأسطوري باللون الأزرق الفيروزي بمناسبة الذكرى الـ 170 للشراكة، محدودة بـ 170 قطعة فقط حول العالم.',
    getImageFiles: (dir) => {
      return fs.readdirSync(dir).filter(f => !f.startsWith('.')).sort();
    }
  },
  {
    folderName: 'patek-philippe-nautilus-5976-1g-001',
    docHeading: 'Watch 25: Patek Philippe Nautilus 40th Anniversary Flyback Chronograph 5976/1G-001',
    audience: 'Mens',
    waterResistance: '120m waterproof vacuum tested',
    waterResistanceAr: 'مقاومة الماء حتى 120 متراً',
    nameAr: 'باتيك فيليب نوتيلوس الذكرى الـ40 كرونوغراف فلايباك 5976/1G-001',
    brandAr: 'باتيك فيليب',
    modelAr: 'نوتيلوس',
    materialAr: 'ذهب أبيض عيار 18 قيراط مع ميناء أزرق منقوش بالذكرى الـ40',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة، كرونوغراف فلايباك، عداد أحادي 60 دقيقة و12 ساعة، نافذة للتاريخ',
    casingAr: 'ذهب أبيض عيار 18 قيراط',
    bezelAr: 'إطار من الذهب الأبيض عيار 18 قيراط بتشطيب ساتاني وحواف مصقولة',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش مع خلفية شفافة',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة باتيك فيليب نوتيلوس 5976/1G-001 المصنوعة من الذهب الأبيض عيار 18 قيراط احتفالاً بالذكرى الأربعين لمجموعة نوتيلوس الأيقونية، إصدار محدود يضم 1,300 قطعة فقط.',
    getImageFiles: (dir) => {
      return fs.readdirSync(dir).filter(f => !f.startsWith('.')).sort();
    }
  }
];

function parseDocumentation(docContent) {
  const sections = docContent.split(/^##\s+/m).slice(1);
  const docMap = {};

  for (const section of sections) {
    const lines = section.split('\n');
    const header = lines[0].trim();
    
    const getField = (regex) => {
      const match = section.match(regex);
      return match ? match[1].trim() : '';
    };

    const brand = getField(/\*\*Brand:\*\*\s*(.+)/i) || 'Patek Philippe';
    const subBrand = getField(/\*\*Sub-brand:\*\*\s*(.+)/i) || 'Nautilus';
    const edition = getField(/\*\*Edition \/ Maker:\*\*\s*(.+)/i) || '';
    const priceUSD = getField(/\*\*Price \(USD\):\*\*\s*(.+)/i) || '$0.00';
    const priceAED = getField(/\*\*Price \(AED\):\*\*\s*(.+)/i) || '';
    const shipping = getField(/\*\*Shipping:\*\*\s*(.+)/i) || 'Free Shipping';
    const movement = getField(/\*\*Movement Spec:\*\*\s*(.+)/i) || 'Automatic movement';
    const casing = getField(/\*\*Casing Material Spec:\*\*\s*(.+)/i) || '';
    const bezel = getField(/\*\*Bezel Spec:\*\*\s*(.+)/i) || '';
    const glass = getField(/\*\*Glass \/ Crystal Spec:\*\*\s*(.+)/i) || 'Sapphire crystal';
    const reference = getField(/\*\*Reference Number:\*\*\s*(.+)/i) || '';
    const material = getField(/\*\*Material Composition:\*\*\s*(.+)/i) || casing;
    const size = getField(/\*\*Diameter Size:\*\*\s*(.+)/i) || '';
    const caliber = getField(/\*\*Engine \/ Caliber:\*\*\s*(.+)/i) || '';
    const warranty = getField(/\*\*Warranty Term:\*\*\s*(.+)/i) || 'Two years of service';

    // Extract title from header (e.g., "Watch 11: Patek Philippe Aquanaut Chronograph 5968A-001" -> "Patek Philippe Aquanaut Chronograph 5968A-001")
    const titleMatch = header.match(/Watch\s+\d+:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : header;

    docMap[header] = {
      header,
      title,
      brand,
      subBrand,
      edition,
      priceUSD,
      priceAED,
      shipping,
      movement,
      casing,
      bezel,
      glass,
      reference,
      material,
      size,
      caliber,
      warranty,
    };
  }

  return docMap;
}

async function convertToWebpAndUpload(sourceFilePath, publicId) {
  console.log(`  ⚙️  Converting to WebP: "${path.basename(sourceFilePath)}"...`);
  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  await sharp(sourceFilePath)
    .webp({ quality: 90, alphaQuality: 100, lossless: false })
    .toFile(tempWebpPath);

  console.log(`  ☁️  Uploading to Cloudinary (public_id: "${publicId}")...`);
  const result = await cloudinary.uploader.upload(tempWebpPath, {
    folder: 't24_watches_clean',
    public_id: publicId,
    format: 'webp',
    overwrite: true,
    resource_type: 'image',
  });

  return result.secure_url;
}

async function main() {
  try {
    console.log('========================================================================');
    console.log("Processing Today's 4 Watches Batch Upload & Move");
    console.log('========================================================================\n');

    if (!fs.existsSync(WATCHES_DOC_PATH)) {
      throw new Error(`Documentation file not found at: ${WATCHES_DOC_PATH}`);
    }

    const docContent = fs.readFileSync(WATCHES_DOC_PATH, 'utf8');
    const docMap = parseDocumentation(docContent);
    console.log(`Parsed ${Object.keys(docMap).length} entries from documentation.md\n`);

    // Connect to MongoDB
    console.log('--- CONNECTING TO MONGODB ---');
    let connected = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        console.log(`Connecting to MongoDB (attempt ${attempt}/5)...`);
        await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
        connected = true;
        break;
      } catch (err) {
        console.warn(`Attempt ${attempt} failed (${err.message}). Retrying in 2 seconds...`);
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (!connected) throw new Error('Could not connect to MongoDB after multiple attempts');
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    let maxProduct = await Product.findOne().sort({ id: -1 });
    let nextId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 159;
    console.log(`Current highest Product ID: ${maxProduct?.id}, Next ID will start at: ${nextId}\n`);

    const processedFolders = [];

    for (let i = 0; i < PRODUCTS_CONFIG.length; i++) {
      const cfg = PRODUCTS_CONFIG[i];
      const folderPath = path.join(TODAY_WATCHES_DIR, cfg.folderName);
      
      console.log(`\n========================================================================`);
      console.log(`[${i + 1}/${PRODUCTS_CONFIG.length}] Processing folder: ${cfg.folderName}`);
      console.log(`========================================================================`);

      if (!fs.existsSync(folderPath)) {
        console.error(`❌ Folder does not exist: ${folderPath}`);
        continue;
      }

      const docInfo = docMap[cfg.docHeading];
      if (!docInfo) {
        console.error(`❌ Could not find documentation entry for header: "${cfg.docHeading}"`);
        continue;
      }

      const imageFiles = cfg.getImageFiles(folderPath);
      console.log(`Found ${imageFiles.length} images in folder:`, imageFiles);

      if (imageFiles.length === 0) {
        console.warn(`⚠️ No images found in ${folderPath}. Skipping.`);
        continue;
      }

      const uploadedImageUrls = [];
      const movedImagesInPaths = [];

      for (let idx = 0; idx < imageFiles.length; idx++) {
        const origFile = imageFiles[idx];
        const srcFilePath = path.join(folderPath, origFile);
        const seqNumber = String(idx + 1).padStart(2, '0'); // 01, 02, 03, 04
        const destFileName = `${cfg.folderName}_watch-${seqNumber}.png`;
        const destFilePath = path.join(IMAGES_IN_DIR, destFileName);

        // Copy / Move into images in
        console.log(`  📂 Copying "${origFile}" -> "images in/${destFileName}"`);
        fs.copyFileSync(srcFilePath, destFilePath);
        movedImagesInPaths.push(destFilePath);

        // Convert to WebP and Upload to Cloudinary
        const publicId = `${cfg.folderName}_watch-${seqNumber}`;
        const cloudUrl = await convertToWebpAndUpload(destFilePath, publicId);
        console.log(`  ✓ Cloudinary URL: ${cloudUrl}`);
        uploadedImageUrls.push(cloudUrl);
      }

      const mainImageUrl = uploadedImageUrls[0];

      // Format clean prices
      let cleanUSD = docInfo.priceUSD;
      if (cleanUSD.includes('~$')) {
        cleanUSD = cleanUSD.replace('~$', '$').split('(')[0].trim();
      } else if (cleanUSD.includes('Price on Request / ~$')) {
        cleanUSD = cleanUSD.replace('Price on Request / ~$', '$').split('(')[0].trim();
      } else {
        cleanUSD = cleanUSD.split('(')[0].trim();
      }

      let cleanAED = docInfo.priceAED;
      if (cleanAED.includes('~AED')) {
        cleanAED = cleanAED.replace('~AED', 'AED ').split('(')[0].trim();
      } else {
        cleanAED = cleanAED.split('(')[0].trim();
      }

      // Check if product already exists in DB
      let existingProduct = await Product.findOne({
        $or: [
          { name: docInfo.title },
          { reference: docInfo.reference, name: docInfo.title },
          { reference: docInfo.reference, brand: docInfo.brand, model: docInfo.subBrand, factory: docInfo.edition }
        ]
      });

      let targetId = existingProduct?.id || nextId++;

      const features = [
        `Movement: ${docInfo.movement}`,
        docInfo.casing ? `Casing Material: ${docInfo.casing}` : null,
        docInfo.bezel ? `Bezel: ${docInfo.bezel}` : null,
        docInfo.glass ? `Glass / Crystal: ${docInfo.glass}` : null,
        docInfo.reference ? `Reference Number: ${docInfo.reference}` : null,
        docInfo.material ? `Material Composition: ${docInfo.material}` : null,
        docInfo.size ? `Diameter Size: ${docInfo.size}` : null,
        docInfo.caliber ? `Engine / Caliber: ${docInfo.caliber}` : null,
        `Shipping: ${docInfo.shipping}`,
        `Warranty: ${docInfo.warranty}`
      ].filter(Boolean);

      const productPayload = {
        id: targetId,
        name: docInfo.title,
        brand: docInfo.brand,
        audience: cfg.audience || 'Mens',
        factory: docInfo.edition || docInfo.title,
        model: docInfo.subBrand,
        reference: docInfo.reference,
        material: docInfo.material,
        size: docInfo.size,
        caliber: docInfo.caliber,
        warranty: docInfo.warranty,
        priceUSD: cleanUSD,
        priceAED: cleanAED,
        url: '',
        image: mainImageUrl,
        thumbnail: mainImageUrl,
        images: uploadedImageUrls,
        movement: docInfo.movement,
        casing: docInfo.casing || docInfo.material,
        bezel: docInfo.bezel || 'Porthole-inspired octagonal bezel',
        glass: docInfo.glass,
        waterResistance: cfg.waterResistance,
        description: `The ${docInfo.title} is an exceptional masterpiece in Haute Horlogerie from ${docInfo.brand}'s prestigious ${docInfo.subBrand} line. Featuring ${docInfo.material}, driven by ${docInfo.caliber || 'a high-precision manufacture movement'}, and crafted to the highest Swiss horological standards.`,
        features,
        inStock: true,
        isVisible: true,
        // Arabic Translations
        nameAr: cfg.nameAr,
        brandAr: cfg.brandAr,
        modelAr: cfg.modelAr,
        materialAr: cfg.materialAr,
        movementAr: cfg.movementAr,
        casingAr: cfg.casingAr,
        bezelAr: cfg.bezelAr,
        glassAr: cfg.glassAr,
        waterResistanceAr: cfg.waterResistanceAr,
        warrantyAr: cfg.warrantyAr,
        descriptionAr: cfg.descriptionAr,
        featuresAr: features
      };

      const savedProduct = await Product.findOneAndUpdate(
        { id: targetId },
        { $set: productPayload },
        { upsert: true, new: true }
      );

      console.log(`  🎉 Saved Product ID ${savedProduct.id}: "${savedProduct.name}"`);

      // Delete images from today_watches folder
      for (const origFile of imageFiles) {
        const p = path.join(folderPath, origFile);
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }

      // Remove directory
      try {
        fs.rmdirSync(folderPath);
        console.log(`  🗑️  Cleaned up folder from today_watches: ${cfg.folderName}`);
      } catch (err) {
        console.warn(`  ⚠️ Could not remove folder ${cfg.folderName}: ${err.message}`);
      }

      processedFolders.push(cfg.folderName);
    }

    // Clean up temp dir
    try {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    } catch {}

    await mongoose.connection.close();
    console.log('\n========================================================================');
    console.log(`✅ All ${processedFolders.length} products processed, uploaded to Cloudinary, updated in MongoDB, copied to "images in", and cleaned from "today_watches"!`);
    console.log('========================================================================');
    process.exit(0);
  } catch (error) {
    console.error('❌ Execution error:', error);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

main();
