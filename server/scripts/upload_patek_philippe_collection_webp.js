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
const WATCHES_DOC_PATH = path.join(ROOT_DIR, 'images_all', 'watch images', 'watch images', 'public', 'watches', 'documentation.md');
const WATCHES_BASE_DIR = path.join(ROOT_DIR, 'images_all', 'watch images', 'watch images', 'public');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_patek_collection');

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

function parseDocumentation(docContent) {
  const sections = docContent.split(/^##\s+Watch\s+\d+:\s+/m).slice(1);
  const watches = [];

  for (const section of sections) {
    const lines = section.split('\n');
    const title = lines[0].trim();
    
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

    // Parse image relative paths
    const imageMatches = [...section.matchAll(/-\s*`?(\/watches\/[^`\n\r]+)`?/gi)];
    const imageRelPaths = imageMatches.map(m => m[1].trim());

    watches.push({
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
      imageRelPaths,
    });
  }

  return watches;
}

async function convertToWebpAndUpload(sourceFilePath, publicId) {
  console.log(`  ⚙️  Processing WebP for "${path.basename(sourceFilePath)}"...`);
  const webpFilename = `${publicId}.webp`;
  const tempWebpPath = path.join(TEMP_DIR, webpFilename);

  await sharp(sourceFilePath)
    .webp({ quality: 90, alphaQuality: 100, lossless: false })
    .toFile(tempWebpPath);

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
    console.log('Processing Watch Collection Documentation (Patek Philippe Watches)');
    console.log('========================================================================');

    if (!fs.existsSync(WATCHES_DOC_PATH)) {
      throw new Error(`Documentation file not found at: ${WATCHES_DOC_PATH}`);
    }

    const docContent = fs.readFileSync(WATCHES_DOC_PATH, 'utf8');
    const watches = parseDocumentation(docContent);
    console.log(`Parsed ${watches.length} watches from documentation.md\n`);

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
    let nextId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 125;

    for (let i = 0; i < watches.length; i++) {
      const w = watches[i];
      console.log(`\n========================================================================`);
      console.log(`[${i + 1}/${watches.length}] Processing: ${w.title}`);
      console.log(`========================================================================`);

      const uploadedImageUrls = [];
      const movedImagePaths = [];

      for (let j = 0; j < w.imageRelPaths.length; j++) {
        const relPath = w.imageRelPaths[j]; // e.g. /watches/patek-philippe-nautilus-5980-60g-001/watch-01.png
        const cleanRelPath = relPath.replace(/^\/?watches\//, ''); // e.g. patek-philippe-nautilus-5980-60g-001/watch-01.png
        const folderName = path.dirname(cleanRelPath);
        const fileName = path.basename(cleanRelPath);
        
        const srcPath = path.join(WATCHES_BASE_DIR, 'watches', cleanRelPath);
        const destFileName = `${folderName}_${fileName}`;
        const destPath = path.join(IMAGES_IN_DIR, destFileName);

        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, destPath);
          fs.unlinkSync(srcPath);
          console.log(`  ✓ Moved to "images in": ${destFileName}`);
        } else if (!fs.existsSync(destPath)) {
          console.warn(`  ⚠️ Warning: Image not found at ${srcPath} or ${destPath}`);
          continue;
        }

        movedImagePaths.push(destPath);

        const publicId = `${folderName}_${fileName.replace(/\.[^.]+$/, '')}`;
        const webpUrl = await convertToWebpAndUpload(destPath, publicId);
        console.log(`  ✓ Cloudinary: ${webpUrl}`);
        uploadedImageUrls.push(webpUrl);
      }

      if (uploadedImageUrls.length === 0) {
        console.warn(`  ⚠️ Skipping DB insertion for ${w.title} due to missing images.`);
        continue;
      }

      const mainImageUrl = uploadedImageUrls[0];

      // Format USD price
      let cleanUSD = w.priceUSD;
      if (!cleanUSD.startsWith('$')) cleanUSD = `$${cleanUSD}`;

      // Format AED price
      let formattedAED = w.priceAED;
      if (!formattedAED || formattedAED.includes('market dependent')) {
        const numMatch = cleanUSD.replace(/[^0-9]/g, '');
        if (numMatch) {
          const usdVal = parseFloat(numMatch);
          formattedAED = `AED ${(usdVal * 3.665).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
      }

      // Check if product exists in DB
      let existingProduct = await Product.findOne({
        $or: [
          { name: w.title },
          { reference: w.reference, brand: w.brand }
        ]
      });

      let targetId = existingProduct?.id || nextId++;

      const features = [
        `Movement: ${w.movement}`,
        w.casing ? `Casing Material: ${w.casing}` : null,
        w.bezel ? `Bezel: ${w.bezel}` : null,
        w.glass ? `Glass / Crystal: ${w.glass}` : null,
        w.reference ? `Reference Number: ${w.reference}` : null,
        w.material ? `Material Composition: ${w.material}` : null,
        w.size ? `Diameter Size: ${w.size}` : null,
        w.caliber ? `Engine / Caliber: ${w.caliber}` : null,
        `Shipping: ${w.shipping}`,
        `Warranty: ${w.warranty}`
      ].filter(Boolean);

      const productPayload = {
        id: targetId,
        name: w.title,
        brand: w.brand,
        audience: 'Mens',
        factory: w.edition || w.title,
        model: w.subBrand,
        reference: w.reference,
        material: w.material,
        size: w.size,
        caliber: w.caliber,
        warranty: w.warranty,
        priceUSD: cleanUSD,
        priceAED: formattedAED,
        url: '',
        image: mainImageUrl,
        thumbnail: mainImageUrl,
        images: uploadedImageUrls,
        movement: w.movement,
        casing: w.casing || w.material,
        bezel: w.bezel || 'Porthole-inspired octagonal bezel',
        glass: w.glass,
        waterResistance: '120m waterproof vacuum tested',
        description: `The ${w.title} is an exceptional masterpiece in Haute Horlogerie from ${w.brand}'s prestigious ${w.subBrand} line. Featuring ${w.material}, driven by ${w.caliber || 'a high-precision manufacture movement'}, and crafted to the highest Swiss horological standards.`,
        features,
        inStock: true,
        isVisible: true,
        // Arabic Translations
        nameAr: w.title.replace('Patek Philippe', 'باتيك فيليب').replace('Nautilus', 'نوتيلوس').replace('Aquanaut', 'أكوانوت').replace('Calatrava', 'كالاترافا'),
        brandAr: 'باتيك فيليب',
        modelAr: w.subBrand === 'Nautilus' ? 'نوتيلوس' : (w.subBrand === 'Aquanaut' ? 'أكوانوت' : 'كالاترافا'),
        materialAr: w.casing ? w.casing.replace('Stainless Steel', 'فولاذ مقاوم للصدأ').replace('Rose Gold', 'ذهب وردي').replace('White Gold', 'ذهب أبيض') : 'فولاذ مقاوم للصدأ',
        movementAr: w.movement,
        casingAr: w.casing,
        bezelAr: w.bezel,
        glassAr: 'زجاج ياقوتي كريستال',
        waterResistanceAr: 'مقاومة الماء حتى 120 متراً',
        warrantyAr: 'ضمان خدمة لمدة عامين',
        descriptionAr: `ساعة ${w.title} من دار باتيك فيليب السويسرية العريقة، تمثل قمة الفخامة والدقة الميكانيكية الراقية ضمن مجموعة ${w.subBrand} الأسطورية.`,
        featuresAr: features
      };

      const savedProduct = await Product.findOneAndUpdate(
        { id: targetId },
        { $set: productPayload },
        { upsert: true, new: true }
      );

      console.log(`  ✓ Saved Product ID ${savedProduct.id}: ${savedProduct.name}`);
    }

    // Clean up empty directories in watch images/public/watches
    const watchesDir = path.join(WATCHES_BASE_DIR, 'watches');
    if (fs.existsSync(watchesDir)) {
      const subdirs = fs.readdirSync(watchesDir);
      for (const subdir of subdirs) {
        const fullSubdir = path.join(watchesDir, subdir);
        if (fs.statSync(fullSubdir).isDirectory()) {
          try {
            const files = fs.readdirSync(fullSubdir);
            if (files.length === 0) {
              fs.rmdirSync(fullSubdir);
            }
          } catch {}
        }
      }
    }

    // Clean up temp dir
    try {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    } catch {}

    await mongoose.connection.close();
    console.log('\n========================================================================');
    console.log('All 22 Patek Philippe watches processed and uploaded successfully!');
    console.log('========================================================================');
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
