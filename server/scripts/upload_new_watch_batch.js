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

const WATCH_BASE_DIR = path.join(ROOT_DIR, 'images_all', 'watch');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_new_watch_batch');

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

function findWatchFolders(dir) {
  let folders = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const hasContent = entries.some(e => e.isFile() && e.name === 'content');
  const hasImages = entries.some(e => e.isFile() && /\.(jpe?g|png|webp)$/i.test(e.name));

  if (hasContent || hasImages) {
    folders.push(dir);
  }

  for (const entry of entries) {
    if (entry.isDirectory()) {
      folders = folders.concat(findWatchFolders(path.join(dir, entry.name)));
    }
  }
  return folders;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
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
    console.log('Uploading New Watches Batch from images_all/watch to Cloudinary & MongoDB');
    console.log('========================================================================');

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
    console.log('Connected to MongoDB database:', mongoose.connection.name);

    let maxProduct = await Product.findOne().sort({ id: -1 });
    let nextId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 145;
    console.log(`Starting Product ID: ${nextId}`);

    const watchFolders = findWatchFolders(WATCH_BASE_DIR);
    console.log(`Found ${watchFolders.length} watch folders to process.\n`);

    const processedFolders = [];

    for (let i = 0; i < watchFolders.length; i++) {
      const folderPath = watchFolders[i];
      const relFolder = path.relative(WATCH_BASE_DIR, folderPath);
      const folderSlug = slugify(relFolder);

      console.log(`\n========================================================================`);
      console.log(`[${i + 1}/${watchFolders.length}] Processing folder: ${relFolder}`);
      console.log(`========================================================================`);

      const contentPath = path.join(folderPath, 'content');
      let contentText = '';
      if (fs.existsSync(contentPath)) {
        contentText = fs.readFileSync(contentPath, 'utf8');
      }

      const getField = (regex) => {
        const m = contentText.match(regex);
        return m ? m[1].replace(/\\$/, '').trim() : '';
      };

      const lines = contentText.split('\n').map(l => l.trim()).filter(Boolean);
      const lineTitle = lines.length > 0 ? lines[0].replace(/\\$/, '').trim() : relFolder;

      const brand = getField(/Brand:\s*(.+)/i) || 'Patek Philippe';
      const subBrand = getField(/Sub-brand:\s*(.+)/i) || (relFolder.includes('Aquanaut') ? 'Aquanaut' : (relFolder.includes('Cubitus') ? 'Cubitus' : (relFolder.includes('Calatrava') ? 'Calatrava' : 'Nautilus')));
      const edition = getField(/Edition\s*\/\s*Maker:\s*(.+)/i) || lineTitle;
      const category = getField(/Category\s*:\s*(.+)/i);
      const reference = getField(/Reference\s*Number:\s*(.+)/i);
      const movement = getField(/Movement\s*Spec:\s*(.+)/i) || 'Automatic mechanical movement';
      const casing = getField(/Casing\s*Material\s*Spec:\s*(.+)/i);
      const bezel = getField(/Bezel\s*Spec:\s*(.+)/i) || 'Polished bezel';
      const glass = getField(/Glass\s*\/\s*Crystal\s*Spec:\s*(.+)/i) || 'Scratch-resistant Sapphire Crystal';
      const material = getField(/Material\s*Composition:\s*(.+)/i) || casing;
      const size = getField(/Diameter\s*Size:\s*(.+)/i);
      const caliber = getField(/Engine\s*\/\s*Caliber:\s*(.+)/i);
      const warranty = getField(/Warranty\s*Term:\s*(.+)/i) || '2-Year Service Warranty';
      const shipping = getField(/Shipping:\s*(.+)/i) || 'Free Shipping';

      // Determine product name cleanly
      let productName = edition;
      if (!productName.toLowerCase().startsWith('patek philippe')) {
        productName = `Patek Philippe ${edition}`;
      }

      // Determine audience (Ladies or Mens)
      let audience = 'Mens';
      const lowerContent = (contentText + ' ' + relFolder + ' ' + category).toLowerCase();
      if (
        lowerContent.includes('ladies') ||
        lowerContent.includes('female') ||
        lowerContent.includes('womens') ||
        relFolder.includes('7118') ||
        relFolder.includes('7010') ||
        relFolder.includes('5267')
      ) {
        audience = 'Ladies';
      }

      // Determine water resistance
      let waterResistance = '120m waterproof vacuum tested';
      if (subBrand === 'Calatrava' || relFolder.includes('Calatrava')) {
        waterResistance = '30m waterproof vacuum tested';
      } else if (subBrand === 'Cubitus' || relFolder.includes('Cubitus')) {
        waterResistance = '30m waterproof vacuum tested';
      } else if (relFolder.includes('7118') || relFolder.includes('7010') || relFolder.includes('5740')) {
        waterResistance = '60m waterproof vacuum tested';
      }

      // Find and sort image files: Ensure 1_FRONT_VIEW is first!
      const imageFiles = fs.readdirSync(folderPath)
        .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
        .sort((a, b) => {
          // Put 1_FRONT_VIEW or 1_... first
          if (/^1_/i.test(a)) return -1;
          if (/^1_/i.test(b)) return 1;
          return a.localeCompare(b);
        });

      if (imageFiles.length === 0) {
        console.warn(`⚠️ No images found in ${folderPath}. Skipping.`);
        continue;
      }

      console.log(`Found ${imageFiles.length} images: ${imageFiles.join(', ')}`);
      console.log(`Banner will be: ${imageFiles[0]}`);

      const uploadedUrls = [];
      const movedFiles = [];

      for (let j = 0; j < imageFiles.length; j++) {
        const imgFile = imageFiles[j];
        const srcPath = path.join(folderPath, imgFile);
        const cleanImgName = imgFile.replace(/\.[^.]+$/, '');
        const publicId = `patek_philippe_${folderSlug}_${slugify(cleanImgName)}`;
        const destFileName = `patek_philippe_${folderSlug}_${imgFile}`;
        const destPath = path.join(IMAGES_IN_DIR, destFileName);

        // Copy image to images in
        fs.copyFileSync(srcPath, destPath);
        movedFiles.push({ srcPath, destPath });
        console.log(`  ✓ Copied to "images in": ${destFileName}`);

        // Convert to WebP and Upload to Cloudinary
        const webpUrl = await convertToWebpAndUpload(destPath, publicId);
        console.log(`  ✓ Cloudinary: ${webpUrl}`);
        uploadedUrls.push(webpUrl);
      }

      const mainImageUrl = uploadedUrls[0];

      // Check if product already exists
      let existingProduct = await Product.findOne({
        $or: [
          { name: productName },
          { reference: reference, brand: brand }
        ]
      });

      let targetId = existingProduct?.id || nextId++;

      const features = [
        `Movement: ${movement}`,
        casing ? `Casing Material: ${casing}` : null,
        bezel ? `Bezel: ${bezel}` : null,
        glass ? `Glass / Crystal: ${glass}` : null,
        reference ? `Reference Number: ${reference}` : null,
        material ? `Material Composition: ${material}` : null,
        size ? `Diameter Size: ${size}` : null,
        caliber ? `Engine / Caliber: ${caliber}` : null,
        `Shipping: ${shipping}`,
        `Warranty: ${warranty}`
      ].filter(Boolean);

      // Arabic localization helpers
      const arabicModelMap = {
        'Nautilus': 'نوتيلوس',
        'Aquanaut': 'أكوانوت',
        'Calatrava': 'كالاترافا',
        'Cubitus': 'كيوبيتوس',
      };
      const modelAr = arabicModelMap[subBrand] || subBrand;

      const productPayload = {
        id: targetId,
        name: productName,
        brand: brand,
        audience: audience,
        factory: edition || productName,
        model: subBrand,
        reference: reference || '',
        material: material || casing || '',
        size: size || '',
        caliber: caliber || '',
        warranty: warranty || '2-Year Service Warranty',
        priceUSD: '',
        priceAED: '',
        url: '',
        image: mainImageUrl,
        thumbnail: mainImageUrl,
        images: uploadedUrls,
        movement: movement,
        casing: casing || material || '',
        bezel: bezel,
        glass: glass,
        waterResistance: waterResistance,
        description: `The ${productName} represents the highest pinnacle of Swiss Haute Horlogerie from ${brand}'s distinguished ${subBrand} collection. Equipped with ${movement}, encased in ${casing || material}, and featuring precision craftsmanship with caliber ${caliber || 'in-house mechanical movement'}.`,
        features: features,
        inStock: true,
        isVisible: true,
        nameAr: productName.replace('Patek Philippe', 'باتيك فيليب').replace('Nautilus', 'نوتيلوس').replace('Aquanaut', 'أكوانوت').replace('Calatrava', 'كالاترافا').replace('Cubitus', 'كيوبيتوس'),
        brandAr: 'باتيك فيليب',
        modelAr: modelAr,
        materialAr: casing ? casing.replace('Stainless Steel', 'فولاذ مقاوم للصدأ').replace('Rose Gold', 'ذهب وردي').replace('White Gold', 'ذهب أبيض').replace('Platinum', 'بلاتين') : 'فولاذ فاخر',
        movementAr: movement,
        casingAr: casing,
        bezelAr: bezel,
        glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
        waterResistanceAr: waterResistance.replace('120m waterproof vacuum tested', 'مقاومة الماء حتى 120 متراً').replace('60m waterproof vacuum tested', 'مقاومة الماء حتى 60 متراً').replace('30m waterproof vacuum tested', 'مقاومة الماء حتى 30 متراً'),
        warrantyAr: 'ضمان خدمة لمدة عامين',
        descriptionAr: `ساعة ${productName} الفاخرة من دار باتيك فيليب السويسرية الراقية، إحدى أرقى إبداعات تشكيلة ${modelAr}، تجمع بين التصميم المتميز والدقة الحرفية الاستثنائية.`,
        featuresAr: features,
      };

      const savedProduct = await Product.findOneAndUpdate(
        { id: targetId },
        { $set: productPayload },
        { upsert: true, new: true }
      );

      console.log(`  ✓ Successfully Saved in MongoDB: Product ID ${savedProduct.id} ("${savedProduct.name}") [Audience: ${savedProduct.audience}]`);

      // Now remove original image files from folder
      for (const { srcPath } of movedFiles) {
        if (fs.existsSync(srcPath)) {
          fs.unlinkSync(srcPath);
        }
      }
      console.log(`  ✓ Removed original images from source folder: ${relFolder}`);

      // Also remove content file and folder if empty
      if (fs.existsSync(contentPath)) {
        fs.unlinkSync(contentPath);
      }
      try {
        const remaining = fs.readdirSync(folderPath);
        if (remaining.length === 0) {
          fs.rmdirSync(folderPath);
          console.log(`  ✓ Removed empty folder: ${relFolder}`);
        }
      } catch (err) {
        console.warn(`  Notice: Could not remove folder ${relFolder}: ${err.message}`);
      }

      processedFolders.push(relFolder);
    }

    // Clean up empty parent folders in WATCH_BASE_DIR if any
    try {
      const topEntries = fs.readdirSync(WATCH_BASE_DIR, { withFileTypes: true });
      for (const ent of topEntries) {
        if (ent.isDirectory()) {
          const topSubdir = path.join(WATCH_BASE_DIR, ent.name);
          const subEntries = fs.readdirSync(topSubdir);
          if (subEntries.length === 0) {
            fs.rmdirSync(topSubdir);
            console.log(`Removed empty top-level dir: ${ent.name}`);
          }
        }
      }
    } catch {}

    // Clean up temp dir
    try {
      if (fs.existsSync(TEMP_DIR)) {
        fs.rmSync(TEMP_DIR, { recursive: true, force: true });
      }
    } catch {}

    console.log('\n========================================================================');
    console.log(`SUCCESS: Processed and uploaded ${processedFolders.length} new watches!`);
    console.log('========================================================================');
  } catch (err) {
    console.error('Fatal Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

main();
