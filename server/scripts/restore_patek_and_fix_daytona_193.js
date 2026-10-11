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
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_fix_patek_daytona');

dotenv.config({ path: path.join(__dirname, '../.env') });

const { MONGO_URI, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

async function convertToWebpAndUpload(sourceFilePath, publicId) {
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
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // 1. Restore Patek Philippe Nautilus 5711/1A-018 "Tiffany & Co." with ID 161
  console.log('\n--- Restoring ID 161 (Patek Philippe Nautilus 5711/1A-018 "Tiffany & Co.") ---');
  
  const patek1 = path.join(IMAGES_IN_DIR, 'patek-philippe-nautilus-5711-1a-018_watch-01.png');
  const patek2 = path.join(IMAGES_IN_DIR, 'patek-philippe-nautilus-5711-1a-018_watch-02.png');
  const patek3 = path.join(IMAGES_IN_DIR, 'patek-philippe-nautilus-5711-1a-018_watch-03.png');
  const patek4 = path.join(IMAGES_IN_DIR, 'patek-philippe-nautilus-5711-1a-018_watch-04.png');

  const patekUrl1 = await convertToWebpAndUpload(patek1, 'patek-philippe-nautilus-5711-1a-018_watch-01');
  const patekUrl2 = await convertToWebpAndUpload(patek2, 'patek-philippe-nautilus-5711-1a-018_watch-02');
  const patekUrl3 = await convertToWebpAndUpload(patek3, 'patek-philippe-nautilus-5711-1a-018_watch-03');
  const patekUrl4 = await convertToWebpAndUpload(patek4, 'patek-philippe-nautilus-5711-1a-018_watch-04');

  const patekPayload = {
    id: 161,
    name: 'Patek Philippe Nautilus 5711/1A-018 "Tiffany & Co."',
    brand: 'Patek Philippe',
    audience: 'Mens',
    factory: '170th Anniversary Edition (Limited 170 Pieces)',
    model: 'Nautilus',
    reference: '5711/1A-018',
    material: 'Stainless steel case and bracelet with Tiffany blue lacquer dial',
    size: '40 mm',
    caliber: '26-330 S C',
    warranty: '2-Year Service Warranty',
    priceUSD: '$52,000',
    priceAED: 'AED 190,840',
    url: '',
    image: patekUrl1,
    thumbnail: patekUrl1,
    images: [patekUrl1, patekUrl2, patekUrl3, patekUrl4],
    movement: 'Self-winding mechanical movement, Caliber 26-330 S C, date, sweep seconds',
    casing: 'Stainless steel',
    bezel: 'Stainless steel satin-brushed bezel with polished bevels',
    glass: 'Sapphire crystal with 170th Anniversary commemorative Tiffany & Co. inscription',
    waterResistance: '120m waterproof vacuum tested',
    description: 'The Patek Philippe Nautilus Reference 5711/1A-018 was created in celebration of the 170-year partnership between Patek Philippe and Tiffany & Co. Featuring the legendary Tiffany Blue lacquered dial dual-signed by both historic houses, a 40mm stainless steel case, and powered by the self-winding Caliber 26-330 S C.',
    features: [
      'Movement: Self-winding mechanical movement, Caliber 26-330 S C',
      'Casing Material: Stainless steel',
      'Bezel: Stainless steel satin-brushed bezel with polished bevels',
      'Glass / Crystal: Sapphire crystal with commemorative Tiffany & Co. inscription',
      'Reference Number: 5711/1A-018',
      'Material Composition: Stainless steel case and bracelet with Tiffany blue dial',
      'Diameter Size: 40 mm',
      'Engine / Caliber: 26-330 S C',
      'Shipping: Free Shipping',
      'Warranty: 2-Year Service Warranty'
    ],
    inStock: true,
    isVisible: true,
    nameAr: 'باتيك فيليب نوتيلوس 5711/1A-018 "تيفاني آند كو"',
    brandAr: 'باتيك فيليب',
    modelAr: 'نوتيلوس',
    materialAr: 'فولاذ مقاوم للصدأ مع ميناء تيفاني أزرق فيروزي',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة، نافذة تاريخ عند الساعة 3، خاصية إيقاف الثواني',
    casingAr: 'فولاذ مقاوم للصدأ',
    bezelAr: 'إطار فولاذي بتشطيب ساتاني مصقول وحواف مشطوفة',
    glassAr: 'زجاج ياقوتي كريستال مع نقش تذكاري للذكرى 170 لتيفاني وباتيك فيليب',
    waterResistanceAr: 'مقاومة الماء حتى 120 متراً',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة باتيك فيليب نوتيلوس 5711/1A-018 إصدار تيفاني آند كو الأسطوري باللون الأزرق الفيروزي بمناسبة الذكرى الـ 170 للشراكة، محدودة بـ 170 قطعة فقط حول العالم.',
    featuresAr: [
      'الحركة: حركة ميكانيكية ذاتية التعبئة',
      'مادة الهيكل: فولاذ مقاوم للصدأ',
      'الإطار: إطار فولاذي بتشطيب ساتاني مصقول وحواف مشطوفة',
      'الزجاج: زجاج ياقوتي كريستال مع نقش تذكاري',
      'الرقم المرجعي: 5711/1A-018',
      'تركيبة المواد: فولاذ مقاوم للصدأ مع ميناء تيفاني أزرق',
      'الأبعاد: 40 مم',
      'المحرك: 26-330 S C',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  };

  await Product.findOneAndUpdate({ id: 161 }, { $set: patekPayload }, { upsert: true, new: true });
  console.log('✓ Restored Patek Philippe ID 161');

  // 2. Set Rolex Cosmograph Daytona Oysterflex “Turquoise Tiffany Blue Dial” to ID 193
  console.log('\n--- Setting Rolex Daytona Turquoise Tiffany to ID 193 ---');

  const rolexImages = [
    'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1790403407/t24_watches_clean/rolex_cosmograph_daytona_oysterflex_turquoise_tiffany_126518ln_1.webp',
    'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1790403413/t24_watches_clean/rolex_cosmograph_daytona_oysterflex_turquoise_tiffany_126518ln_2.webp',
    'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1790403420/t24_watches_clean/rolex_cosmograph_daytona_oysterflex_turquoise_tiffany_126518ln_3.webp',
    'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1790403424/t24_watches_clean/rolex_cosmograph_daytona_oysterflex_turquoise_tiffany_126518ln_4.webp'
  ];

  const rolexPayload = {
    id: 193,
    name: 'Rolex Cosmograph Daytona Oysterflex “Turquoise Tiffany Blue Dial”',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Cosmograph Daytona Oysterflex “Turquoise Tiffany Blue Dial”',
    model: 'Daytona',
    reference: '126518LN',
    material: 'Yellow gold case and rubber bracelet',
    size: '40 mm',
    caliber: '4131',
    warranty: 'Two Years of Service',
    priceUSD: '$1,610',
    priceAED: 'AED 5,900',
    url: '',
    image: rolexImages[0],
    thumbnail: rolexImages[0],
    images: rolexImages,
    movement: 'Automatic chronograph movement',
    casing: 'Yellow gold',
    bezel: 'Ceramic',
    glass: 'Sapphire crystal',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Cosmograph Daytona Oysterflex “Turquoise Tiffany Blue Dial” (Reference 126518LN) is a stunning luxury chronograph featuring a radiant 18 ct yellow gold case, mesmerizing turquoise Tiffany blue lacquered dial with contrasting black sub-dials, high-performance black Cerachrom ceramic bezel, flexible Oysterflex rubber bracelet, and powered by the cutting-edge Calibre 4131 automatic chronograph movement. Complete with Two Years of Service warranty and Free Shipping.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Daytona',
      'Edition / Maker: Cosmograph Daytona Oysterflex “Turquoise Tiffany Blue Dial”',
      'Movement: Automatic chronograph movement',
      'Casing Material: Yellow gold',
      'Bezel: Ceramic',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: 126518LN',
      'Material Composition: Yellow gold case and rubber bracelet',
      'Diameter Size: 40 mm',
      'Engine / Caliber: 4131',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    inStock: true,
    isVisible: true,
    nameAr: 'رولكس كوزموغراف دايتونا أويسترفليكس "ميناء تيفاني بلو فيروزي"',
    brandAr: 'رولكس',
    modelAr: 'دايتونا',
    materialAr: 'علبة من الذهب الأصفر وسوار مطاطي',
    movementAr: 'حركة كرونوغراف أوتوماتيكية',
    casingAr: 'ذهب أصفر',
    bezelAr: 'سيراميك',
    glassAr: 'كريستال الياقوت السافاير',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تتألق ساعة رولكس كوزموغراف دايتونا أويسترفليكس بميناء تيفاني بلو الفيروزي الآسر (المرجع 126518LN) بالفخامة والجاذبية العصرية، مصنوعة بعلبة من الذهب الأصفر عيار 18 قيراطاً، مع ميناء فيروزي استثنائي، وإطار سيراكروم سيراميك أسود، وسوار أويسترفليكس مطاطي عالي المرونة، ومزودة بحركة أوتوماتيكية متطورة عيار 4131. تشمل ضمان خدمة لمدة عامين وشحن مجاني.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'العلامة التجارية الفرعية: دايتونا',
      'الإصدار / الصانع: كوزموغراف دايتونا أويسترفليكس "ميناء تيفاني بلو فيروزي"',
      'الحركة: حركة كرونوغراف أوتوماتيكية',
      'مادة الهيكل: ذهب أصفر',
      'الإطار: سيراميك',
      'الزجاج / الكريستال: كريستال الياقوت السافاير',
      'الرقم المرجعي: 126518LN',
      'تركيبة المواد: علبة من الذهب الأصفر وسوار مطاطي',
      'حجم القطر: 40 ملم',
      'المحرك / العيار: 4131',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  };

  const savedRolex = await Product.findOneAndUpdate({ id: 193 }, { $set: rolexPayload }, { upsert: true, new: true });
  console.log('✓ Saved Rolex Daytona Turquoise Tiffany with ID 193: ' + savedRolex.name);

  // Clean temp
  try { fs.rmSync(TEMP_DIR, { recursive: true, force: true }); } catch {}

  await mongoose.connection.close();
  console.log('Done!');
}

main();
