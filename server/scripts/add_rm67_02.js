import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

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

const IMAGES_DIR = path.join(ROOT_DIR, 'images in');

async function uploadImage(filename, publicId) {
  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  console.log(`Uploading ${filename} as ${publicId} to Cloudinary...`);
  const result = await cloudinary.uploader.upload(filePath, {
    folder: 't24_watches_clean',
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
  });
  console.log(`✓ Uploaded ${filename}: ${result.secure_url}`);
  return result.secure_url;
}

async function run() {
  try {
    console.log('--- ADDING RICHARD MILLE RM 67-02 ALEXIS PINTURAULT ---');
    
    // 1. Upload Images to Cloudinary
    console.log('\n1. Uploading images to Cloudinary...');
    
    // Main banner as specified by user
    const mainImageUrl = await uploadImage(
      'WhatsApp Image 2026-09-03 at 17.40.45.jpeg',
      'rm_67_02_alexis_pinturault_main'
    );

    // Caseback image
    const backImageUrl = await uploadImage(
      'WhatsApp Image 2026-09-03 at 17.40.44.jpeg',
      'rm_67_02_alexis_pinturault_caseback'
    );

    // Crown side image
    const crownImageUrl = await uploadImage(
      'WhatsApp Image 2026-09-03 at 17.40.44 (2).jpeg',
      'rm_67_02_alexis_pinturault_crown'
    );

    // Side profile image
    const sideImageUrl = await uploadImage(
      'WhatsApp Image 2026-09-03 at 17.40.44 (1).jpeg',
      'rm_67_02_alexis_pinturault_side'
    );

    const allGalleryImages = [
      mainImageUrl,
      backImageUrl,
      crownImageUrl,
      sideImageUrl
    ];

    // 2. Connect to MongoDB
    console.log('\n2. Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database:', mongoose.connection.name);

    // Determine ID
    const maxProduct = await Product.findOne().sort({ id: -1 });
    const newId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 101;
    console.log(`Assigning Product ID: ${newId}`);

    // 3. Construct Product Document
    const productData = {
      id: newId,
      name: 'Richard Mille RM 67-02 Automatic Alexis Pinturault',
      brand: 'Richard Mille',
      audience: 'Mens',
      factory: 'Alexis Pinturault Edition',
      model: 'RM 67-02',
      reference: 'RM 67-02',
      material: 'Quartz TPT®, Carbon TPT®, Grade 5 titanium, and Carbon TPT® / white gold rotor',
      size: '38.70 × 47.52 mm',
      caliber: 'CRMA7',
      warranty: '2-Year Service Warranty',
      priceUSD: '$4,300',
      priceAED: 'AED 15,791.75',
      url: '',
      image: mainImageUrl,
      thumbnail: mainImageUrl,
      images: allGalleryImages,
      movement: 'Automatic winding, skeletonised movement with hours and minutes',
      casing: 'Quartz TPT® bezel and caseback; Carbon TPT® caseband',
      bezel: 'Quartz TPT®',
      glass: 'Sapphire crystal',
      waterResistance: '30 metres / 100 feet',
      description: 'The Richard Mille RM 67-02 Automatic Alexis Pinturault is an ultra-lightweight high-performance sports watch engineered with exceptional ergonomic comfort. Featuring a skeletonised CRMA7 automatic caliber within a high-tech Quartz TPT® and Carbon TPT® composite case, crafted in tribute to world champion French alpine ski racer Alexis Pinturault.',
      features: [
        'Automatic winding skeletonised movement (Caliber CRMA7)',
        'Ultra-lightweight ergonomic case: Quartz TPT® and Carbon TPT®',
        'Comfort non-slip elastic strap in French ski racing blue',
        'Sapphire crystal with anti-reflective and scratch-resistant coating',
        'Grade 5 titanium baseplate and bridges with black DLC treatment',
        'Carbon TPT® and white gold variable-geometry rotor',
        'Case dimensions: 38.70 × 47.52 mm with ultra-slim profile'
      ],
      inStock: true,
      isVisible: true,
      // Arabic Translations
      nameAr: 'ريتشارد ميل RM 67-02 أوتوماتيك ألكسيس بينتورولت',
      brandAr: 'ريتشارد ميل',
      modelAr: 'RM 67-02',
      materialAr: 'كوارتز TPT®، كربون TPT®، تيتانيوم من الدرجة 5 ودوار من الذهب الأبيض',
      movementAr: 'تعبئة أوتوماتيكية، حركة هيكلية مع الساعات والدقائق (عيار CRMA7)',
      casingAr: 'إطار وظهر علبة من كوارتز TPT®؛ حزام علبة من كربون TPT®',
      bezelAr: 'كوارتز TPT®',
      glassAr: 'زجاج ياقوتي مقاوم للانعكاس والخدش',
      waterResistanceAr: '30 متر / 100 قدم',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة ريتشارد ميل RM 67-02 أوتوماتيك ألكسيس بينتورولت فائقة الخفة والمتانة، مصممة بأعلى معايير الهندسة السويسرية بالتعاون مع بطل التزلج العالمي ألكسيس بينتورولت مع هيكل كوارتز TPT® وعيار CRMA7 الهيكلي.',
      featuresAr: [
        'حركة هيكلية بتعبئة أوتوماتيكية (عيار CRMA7)',
        'هيكل خفيف للغاية ومريح: كوارتز TPT® وكربون TPT®',
        'حزام مطاطي مريح بلون السباق الأزرق',
        'زجاج ياقوتي مقاوم للخدش والانعكاس',
        'صفيحة وجسور من التيتانيوم من الدرجة 5 مع طلاء DLC الأسود',
        'أبعاد العلبة: 38.70 × 47.52 مم مع تصميم فائق النحافة'
      ]
    };

    // 4. Save to Database
    const product = new Product(productData);
    await product.save();
    console.log(`\n✓ Successfully saved product to MongoDB!`);
    console.log(`Product ID: ${product.id}`);
    console.log(`Product Name: ${product.name}`);
    console.log(`Price USD: ${product.priceUSD}`);
    console.log(`Price AED: ${product.priceAED}`);
    console.log(`Main Image URL: ${product.image}`);
    console.log(`Gallery Images (${product.images.length}):`, product.images);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed. Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding product:', error);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
}

run();
