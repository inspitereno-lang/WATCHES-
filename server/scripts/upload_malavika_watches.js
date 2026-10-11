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
const SOURCE_DIR = path.join(ROOT_DIR, 'images_all', 'watch', 'MALAVIKA_WATCH');
const TEMP_DIR = path.join(__dirname, 'temp_webp_malavika');

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
  timeout: 60000,
});

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Specifications and metadata for each folder (1 to 13)
const WATCH_SPECS = {
  1: {
    folder: '1',
    name: 'Richard Mille RM 055 Bubba Watson (Pink Rubber Strap)',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Bubba Watson Edition',
    model: 'RM 055',
    reference: 'RM 055',
    material: 'ATZ ceramic, Grade 5 titanium, white rubber casing and pink rubber strap',
    size: '49.9 × 42.7 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$2,128',
    priceAED: 'AED 7,800',
    movement: 'Manual-winding, skeletonised movement; hours, minutes and seconds; approximately 55-hour power reserve',
    casing: 'Grade 5 titanium case components with protective white rubber casing',
    bezel: 'ATZ ceramic',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Bubba Watson Pink Edition is an avant-garde horological masterpiece inspired by champion golfer Bubba Watson. Engineered for athletic resilience and high impact resistance, it showcases a skeletonised Calibre RMUL2 manual-winding movement, an ultra-hard white ATZ ceramic bezel, protective Grade 5 titanium casing, and a striking pink sports rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 055',
      'Edition / Maker: Bubba Watson Edition',
      'Movement: Manual-winding, skeletonised movement (Calibre RMUL2)',
      'Power Reserve: Approximately 55 hours',
      'Casing Material: Grade 5 titanium case components with protective white rubber casing',
      'Bezel: ATZ ceramic',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM 055',
      'Material Composition: ATZ ceramic, Grade 5 titanium, white rubber casing and pink rubber strap',
      'Diameter Size: 49.9 × 42.7 mm',
      'Engine / Caliber: RMUL2',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 بوبا واتسون (حزام مطاطي وردي)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055',
    materialAr: 'سيراميك ATZ، تيتانيوم الدرجة 5، هيكل مطاطي أبيض وحزام مطاطي وردي',
    movementAr: 'حركة هيكلية بتعبئة يدوية؛ ساعات، دقائق وثوانٍ؛ احتياطي طاقة 55 ساعة تقريباً',
    casingAr: 'مكونات علبة من تيتانيوم الدرجة 5 مع هيكل مطاطي واقٍ أبيض',
    bezelAr: 'سيراميك ATZ',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون الإصدار الوردي تحفة هندسية مستوحاة من بطل الجولف بوبا واتسون، مصممة لتحمل الصدمات العالية بحركة هيكلية RMUL2 وإطار سيراميك ATZ فائق الصلابة وحزام مطاطي وردي جذاب.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 055',
      'الإصدار: بوبا واتسون',
      'الحركة: تعبئة يدوية، حركة هيكلية (عيار RMUL2)',
      'احتياطي الطاقة: حوالي 55 ساعة',
      'مادة الهيكل: تيتانيوم الدرجة 5 مع غلاف مطاطي أبيض',
      'الإطار: سيراميك ATZ',
      'الزجاج / الكريستال: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM 055',
      'تركيبة المواد: سيراميك ATZ، تيتانيوم درجة 5، حزام مطاطي وردي',
      'الأبعاد: 49.9 × 42.7 مم',
      'المحرك / العيار: RMUL2',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  2: {
    folder: '2',
    name: 'Richard Mille RM 055 Bubba Watson White (Blue Flange)',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Bubba Watson Edition',
    model: 'RM 055',
    reference: 'RM 055',
    material: 'Grade 5 Titanium, ATZ Ceramic, White Rubber Strap',
    size: '49.9 × 42.7 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$1,937',
    priceAED: 'AED 7,100',
    movement: 'Manual-winding, skeletonised movement, 55-hour power reserve',
    casing: 'Grade 5 Titanium + White Rubber',
    bezel: 'ATZ Ceramic (with Blue Inner Flange)',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Bubba Watson White features an exquisite blue inner flange, grade 5 titanium case with protective white rubber, and an ultra-hard ATZ ceramic bezel. Powered by the skeletonised Calibre RMUL2 manual-winding movement with a 55-hour power reserve.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 055',
      'Edition / Maker: Bubba Watson White',
      'Movement: Manual-winding, skeletonised (Calibre RMUL2)',
      'Power Reserve: 55 hours',
      'Casing Material: Grade 5 Titanium + White Rubber',
      'Bezel: ATZ Ceramic with blue flange',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM 055',
      'Material Composition: Grade 5 Titanium, ATZ Ceramic, White Rubber Strap',
      'Diameter Size: 49.9 × 42.7 mm',
      'Engine / Caliber: RMUL2',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 بوبا واتسون أبيض (إطار داخلي أزرق)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055',
    materialAr: 'تيتانيوم الدرجة 5، سيراميك ATZ، حزام مطاطي أبيض',
    movementAr: 'تعبئة يدوية، حركة هيكلية، احتياطي طاقة 55 ساعة',
    casingAr: 'تيتانيوم الدرجة 5 ومطاط أبيض',
    bezelAr: 'سيراميك ATZ (مع إطار داخلي أزرق)',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون بإطار سيراميك ATZ وحافة داخلية زرقاء مميزة مع هيكل تيتانيوم مغطى بمطاط أبيض وحركة هيكلية RMUL2.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 055',
      'الإصدار: بوبا واتسون أبيض',
      'الحركة: تعبئة يدوية هيكلية (عيار RMUL2)',
      'احتياطي الطاقة: 55 ساعة',
      'مادة الهيكل: تيتانيوم الدرجة 5 مع مطاط أبيض',
      'الإطار: سيراميك ATZ مع حافة زرقاء',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM 055',
      'الأبعاد: 49.9 × 42.7 مم',
      'المحرك: RMUL2',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  3: {
    folder: '3',
    name: 'Richard Mille RM 055 Bubba Watson Japan Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Japan Limited Edition',
    model: 'RM 055',
    reference: 'RM 055 Bubba Watson',
    material: 'Titanium case, skeletonized grey dial, blue strap',
    size: '42 × 49 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$1,937',
    priceAED: 'AED 7,100',
    movement: 'Manual winding, RMUL2 — 55-hour power reserve, 24 jewels',
    casing: 'Titanium',
    bezel: 'Titanium',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Bubba Watson Japan Edition is an exclusive limited timepiece crafted with a titanium case, skeletonized monochrome dial, and vibrant royal blue strap. Powered by the high-precision RMUL2 caliber with 24 jewels and 55-hour power reserve.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM',
      'Edition / Maker: Bubba Watson Japan Edition',
      'Movement: Manual winding (Calibre RMUL2)',
      'Power Reserve: 55-hour power reserve, 24 jewels',
      'Casing Material: Titanium',
      'Bezel: Titanium',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM 055 Bubba Watson',
      'Material Composition: Titanium case, skeletonized grey dial, blue strap',
      'Diameter Size: 42 × 49 mm',
      'Engine / Caliber: RMUL2',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 بوبا واتسون إصدار اليابان',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055',
    materialAr: 'علبة تيتانيوم، ميناء رمادي هيكلي، حزام أزرق',
    movementAr: 'تعبئة يدوية، عيار RMUL2، احتياطي طاقة 55 ساعة، 24 فصاً',
    casingAr: 'تيتانيوم',
    bezelAr: 'تيتانيوم',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون إصدار اليابان الحصري، بهيكل تيتانيوم متين وميناء هيكلي رمادي وحزام أزرق فاخر.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: بوبا واتسون إصدار اليابان',
      'الحركة: تعبئة يدوية (عيار RMUL2)',
      'مادة الهيكل: تيتانيوم',
      'الإطار: تيتانيوم',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM 055 Bubba Watson',
      'تركيبة المواد: علبة تيتانيوم وحزام أزرق',
      'الأبعاد: 42 × 49 مم',
      'المحرك: RMUL2',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  4: {
    folder: '4',
    name: 'Richard Mille RM 055 Bubba Watson White Ceramic',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Bubba Watson Edition',
    model: 'RM 055',
    reference: 'RM 055',
    material: 'Ceramic, titanium, sapphire crystal, rubber strap',
    size: '49.9 × 42.7 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$1,965',
    priceAED: 'AED 7,200',
    movement: 'Manual-winding, skeletonized mechanical movement; Calibre RMUL2; 55-hour power reserve; 24 jewels',
    casing: 'White ceramic and titanium',
    bezel: 'White ceramic tonneau-shaped bezel',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Bubba Watson White Ceramic highlights pristine white ceramic aesthetics married with a Grade 5 titanium chassis. Calibre RMUL2 provides exceptional skeletonized mechanics and shock absorption.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 055',
      'Edition / Maker: Bubba Watson',
      'Movement: Manual-winding, skeletonized mechanical movement (Calibre RMUL2)',
      'Power Reserve: 55-hour power reserve, 24 jewels',
      'Casing Material: White ceramic and titanium',
      'Bezel: White ceramic tonneau-shaped bezel',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM 055',
      'Material Composition: Ceramic, titanium, sapphire crystal, rubber strap',
      'Diameter Size: 49.9 × 42.7 mm',
      'Engine / Caliber: RMUL2',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 بوبا واتسون سيراميك أبيض',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055',
    materialAr: 'سيراميك، تيتانيوم، زجاج ياقوتي، حزام مطاطي',
    movementAr: 'حركة ميكانيكية هيكلية يدوية التعبئة، عيار RMUL2، احتياطي 55 ساعة',
    casingAr: 'سيراميك أبيض وتيتانيوم',
    bezelAr: 'إطار سيراميك أبيض برميلي الشكل',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون بسيراميك أبيض فائق النقاء وتيتانيوم عالي القوة مع حركة RMUL2 الهيكلية.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'النموذج: RM 055',
      'الإصدار: بوبا واتسون',
      'الحركة: تعبئة يدوية هيكلية عيار RMUL2',
      'مادة العلبة: سيراميك أبيض وتيتانيوم',
      'الإطار: سيراميك أبيض',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM 055',
      'الأبعاد: 49.9 × 42.7 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  5: {
    folder: '5',
    name: 'Richard Mille RM 055 Yas Marina Circuit Limited Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Yas Marina Limited Edition – 50 pcs',
    model: 'RM 055 Yas Marina Circuit',
    reference: 'RM 055',
    material: 'Carbon TPT®, Grade 5 titanium, white rubber',
    size: '49.90 × 42.70 × 13.05 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$2,101',
    priceAED: 'AED 7,700',
    movement: 'Manual-winding, skeletonized, 55h reserve',
    casing: 'Carbon TPT®',
    bezel: 'Carbon TPT®, Yas Blue',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Yas Marina Circuit Limited Edition is an ultra-rare tribute of only 50 pieces paying homage to Abu Dhabi legendary F1 racing circuit. Crafted in Carbon TPT® with striking Yas Blue accents, white rubber strap, and Calibre RMUL2 skeletonized movement.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 055 Yas Marina Circuit',
      'Edition / Maker: Yas Marina Limited Edition – 50 pcs',
      'Movement: Manual-winding, skeletonized, 55h reserve',
      'Casing Material: Carbon TPT®',
      'Bezel: Carbon TPT®, Yas Blue',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM 055',
      'Material Composition: Carbon TPT®, Grade 5 titanium, white rubber',
      'Diameter Size: 49.90 × 42.70 × 13.05 mm',
      'Engine / Caliber: RMUL2',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 حلبة مرسى ياس إصدار محدود',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055 Yas Marina Circuit',
    materialAr: 'كربون TPT®، تيتانيوم الدرجة 5، مطاط أبيض',
    movementAr: 'تعبئة يدوية، هيكلية، احتياطي 55 ساعة',
    casingAr: 'كربون TPT®',
    bezelAr: 'كربون TPT® مع لمسات أزرق ياس',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 إصدار حلبة مرسى ياس المحدود بـ 50 قطعة فقط، مصنوعة من كربون TPT® ولمسات أزرق ياس الأيقونية وحزام مطاطي أبيض.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: حلبة مرسى ياس إصدار محدود - 50 قطعة',
      'الحركة: تعبئة يدوية هيكلية عيار RMUL2',
      'مادة العلبة: كربون TPT®',
      'الإطار: كربون TPT® ولون أزرق ياس',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM 055',
      'الأبعاد: 49.90 × 42.70 × 13.05 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  6: {
    folder: '6',
    name: 'Richard Mille RM 055 Bubba Watson Dark Legend Limited Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Dark Legend Limited Edition',
    model: 'RM 055',
    reference: 'RM 055',
    material: 'Carbon TPT®, Grade 5 titanium movement, rubber strap',
    size: '49.90 × 42.70 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$1,964',
    priceAED: 'AED 7,200',
    movement: 'Manual-winding, skeletonized, 55-hour power reserve',
    casing: 'Carbon TPT®',
    bezel: 'Carbon TPT®',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Bubba Watson Dark Legend Limited Edition embodies an ominous all-black aesthetic crafted entirely in lightweight, high-tensile Carbon TPT®. Features an architectural skeletonised RMUL2 caliber and sporty black rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 055 Bubba Watson',
      'Edition / Maker: Dark Legend Limited Edition',
      'Movement: Manual-winding, skeletonized, 55-hour power reserve',
      'Casing Material: Carbon TPT®',
      'Bezel: Carbon TPT®',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM 055',
      'Material Composition: Carbon TPT®, Grade 5 titanium movement, rubber strap',
      'Diameter Size: 49.90 × 42.70 mm',
      'Engine / Caliber: RMUL2',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 بوبا واتسون دارك ليجند إصدار محدود',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055',
    materialAr: 'كربون TPT®، حركة تيتانيوم الدرجة 5، حزام مطاطي',
    movementAr: 'تعبئة يدوية، حركة هيكلية، احتياطي طاقة 55 ساعة',
    casingAr: 'كربون TPT®',
    bezelAr: 'كربون TPT®',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون دارك ليجند بتصميم أسود بالكامل من كربون TPT® فائق المتانة وحركة RMUL2 الهيكلية.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: دارك ليجند إصدار محدود',
      'الحركة: تعبئة يدوية هيكلية عيار RMUL2',
      'مادة العلبة: كربون TPT®',
      'الإطار: كربون TPT®',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM 055',
      'الأبعاد: 49.90 × 42.70 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  7: {
    folder: '7',
    name: 'Richard Mille RM 35-01 Rafael Nadal',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Rafael Nadal Edition',
    model: 'RM 35-01',
    reference: 'RM35-01',
    material: 'Carbon case, skeletonized dial, mechanical movement',
    size: '42 × 49 mm',
    caliber: 'RMUL3',
    warranty: 'Two Years of Service',
    priceUSD: '$2,101',
    priceAED: 'AED 7,700',
    movement: 'Manual-winding mechanical movement, 55-hour power reserve, 24 jewels, 28,800 vibrations per hour',
    casing: 'Carbon',
    bezel: 'Carbon',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 35-01 Rafael Nadal was developed in close collaboration with the tennis icon. Built to withstand extreme shocks and acceleration on the court, featuring a pure Carbon case and skeletonized Calibre RMUL3 manual movement.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: Rafael Nadal',
      'Edition / Maker: RM 035 Rafael Nadal / Richard Mille',
      'Movement: Manual-winding mechanical movement, 55-hour power reserve, 24 jewels',
      'Casing Material: Carbon',
      'Bezel: Carbon',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM35-01',
      'Material Composition: Carbon case, skeletonized dial, mechanical movement',
      'Diameter Size: 42 × 49 mm',
      'Engine / Caliber: RMUL3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 35-01 رافائيل نادال',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 35-01',
    materialAr: 'علبة كربون، ميناء هيكلي، حركة ميكانيكية',
    movementAr: 'حركة ميكانيكية بتعبئة يدوية، احتياطي طاقة 55 ساعة، 24 فصاً',
    casingAr: 'كربون',
    bezelAr: 'كربون',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 35-01 رافائيل نادال صممت بالتعاون مع أسطورة التنس لتحمل أقوى الصدمات والسرعات بهيكل كربوني وعيار RMUL3 الميكانيكي.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: رافائيل نادال',
      'الحركة: تعبئة يدوية عيار RMUL3 (24 فصاً، 55 ساعة احتياطي)',
      'مادة العلبة: كربون',
      'الإطار: كربون',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM35-01',
      'الأبعاد: 42 × 49 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  8: {
    folder: '8',
    name: 'Richard Mille RM 35-01 Rafael Nadal Ultimate Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'RM 035-01 Ultimate Edition (35 pieces)',
    model: 'RM 35-01',
    reference: 'RM35-01',
    material: 'Carbon TPT, Grade 5 titanium, fabric strap',
    size: '49.94 × 42 mm',
    caliber: 'RMUL3',
    warranty: 'Two Years of Service',
    priceUSD: '$2,210',
    priceAED: 'AED 8,100',
    movement: 'Manual-winding, 55-hour power reserve, 24 jewels',
    casing: 'Carbon TPT',
    bezel: 'Carbon',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 35-01 Rafael Nadal Ultimate Edition is an ultra-exclusive limited series of only 35 pieces worldwide. Features an eye-catching marbled white and black Quartz/Carbon TPT case, comfortable Velcro fabric strap, and the skeletonized RMUL3 movement.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: Rafael Nadal',
      'Edition: RM 035-01 Ultimate Edition (35 pieces)',
      'Movement: Manual-winding, 55-hour power reserve, 24 jewels',
      'Casing Material: Carbon TPT',
      'Bezel: Carbon',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: RM35-01',
      'Material Composition: Carbon TPT, Grade 5 titanium, fabric strap',
      'Diameter Size: 49.94 × 42 mm',
      'Engine / Caliber: RMUL3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 35-01 رافائيل نادال الإصدار النهائي (35 قطعة)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 35-01',
    materialAr: 'كربون TPT، تيتانيوم الدرجة 5، حزام قماشي',
    movementAr: 'تعبئة يدوية، احتياطي طاقة 55 ساعة، 24 فصاً',
    casingAr: 'كربون TPT',
    bezelAr: 'كربون',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 35-01 رافائيل نادال الإصدار النهائي الحصري بـ 35 قطعة حول العالم بهيكل مموج من كربون TPT وحزام قماشي وعيار RMUL3.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: الإصدار النهائي (35 قطعة فقط)',
      'الحركة: تعبئة يدوية عيار RMUL3',
      'مادة العلبة: كربون TPT',
      'الإطار: كربون',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM35-01',
      'الأبعاد: 49.94 × 42 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  9: {
    folder: '9',
    name: 'Richard Mille RM 35-01 Rafael Nadal Carbon TPT',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Rafael Nadal Edition',
    model: 'RM 35-01',
    reference: 'RM 35-01',
    material: 'Carbon TPT® case, Grade 5 titanium movement components with black PVD treatment, black fabric strap with red stitching',
    size: '49.94 × 42.00 × 14.05 mm',
    caliber: 'RMUL3',
    warranty: 'Two Years of Service',
    priceUSD: '$2,101',
    priceAED: 'AED 7,700',
    movement: 'Skeletonised manual-winding movement, 24 jewels, 55-hour power reserve',
    casing: 'Carbon TPT®',
    bezel: 'Carbon TPT®',
    glass: 'Sapphire crystal with anti-reflective treatment on both sides',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 35-01 Rafael Nadal Carbon TPT delivers unparalleled lightness and rigidity. Its Carbon TPT® damascene pattern case surrounds the black PVD-treated Grade 5 titanium skeletonised Calibre RMUL3 movement, paired with a black fabric strap accented with red stitching.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 35-01',
      'Edition / Maker: Rafael Nadal',
      'Movement: Skeletonised manual-winding movement, 24 jewels, 55-hour power reserve',
      'Casing Material: Carbon TPT®',
      'Bezel: Carbon TPT®',
      'Glass / Crystal: Sapphire crystal with anti-reflective treatment on both sides',
      'Reference Number: RM 35-01',
      'Material Composition: Carbon TPT® case, Grade 5 titanium movement components with black PVD treatment, black fabric strap with red stitching',
      'Diameter Size: 49.94 × 42.00 × 14.05 mm',
      'Engine / Caliber: RMUL3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 35-01 رافائيل نادال كربون TPT',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 35-01',
    materialAr: 'علبة كربون TPT®، تيتانيوم درجة 5 مع PVD أسود، حزام قماش مع خياطة حمراء',
    movementAr: 'حركة هيكلية بتعبئة يدوية، 24 فصاً، احتياطي 55 ساعة',
    casingAr: 'كربون TPT®',
    bezelAr: 'كربون TPT®',
    glassAr: 'زجاج ياقوتي معالج ضد الانعكاس على الجانبين',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 35-01 رافائيل نادال بهيكل كربون TPT® فائق المتانة ومكونات تيتانيوم بمعالجة PVD السوداء مع حزام قماشي بخياطة حمراء.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: رافائيل نادال كربون TPT',
      'الحركة: تعبئة يدوية هيكلية عيار RMUL3',
      'مادة العلبة: كربون TPT®',
      'الإطار: كربون TPT®',
      'الزجاج: زجاج ياقوتي معالج ضد الانعكاس',
      'الرقم المرجعي: RM 35-01',
      'الأبعاد: 49.94 × 42.00 × 14.05 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  10: {
    folder: '10',
    name: 'Richard Mille RM 35-02 Rafael Nadal Carbon TPT',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Rafael Nadal Edition',
    model: 'RM 35-02',
    reference: 'RM35-02',
    material: 'Carbon TPT case, rubber strap, titanium clasp',
    size: '49.94 × 44.5 mm',
    caliber: 'RMAL1',
    warranty: 'Two Years of Service',
    priceUSD: '$2,101',
    priceAED: 'AED 7,700',
    movement: 'Automatic skeletonized movement with variable-geometry rotor; approximately 55-hour power reserve',
    casing: 'Carbon TPT',
    bezel: 'Carbon TPT',
    glass: 'Sapphire crystal with anti-reflective treatment',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 35-02 Rafael Nadal Carbon TPT is the premiere model in the Nadal collection equipped with an automatic movement. Featuring the RMAL1 caliber with a variable-geometry rotor, encased in durable Carbon TPT with a sport rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 35-02',
      'Edition / Maker: Rafael Nadal (Rafa)',
      'Movement: Automatic skeletonized movement with variable-geometry rotor; approximately 55-hour power reserve',
      'Casing Material: Carbon TPT',
      'Bezel: Carbon TPT',
      'Glass / Crystal: Sapphire crystal with anti-reflective treatment',
      'Reference Number: RM35-02',
      'Material Composition: Carbon TPT case, rubber strap, titanium clasp',
      'Diameter Size: 49.94 × 44.5 mm',
      'Engine / Caliber: RMAL1 automatic mechanical movement',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 35-02 رافائيل نادال كربون TPT',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 35-02',
    materialAr: 'كربون TPT، حزام مطاطي، قفل تيتانيوم',
    movementAr: 'حركة أوتوماتيكية هيكلية مع دوار متغير الهندسة، احتياطي 55 ساعة',
    casingAr: 'كربون TPT',
    bezelAr: 'كربون TPT',
    glassAr: 'زجاج ياقوتي معالج ضد الانعكاس',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 35-02 رافائيل نادال أوتوماتيك بهيكل كربون TPT وعيار RMAL1 الأوتوماتيكي بدوار متغير الهندسة.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: رافائيل نادال (رافا)',
      'الحركة: أوتوماتيكية هيكلية عيار RMAL1 بدوار متغير الهندسة',
      'مادة العلبة: كربون TPT',
      'الإطار: كربون TPT',
      'الزجاج: زجاج ياقوتي معالج ضد الانعكاس',
      'الرقم المرجعي: RM35-02',
      'الأبعاد: 49.94 × 44.5 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  11: {
    folder: '11',
    name: 'Richard Mille RM 35-02 Rafael Nadal Red Quartz TPT',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Rafael Nadal Edition',
    model: 'RM 35-02',
    reference: 'RM35-02',
    material: 'Red Quartz TPT Composite, Grade 5 Titanium, and Red Rubber Strap',
    size: '50 mm',
    caliber: 'RMAL1',
    warranty: 'Two Years of Service',
    priceUSD: '$2,101',
    priceAED: 'AED 7,700',
    movement: 'Automatic Mechanical Movement, Double-Barrel System',
    casing: 'Red Quartz TPT Carbon Composite',
    bezel: 'Red Quartz TPT',
    glass: 'Sapphire Crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 35-02 Rafael Nadal Red Quartz TPT is a visually striking creation pairing red Quartz TPT composite with white resin layers and a matching red rubber strap. Powered by the skeletonized automatic RMAL1 movement with double-barrel power reserve.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: Rafael Nadal',
      'Edition / Maker: RM 35-02 Rafael Nadal – Red Quartz TPT',
      'Movement: Automatic Mechanical Movement (Calibre RMAL1)',
      'Engine: Double-Barrel System',
      'Casing Material: Red Quartz TPT Carbon Composite',
      'Bezel: Red Quartz TPT',
      'Glass / Crystal: Sapphire Crystal',
      'Reference Number: RM35-02',
      'Material Composition: Red Quartz TPT Composite, Grade 5 Titanium, and Red Rubber Strap',
      'Diameter Size: 50 mm',
      'Engine / Caliber: RMAL1 Automatic Caliber, Double-Barrel System',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 35-02 رافائيل نادال كوارتز TPT أحمر',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 35-02',
    materialAr: 'مركب كوارتز TPT أحمر، تيتانيوم درجة 5، حزام مطاطي أحمر',
    movementAr: 'حركة ميكانيكية أوتوماتيكية، عيار RMAL1 بنظام أسطوانة مزدوجة',
    casingAr: 'مركب كوارتز TPT أحمر وكربون',
    bezelAr: 'كوارتز TPT أحمر',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 35-02 رافائيل نادال بهيكل كوارتز TPT باللون الأحمر الناري وحزام مطاطي أحمر وعيار RMAL1 الأوتوماتيكي الهيكلي.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: رافائيل نادال - كوارتز TPT أحمر',
      'الحركة: أوتوماتيكية ميكانيكية عيار RMAL1',
      'مادة العلبة: مركب كوارتز TPT أحمر',
      'الإطار: كوارتز TPT أحمر',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM35-02',
      'الأبعاد: 50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  12: {
    folder: '12',
    name: 'Richard Mille RM 055 Bubba Watson Asia Limited Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Asia Limited Edition',
    model: 'RM 055',
    reference: 'RM055',
    material: 'Carbon TPT case, ceramic bezel, rubber strap, titanium folding clasp',
    size: '49.9 × 42.7 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$1,965',
    priceAED: 'AED 7,200',
    movement: 'Manual Winding skeletonised movement',
    casing: 'Carbon TPT',
    bezel: 'Ceramic',
    glass: 'Sapphire Crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Bubba Watson Asia Limited Edition combines high-tech Carbon TPT with a polished ceramic bezel and comfortable rubber strap. Features the legendary skeletonized RMUL2 manual-winding movement.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 055',
      'Edition / Maker: Bubba Watson Asia Limited Edition',
      'Movement: Manual Winding (Calibre RMUL2)',
      'Casing Material: Carbon TPT',
      'Bezel: Ceramic',
      'Glass / Crystal: Sapphire Crystal',
      'Reference Number: RM055',
      'Material Composition: Carbon TPT case, ceramic bezel, rubber strap, titanium folding clasp',
      'Diameter Size: 49.9 × 42.7 mm',
      'Engine / Caliber: RMUL2',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 بوبا واتسون إصدار آسيا المحدود',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055',
    materialAr: 'كربون TPT، إطار سيراميك، حزام مطاطي، قفل تيتانيوم',
    movementAr: 'تعبئة يدوية، حركة هيكلية، عيار RMUL2',
    casingAr: 'كربون TPT',
    bezelAr: 'سيراميك',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون إصدار آسيا المحدود بهيكل كربون TPT وإطار سيراميك أنيق وحركة RMUL2 الهيكلية.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: بوبا واتسون إصدار آسيا المحدود',
      'الحركة: تعبئة يدوية هيكلية عيار RMUL2',
      'مادة العلبة: كربون TPT',
      'الإطار: سيراميك',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM055',
      'الأبعاد: 49.9 × 42.7 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  13: {
    folder: '13',
    name: 'Richard Mille RM 055 Bubba Watson White Legend Americas Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'White Legend Americas Edition – 88 pcs',
    model: 'RM 055',
    reference: 'RM055',
    material: 'Carbon case and bezel, white rubber strap, titanium folding clasp',
    size: '42.7 × 50 mm',
    caliber: 'RMUL2',
    warranty: 'Two Years of Service',
    priceUSD: '$2,101',
    priceAED: 'AED 7,700',
    movement: 'Manual-winding skeletonized movement, 55-hour power reserve',
    casing: 'Carbon',
    bezel: 'Carbon',
    glass: 'Sapphire Crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 055 Bubba Watson “White Legend” Americas Limited Edition of 88 pieces is an extraordinary edition crafted in Carbon with a pure white rubber strap and titanium folding clasp. Powered by the RMUL2 skeletonized movement.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 055',
      'Edition / Maker: Bubba Watson “White Legend” — Limited Edition of 88 pieces for the Americas',
      'Movement: Manual Winding (Calibre RMUL2)',
      'Power Reserve: 55-hour power reserve',
      'Casing Material: Carbon',
      'Bezel: Carbon',
      'Glass / Crystal: Sapphire Crystal',
      'Reference Number: RM055',
      'Material Composition: Carbon case and bezel, white rubber strap, titanium folding clasp',
      'Diameter Size: 42.7 × 50 mm',
      'Engine / Caliber: RMUL2 — Manual-winding skeletonized movement, 55-hour power reserve',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 055 بوبا واتسون "الأسطورة البيضاء" إصدار الأمريكتين (88 قطعة)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 055',
    materialAr: 'علبة وإطار من الكربون، حزام مطاطي أبيض، قفل تيتانيوم',
    movementAr: 'حركة هيكلية بتعبئة يدوية، عيار RMUL2، احتياطي 55 ساعة',
    casingAr: 'كربون',
    bezelAr: 'كربون',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 055 بوبا واتسون "وايت ليجند" إصدار الأمريكتين المحدود بـ 88 قطعة، بهيكل كربوني وحزام مطاطي أبيض وعيار RMUL2 الهيكلي.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'الإصدار: وايت ليجند إصدار الأمريكتين (88 قطعة)',
      'الحركة: تعبئة يدوية هيكلية عيار RMUL2',
      'مادة العلبة: كربون',
      'الإطار: كربون',
      'الزجاج: زجاج ياقوتي كريستال',
      'الرقم المرجعي: RM055',
      'الأبعاد: 42.7 × 50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  }
};

async function convertAndUploadWithRetry(filePath, publicId, maxRetries = 3) {
  const webpPath = path.join(TEMP_DIR, `${publicId}.webp`);
  
  // Convert to WebP
  await sharp(filePath)
    .webp({ quality: 90, alphaQuality: 100, lossless: false })
    .toFile(webpPath);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  [Upload attempt ${attempt}/${maxRetries}] ${publicId}...`);
      const res = await cloudinary.uploader.upload(webpPath, {
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
      await new Promise(r => setTimeout(r, 2500));
    }
  }
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 PROCESSING & UPLOADING 13 MALAVIKA WATCHES TO CLOUDINARY & MONGODB');
  console.log('========================================================================');

  // Connect to MongoDB
  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✓ Connected to MongoDB:', mongoose.connection.name);

  // Find starting product ID
  const maxProduct = await Product.findOne().sort({ id: -1 });
  let nextId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 203;
  console.log(`✓ Starting Product ID sequence at: ${nextId}`);

  const results = [];

  for (let folderNum = 1; folderNum <= 13; folderNum++) {
    const spec = WATCH_SPECS[folderNum];
    const folderPath = path.join(SOURCE_DIR, String(folderNum));

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`📁 FOLDER ${folderNum} / 13: ${spec.name}`);
    console.log(`------------------------------------------------------------------------`);

    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(f => /\.(png|jpe?g|webp)$/i.test(f));

    let mainBannerFile = imageFiles.find(f => /main\s*banner/i.test(f));
    if (!mainBannerFile && folderNum === 8) {
      mainBannerFile = imageFiles.find(f => f === 'WhatsApp Image 2026-10-10 at 3.56.56 PM.jpeg');
    }

    if (!mainBannerFile) {
      throw new Error(`Could not identify main banner in folder ${folderNum}`);
    }

    const otherImages = imageFiles.filter(f => f !== mainBannerFile);

    console.log(`  ⭐ Main Banner: "${mainBannerFile}"`);
    console.log(`  🖼️  Gallery Images (${otherImages.length}):`, otherImages);

    // 1. Upload Main Banner
    const folderPad = String(folderNum).padStart(2, '0');
    const mainBannerPublicId = `malavika_watch_${folderPad}_banner`;
    console.log(`\n  Converting and uploading Main Banner to Cloudinary...`);
    const mainBannerUrl = await convertAndUploadWithRetry(
      path.join(folderPath, mainBannerFile),
      mainBannerPublicId
    );
    console.log(`  ✓ Main Banner URL: ${mainBannerUrl}`);

    // 2. Upload Other Gallery Images
    const galleryUrls = [mainBannerUrl];
    for (let i = 0; i < otherImages.length; i++) {
      const imgFile = otherImages[i];
      const imgPublicId = `malavika_watch_${folderPad}_gallery_${i + 1}`;
      console.log(`  Converting and uploading Gallery ${i + 1} ("${imgFile}")...`);
      const imgUrl = await convertAndUploadWithRetry(
        path.join(folderPath, imgFile),
        imgPublicId
      );
      galleryUrls.push(imgUrl);
      console.log(`  ✓ Gallery ${i + 1} URL: ${imgUrl}`);
    }

    // 3. Check if watch already exists or create new
    let existing = await Product.findOne({
      $or: [
        { name: spec.name },
        { 'features': `Folder: ${folderNum} / MALAVIKA_WATCH` }
      ]
    });

    const targetId = existing ? existing.id : nextId++;

    const productPayload = {
      id: targetId,
      name: spec.name,
      brand: spec.brand,
      audience: spec.audience,
      factory: spec.factory,
      model: spec.model,
      reference: spec.reference,
      material: spec.material,
      size: spec.size,
      caliber: spec.caliber,
      warranty: spec.warranty,
      priceUSD: spec.priceUSD,
      priceAED: spec.priceAED,
      url: '',
      image: mainBannerUrl,
      thumbnail: mainBannerUrl,
      images: galleryUrls,
      movement: spec.movement,
      casing: spec.casing,
      bezel: spec.bezel,
      glass: spec.glass,
      waterResistance: spec.waterResistance,
      description: spec.description,
      features: spec.features,
      inStock: true,
      isVisible: true,
      nameAr: spec.nameAr,
      brandAr: spec.brandAr,
      modelAr: spec.modelAr,
      materialAr: spec.materialAr,
      movementAr: spec.movementAr,
      casingAr: spec.casingAr,
      bezelAr: spec.bezelAr,
      glassAr: spec.glassAr,
      waterResistanceAr: spec.waterResistanceAr,
      warrantyAr: spec.warrantyAr,
      descriptionAr: spec.descriptionAr,
      featuresAr: spec.featuresAr,
    };

    const savedProduct = await Product.findOneAndUpdate(
      { id: targetId },
      { $set: productPayload },
      { upsert: true, new: true }
    );

    console.log(`  🎉 SAVED PRODUCT ID ${savedProduct.id} TO MONGODB: ${savedProduct.name}`);
    results.push({
      id: savedProduct.id,
      name: savedProduct.name,
      priceUSD: savedProduct.priceUSD,
      priceAED: savedProduct.priceAED,
      banner: savedProduct.image,
      imageCount: savedProduct.images.length
    });
  }

  // Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {}

  console.log('\n========================================================================');
  console.log('✅ ALL 13 PRODUCTS SUCCESSFULLY UPLOADED AND INSERTED');
  console.log('========================================================================');
  console.table(results);

  await mongoose.connection.close();
  console.log('Database connection closed. Done!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error in main:', err);
  mongoose.connection.close().finally(() => process.exit(1));
});
