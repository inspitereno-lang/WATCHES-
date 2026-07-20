import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ROOT_DIR = path.join(__dirname, '../..');
const MAPPING_FILE = path.join(ROOT_DIR, 'cloudinary_mappings.json');

// Load existing mappings if any
let urlMappings = {};
if (fs.existsSync(MAPPING_FILE)) {
  try {
    urlMappings = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading mappings file, resetting mappings:', err);
  }
}

function saveMappings() {
  fs.writeFileSync(MAPPING_FILE, JSON.stringify(urlMappings, null, 2));
}

// Function to download image locally in-memory and stream it to Cloudinary
async function uploadToCloudinary(url, folder = 't24_watches_catalogue') {
  if (!url) return '';
  if (url.includes('res.cloudinary.com')) return url; // Already on Cloudinary
  if (urlMappings[url]) {
    return urlMappings[url]; // Return cached mapping
  }

  let targetUrl = url;
  if (url.includes('images.weserv.nl/?url=')) {
    try {
      const parsedUrl = new URL(url);
      const rawUrl = parsedUrl.searchParams.get('url');
      if (rawUrl) targetUrl = rawUrl;
    } catch (e) {
      // fallback
    }
  }

  let retries = 3;
  while (retries > 0) {
    try {
      console.log(`Downloading & streaming to Cloudinary: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} download failed`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const secureUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result.secure_url);
            }
          }
        );
        uploadStream.end(buffer);
      });

      urlMappings[url] = secureUrl;
      saveMappings();
      return secureUrl;
    } catch (error) {
      console.error(`Upload failed for ${targetUrl} (${retries} retries left):`, error.message || error);
      retries--;
      if (retries === 0) {
        return url; // Fallback to original URL
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  return url;
}

// Helper to chunk an array for concurrency control
function chunkArray(array, size) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

const parseSpecsFromDescription = (desc, product) => {
  const specs = {
    brand: product.brand || '',
    model: '',
    reference: '',
    material: product.casing || '904L anti-corrosive stainless steel casing',
    size: '',
    movement: product.movement || 'Clone Caliber Swiss movement',
    caliber: '',
    warranty: '2-Year Service Warranty'
  };
  if (!desc) return specs;
  const keyMappings = {
    brand: ['brand'],
    model: ['model'],
    reference: ['reference number', 'ref number', 'ref. number', 'ref', 'reference'],
    material: ['material', 'casing'],
    size: ['size'],
    movement: ['movement'],
    caliber: ['caliber'],
    warranty: ['warranty']
  };
  const keywords = ['brand', 'model', 'reference number', 'ref number', 'ref. number', 'ref', 'reference', 'material', 'size', 'movement', 'caliber', 'warranty', 'casing', 'functions', 'strap'];
  const lowerDesc = desc.toLowerCase();
  const foundKeys = [];
  keywords.forEach(kw => {
    let index = lowerDesc.indexOf(kw);
    while (index !== -1) {
      const before = index === 0 ? '' : lowerDesc[index-1];
      const after = lowerDesc.slice(index + kw.length, index + kw.length + 1);
      const isWord = /^[a-z0-9]$/i;
      if (!isWord.test(before) && !isWord.test(after)) {
        foundKeys.push({ key: kw, index });
      }
      index = lowerDesc.indexOf(kw, index + 1);
    }
  });
  foundKeys.sort((a, b) => a.index - b.index);
  for (let i = 0; i < foundKeys.length; i++) {
    const current = foundKeys[i];
    const next = foundKeys[i + 1];
    const startPos = current.index + current.key.length;
    const endPos = next ? next.index : desc.length;
    let val = desc.slice(startPos, endPos).trim();
    val = val.replace(/^[-\s:,;]+/, '').replace(/[-\s:,;]+$/, '');
    val = val.replace(/&nbsp;/g, '').trim();
    if (keyMappings.brand.includes(current.key)) specs.brand = val;
    else if (keyMappings.model.includes(current.key)) specs.model = val;
    else if (keyMappings.reference.includes(current.key)) specs.reference = val;
    else if (keyMappings.material.includes(current.key)) specs.material = val;
    else if (keyMappings.size.includes(current.key)) specs.size = val;
    else if (keyMappings.movement.includes(current.key)) specs.movement = val;
    else if (keyMappings.caliber.includes(current.key)) specs.caliber = val;
    else if (keyMappings.warranty.includes(current.key)) specs.warranty = val;
  }
  if (!specs.brand) specs.brand = product.brand;
  if (!specs.movement) specs.movement = product.movement;
  if (!specs.material) specs.material = product.casing || '904L anti-corrosive stainless steel casing';
  if (!specs.model) {
    specs.model = product.name.replace(new RegExp(product.brand, 'i'), '').trim();
  }
  if (specs.warranty.toLowerCase().includes('two year') || specs.warranty.toLowerCase().includes('2 year')) {
    specs.warranty = '2-Year Service Warranty';
  }
  return specs;
};

const cleanBrandingText = (text) => {
  if (!text) return '';
  return text
    .replace(/&#8211;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\b(Clean|VSF|3K|BTF|ZF|PPF|OMF|APS|ARF|Noob)\s+Factory\b/gi, 'Swiss Edition')
    .replace(/\b(Clean|VSF|3K|BTF|ZF|PPF|OMF|APS|ARF|Noob)\b/gi, 'Swiss')
    .replace(/\bfactory\b/gi, 'Edition')
    .replace(/swiss\s+clone/gi, 'master copy')
    .replace(/swiss\s+clones/gi, 'master copies')
    .replace(/mirror\s+copy/gi, 'master copy')
    .replace(/mirror\s+copies/gi, 'master copies')
    .trim();
};

async function run() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('Error: MONGO_URI is missing from server/.env environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB.');

    // Load scraped products
    const rootProductsPath = path.join(ROOT_DIR, 'scraped_products.json');
    if (!fs.existsSync(rootProductsPath)) {
      throw new Error(`scraped_products.json not found at ${rootProductsPath}`);
    }

    const productsData = JSON.parse(fs.readFileSync(rootProductsPath, 'utf8'));
    console.log(`Loaded ${productsData.length} products to sync and upload.`);

    // Clear existing products in DB
    console.log('Clearing database Product collection...');
    await Product.deleteMany({});
    console.log('Database cleared.');

    let processedCount = 0;
    const concurrencyLimit = 6;
    const batches = chunkArray(productsData, concurrencyLimit);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\nProcessing batch ${i + 1}/${batches.length} (${batch.length} products)...`);

      const batchPromises = batch.map(async (item) => {
        try {
          // Upload main image
          const cloudImage = await uploadToCloudinary(item.image);

          // Upload thumbnail
          let cloudThumbnail = cloudImage;
          if (item.thumbnail && item.thumbnail !== item.image) {
            cloudThumbnail = await uploadToCloudinary(item.thumbnail);
          }

          // Upload gallery images
          const cloudGallery = [];
          if (Array.isArray(item.images)) {
            for (const imgUrl of item.images) {
              const cloudUrl = await uploadToCloudinary(imgUrl);
              if (cloudUrl) cloudGallery.push(cloudUrl);
            }
          }

          // Parse specifications and format fields
          const parsed = parseSpecsFromDescription(item.description, item);
          
          const rawFactory = item.factory || 'Custom Factory';
          let cleanedFactory = cleanBrandingText(rawFactory);
          if (cleanedFactory.toLowerCase() === 'custom factory' || cleanedFactory.toLowerCase() === 'factory' || !cleanedFactory) {
            cleanedFactory = 'Swiss Precision';
          }

          const audience = item.audience === 'Ladies' ? 'Womens' : 'Mens';

          const newProduct = new Product({
            id: item.id,
            name: cleanBrandingText(item.name),
            brand: item.brand,
            audience,
            factory: cleanedFactory,
            priceUSD: item.priceUSD || '$1,490.00',
            priceAED: item.priceAED || 'AED 5,468',
            url: item.url || '',
            image: cloudImage,
            thumbnail: cloudThumbnail,
            images: cloudGallery.length > 0 ? cloudGallery : [cloudImage],
            movement: cleanBrandingText(parsed.movement || item.movement) || 'Clone Caliber Swiss movement',
            casing: cleanBrandingText(parsed.material || item.casing) || '904L anti-corrosive stainless steel casing',
            bezel: cleanBrandingText(item.bezel) || 'Hand-finished structural bezel',
            glass: cleanBrandingText(item.glass) || 'Ultra-clear sapphire glass with anti-scratch',
            waterResistance: cleanBrandingText(item.waterResistance) || '50m waterproof vacuum tested',
            description: cleanBrandingText(item.description) || `Superb execution of the iconic ${item.name}.`,
            features: (item.features || [
              "1:1 original weight & alignments",
              "Sweeping second hand matching Swiss sweep speeds",
              "Super-LumiNova elements"
            ]).map(f => cleanBrandingText(f)),
            model: cleanBrandingText(parsed.model || ''),
            reference: cleanBrandingText(parsed.reference || ''),
            material: cleanBrandingText(parsed.material || ''),
            size: cleanBrandingText(parsed.size || ''),
            caliber: cleanBrandingText(parsed.caliber || ''),
            warranty: '2-Year Service Warranty',
            inStock: true
          });

          await newProduct.save();
          processedCount++;
          console.log(`[✓] Sync & Saved product [ID ${item.id}]: ${item.name}`);
        } catch (err) {
          console.error(`[✗] Failed to process product ID ${item.id} (${item.name}):`, err);
        }
      });

      // Await all uploads and database inserts in this batch
      await Promise.all(batchPromises);
    }

    console.log(`\nSuccess! Stored ${processedCount} products to MongoDB with Cloudinary images.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

run();
