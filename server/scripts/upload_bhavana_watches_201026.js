import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import sharp from 'sharp';
import Product from '../models/Product.js';
import CatalogueSettings, { DEFAULT_MASTER_BRANDS } from '../models/CatalogueSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const SOURCE_DIR = path.join(ROOT_DIR, 'images_all', 'watch', 'bhavana_watches201026');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_bhavana_201026');

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGO_URI_ATLAS;
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

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

if (!fs.existsSync(IMAGES_IN_DIR)) {
  fs.mkdirSync(IMAGES_IN_DIR, { recursive: true });
}

// Complete metadata and specifications for all 13 watches
const WATCH_SPECS = {
  1: {
    folder: 'Watch 1',
    name: 'Richard Mille RM 11-03 Flyback Chronograph Rose Gold Titanium',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'RM 11-03',
    reference: 'RM11-03 RG TI',
    material: 'Rose Gold, Titanium, and Rubber',
    size: '49.94 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3 with date and month indicators',
    casing: '18K Rose Gold with grade 5 titanium spline screws',
    bezel: '18K Rose Gold and Titanium',
    glass: 'Sapphire crystal with anti-reflective coating',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 11-03 Flyback Chronograph in Rose Gold and Titanium is an iconic haute horlogerie masterpiece. Engineered with the skeletonised automatic Calibre RMAC3 featuring flyback chronograph functionality, 60-minute countdown timer, oversized date and month display, housed within an ergonomic rose gold and titanium tonneau casing fitted to a high-grade rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Flyback Chronograph Rose Gold Titanium',
      'Reference Number: RM11-03 RG TI',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Rose Gold and Titanium',
      'Bezel: Rose Gold and Titanium',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Rose Gold, Titanium, and Rubber',
      'Diameter Size: 49.94 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 فلايباك كرونوغراف ذهب وردي وتيتانيوم',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'ذهب وردي، تيتانيوم، ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'ذهب وردي عيار 18 قيراط مع تيتانيوم',
    bezelAr: 'ذهب وردي وتيتانيوم',
    glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش والانعكاس',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 11-03 فلايباك كرونوغراف من الذهب الوردي والتيتانيوم تحفة استثنائية في صناعة الساعات الراقية، تجمع بين حركة RMAC3 الهيكلية الأوتوماتيكية وعلبة الذهب الوردي الفاخرة مع حزام مطاطي رياضي.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: فلايباك كرونوغراف ذهب وردي وتيتانيوم',
      'الرقم المرجعي: RM11-03 RG TI',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: ذهب وردي وتيتانيوم',
      'الإطار: ذهب وردي وتيتانيوم',
      'الزجاج: زجاج ياقوتي كريستال',
      'الأبعاد: 49.94 مم',
      'المحرك: RMAC3',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  2: {
    folder: 'Watch 2',
    name: 'Richard Mille RM 11-03 Automatic Flyback Chronograph Rose Gold',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'RM 11-03',
    reference: 'RM11-03 RG',
    material: 'Rose Gold, Rubber, and Titanium',
    size: '44 × 49 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: '18K Rose Gold',
    bezel: '18K Rose Gold',
    glass: 'Sapphire crystal with anti-reflective coating',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 11-03 Automatic Flyback Chronograph in Rose Gold combines aerodynamic aesthetics with peak mechanical prowess. Boasting an open-worked skeleton dial, variable-geometry rotor, flyback chronograph, and durable black rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Automatic Flyback Chronograph Rose Gold Titanium',
      'Reference Number: RM11-03 RG',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Rose Gold',
      'Bezel: Rose Gold',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Rose Gold, Rubber, and Titanium',
      'Diameter Size: 44 × 49 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 فلايباك كرونوغراف أوتوماتيك ذهب وردي',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'ذهب وردي، مطاط، وتيتانيوم',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'ذهب وردي عيار 18 قيراط',
    bezelAr: 'ذهب وردي عيار 18 قيراط',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 11-03 فلايباك كرونوغراف أوتوماتيك بالذهب الوردي عيار 18 قيراط، مزودة بميناء هيكلي مفتوح وعيار RMAC3 الفائق وحزام مطاطي متين.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: فلايباك كرونوغراف أوتوماتيك ذهب وردي',
      'الرقم المرجعي: RM11-03 RG',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: ذهب وردي 18 قيراط',
      'الإطار: ذهب وردي',
      'الزجاج: زجاج ياقوتي كريستال',
      'الأبعاد: 44 × 49 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  3: {
    folder: 'Watch 3',
    name: 'Richard Mille RM 11-03 Automatic Flyback Chronograph Titanium',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'RM 11-03',
    reference: 'RM011-03',
    material: 'Titanium and Rubber',
    size: '44 × 49 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: 'Grade 5 Titanium',
    bezel: 'Grade 5 Titanium',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'Crafted entirely from Grade 5 titanium, the Richard Mille RM 11-03 Automatic Flyback Chronograph offers incredible lightness and impact resistance. Equipped with an architectural skeleton dial, countdown timer, date display, and ergonomic rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: RM 11-03 Automatic Flyback Chronograph',
      'Reference Number: RM011-03',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Titanium',
      'Bezel: Titanium',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Titanium and Rubber',
      'Diameter Size: 44 × 49 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 فلايباك كرونوغراف أوتوماتيك تيتانيوم',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'تيتانيوم ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'تيتانيوم الدرجة 5',
    bezelAr: 'تيتانيوم الدرجة 5',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 11-03 فلايباك كرونوغراف أوتوماتيك بهيكل تيتانيوم الدرجة 5 الخفيف وعالي المقاومة للصدمات، مع ميناء هيكلي مفرغ متقن.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: فلايباك كرونوغراف أوتوماتيك تيتانيوم',
      'الرقم المرجعي: RM011-03',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: تيتانيوم الدرجة 5',
      'الإطار: تيتانيوم الدرجة 5',
      'الزجاج: زجاج ياقوتي كريستال',
      'الأبعاد: 44 × 49 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  4: {
    folder: 'Watch 4',
    name: 'Richard Mille RM 11-03 Le Mans Classic Limited Edition (White Ceramic)',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Le Mans Classic Edition',
    model: 'RM 11-03',
    reference: 'RM11-03 Le Mans Classic',
    material: 'Ceramic and Rubber',
    size: '50 × 44.5 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: 'White Ceramic with British Racing Green accents',
    bezel: 'White Ceramic',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'Dedicated to the world-renowned historic motorsport event, the Richard Mille RM 11-03 Le Mans Classic Limited Edition features a pristine white ceramic case with iconic British racing green and white accents, flyback chronograph, and 24-hour totaliser.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Le Mans Classic Limited Edition',
      'Reference Number: RM11-03 Le Mans Classic',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Ceramic',
      'Bezel: White Ceramic',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Ceramic and Rubber',
      'Diameter Size: 50 × 44.5 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 إصدار لومان كلاسيك المحدود (سيراميك أبيض)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'سيراميك ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'سيراميك أبيض مع تفاصيل خضراء كلاسيكية',
    bezelAr: 'سيراميك أبيض',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'إصدار لومان كلاسيك المحدود من ريتشارد ميل RM 11-03 بسيراميك أبيض فائق النقاء وتفاصيل خضراء بريطانية مميزة لسباقات السيارات التاريخية مع كرونوغراف فلايباك.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: لومان كلاسيك المحدود',
      'الرقم المرجعي: RM11-03 Le Mans Classic',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: سيراميك أبيض',
      'الإطار: سيراميك أبيض',
      'الأبعاد: 50 × 44.5 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  5: {
    folder: 'Watch 5',
    name: 'Richard Mille RM 11-03 Automatic Flyback Chronograph Titanium (Red Accents)',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'RM 11-03',
    reference: 'RM 11-03',
    material: 'Titanium and Rubber',
    size: '44 × 49 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,746',
    priceAED: 'AED 6,400',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: 'Grade 5 Titanium',
    bezel: 'Grade 5 Titanium',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 11-03 Automatic Flyback Chronograph in Titanium with striking red accents features an intricately skeletonised movement, bold racing dial markers, oversized date display at 12 o’clock, and vibrant red rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: RM 11-03 Automatic Flyback Chronograph',
      'Reference Number: RM 11-03',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Titanium',
      'Bezel: Titanium',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Titanium and Rubber',
      'Diameter Size: 44 × 49 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 فلايباك كرونوغراف أوتوماتيك تيتانيوم (لمسات حمراء)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'تيتانيوم ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'تيتانيوم الدرجة 5',
    bezelAr: 'تيتانيوم الدرجة 5',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 11-03 فلايباك كرونوغراف أوتوماتيك من التيتانيوم بلمسات حمراء رياضية ديناميكية وميناء مفرغ بالكامل مع حزام مطاطي أحمر لافت.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: فلايباك كرونوغراف تيتانيوم أحمر',
      'الرقم المرجعي: RM 11-03',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: تيتانيوم الدرجة 5',
      'الأبعاد: 44 × 49 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  6: {
    folder: 'Watch 6',
    name: 'Richard Mille RM 11-03 Ultimate Edition NTPT Carbon & Rose Gold',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Ultimate Edition',
    model: 'RM 11-03',
    reference: 'RM 11-03',
    material: 'Carbon NTPT, Rose Gold, Rubber, and Titanium',
    size: '49.94 × 44.50 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,664',
    priceAED: 'AED 6,100',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: 'Carbon NTPT',
    bezel: '18K Rose Gold',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 11-03 Ultimate Edition merges lightweight Carbon NTPT case architecture with a luxurious 18K Rose Gold bezel. Powered by the skeletonised Calibre RMAC3 automatic movement with flyback chronograph and annual calendar.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Ultimate Edition NTPT',
      'Reference Number: RM 11-03',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Carbon NTPT',
      'Bezel: Rose Gold',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Carbon, Rose Gold, Rubber, and Titanium',
      'Diameter Size: 49.94 × 44.50 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 الإصدار النهائي NTPT كربون وذهب وردي',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'كربون NTPT، ذهب وردي، مطاط، وتيتانيوم',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'كربون NTPT',
    bezelAr: 'ذهب وردي عيار 18 قيراط',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 11-03 الإصدار النهائي تجمع بين تقنية كربون NTPT فائق الخفة والصلابة وإطار فاخر من الذهب الوردي 18 قيراط مع حركة كرونوغراف فلايباك متطورة.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: الإصدار النهائي NTPT',
      'الرقم المرجعي: RM 11-03',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: كربون NTPT وذهب وردي',
      'الإطار: ذهب وردي عيار 18 قيراط',
      'الأبعاد: 49.94 × 44.50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  7: {
    folder: 'Watch 7',
    name: 'Richard Mille RM 11-03 White Gold Diamond Limited Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Diamond Edition',
    model: 'RM 11-03',
    reference: 'RM11-03WhiteGoldDiamond',
    material: 'White Gold, Diamonds, Calfskin Leather, and Rubber',
    size: '50 × 44.5 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,855',
    priceAED: 'AED 6,800',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: '18K White Gold paved with brilliant-cut diamonds',
    bezel: 'Diamond-set White Gold',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'An ultra-rare haute joaillerie interpretation limited to only 4 pieces worldwide. The Richard Mille RM 11-03 White Gold Diamond Limited Edition is meticulously handset with brilliant-cut diamonds across the case and bezel, housing the Calibre RMAC3 flyback chronograph.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: White Gold Diamond Limited Edition (Limited to 4 pieces worldwide)',
      'Reference Number: RM11-03WhiteGoldDiamond',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: White Gold Diamond-set',
      'Bezel: Diamond-set',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: White Gold, Diamonds, Calfskin Leather, and Rubber',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 إصدار الماس والذهب الأبيض المحدود',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'ذهب أبيض، ألماس، جلد عجل، ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'ذهب أبيض عيار 18 قيراط مرصع بالألماس',
    bezelAr: 'إطار مرصع بالألماس',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'إصدار فائق الندرة محدود بـ 4 قطع فقط حول العالم من ريتشارد ميل RM 11-03، مرصعة بالكامل بأجود أحجار الألماس اللامع على هيكل من الذهب الأبيض عيار 18 قيراط.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: إصدار الماس والذهب الأبيض المحدود',
      'الرقم المرجعي: RM11-03WhiteGoldDiamond',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: ذهب أبيض مرصع بالألماس',
      'الإطار: مرصع بالألماس',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  8: {
    folder: 'Watch 8',
    name: 'Richard Mille RM 11-03 Carbon TPT (RM 11-03 FQ)',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'RM 11-03',
    reference: 'RM11-03FQ',
    material: 'Carbon TPT and Titanium',
    size: '49.9 × 44.5 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,664',
    priceAED: 'AED 6,100',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: 'Carbon TPT',
    bezel: 'Carbon TPT',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM 11-03 FQ is crafted entirely from Carbon TPT, featuring a distinctive damascene woodgrain surface produced by hundreds of carbon fiber layers. Driven by the skeleton Calibre RMAC3 automatic flyback chronograph.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: RM 11-03 FQ',
      'Reference Number: RM11-03FQ',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Carbon TPT',
      'Bezel: Carbon TPT',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Carbon TPT and Titanium',
      'Diameter Size: 49.9 × 44.5 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 كربون TPT (RM 11-03 FQ)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'كربون TPT وتيتانيوم',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'كربون TPT',
    bezelAr: 'كربون TPT',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 11-03 FQ مصنوعة بالكامل من كربون TPT بنمط متموج فريد يوفر أعلى درجات المتانة وخفة الوزن مع حركة فلايباك كرونوغراف أوتوماتيكية.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: RM 11-03 FQ كربون TPT',
      'الرقم المرجعي: RM11-03FQ',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: كربون TPT',
      'الإطار: كربون TPT',
      'الأبعاد: 49.9 × 44.5 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  9: {
    folder: 'Watch 9',
    name: 'Richard Mille RM 011 Felipe Massa Flyback Chronograph White Gold',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Felipe Massa Edition',
    model: 'RM 011',
    reference: 'RM011 AH WG',
    material: 'White Gold and Rubber',
    size: '40 × 50 mm',
    caliber: 'RMAC1',
    warranty: 'Two Years of Service',
    priceUSD: '$1,609',
    priceAED: 'AED 5,900',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC1',
    casing: '18K White Gold',
    bezel: '18K White Gold',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'Developed in tribute to legendary Formula 1 driver Felipe Massa, the Richard Mille RM 011 AH WG in 18K White Gold features the high-performance Calibre RMAC1 with flyback chronograph, 60-minute countdown timer, and annual calendar display.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Felipe Massa Flyback Chronograph',
      'Reference Number: RM011 AH WG',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC1)',
      'Casing Material: White Gold',
      'Bezel: White Gold',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: White Gold and Rubber',
      'Diameter Size: 40 × 50 mm',
      'Engine / Caliber: RMAC1',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 011 فيليبي ماسا فلايباك كرونوغراف ذهب أبيض',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 011',
    materialAr: 'ذهب أبيض ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC1',
    casingAr: 'ذهب أبيض عيار 18 قيراط',
    bezelAr: 'ذهب أبيض عيار 18 قيراط',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 011 فيليبي ماسا فلايباك كرونوغراف مصممة تكريماً لسائق الفورمولا 1 فيليبي ماسا، بعلبة من الذهب الأبيض عيار 18 قيراط وعيار RMAC1 عالي الأداء.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: فيليبي ماسا ذهب أبيض',
      'الرقم المرجعي: RM011 AH WG',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC1)',
      'مادة العلبة: ذهب أبيض 18 قيراط',
      'الإطار: ذهب أبيض',
      'الأبعاد: 40 × 50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  10: {
    folder: 'Watch 10',
    name: 'Richard Mille RM 011 Felipe Massa Flyback Chronograph Rose Gold',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Felipe Massa Edition',
    model: 'RM 011',
    reference: 'RM-011-FM',
    material: 'Rose Gold and Rubber',
    size: '40 × 50 mm',
    caliber: 'RMAC1',
    warranty: 'Two Years of Service',
    priceUSD: '$1,609',
    priceAED: 'AED 5,900',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC1',
    casing: '18K Rose Gold',
    bezel: '18K Rose Gold',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'The Richard Mille RM-011-FM Felipe Massa Flyback Chronograph in 18K Rose Gold combines warm precious metals with motorsport-inspired engineering. Features a skeletonised automatic movement, countdown timer, oversized date, and ergonomic rubber strap.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Felipe Massa (FM) Flyback Chronograph',
      'Reference Number: RM-011-FM',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC1)',
      'Casing Material: Rose Gold',
      'Bezel: Rose Gold',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Rose Gold',
      'Diameter Size: 40 × 50 mm',
      'Engine / Caliber: RMAC1',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 011 فيليبي ماسا فلايباك كرونوغراف ذهب وردي',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 011',
    materialAr: 'ذهب وردي ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC1',
    casingAr: 'ذهب وردي عيار 18 قيراط',
    bezelAr: 'ذهب وردي عيار 18 قيراط',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM-011-FM فيليبي ماسا فلايباك كرونوغراف من الذهب الوردي الفاخر عيار 18 قيراط، تجمع بين هندسة سباقات السيارات والحرفية السويسرية الدقيقة.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: فيليبي ماسا ذهب وردي',
      'الرقم المرجعي: RM-011-FM',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC1)',
      'مادة العلبة: ذهب وردي 18 قيراط',
      'الإطار: ذهب وردي',
      'الأبعاد: 40 × 50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  11: {
    folder: 'Watch 11',
    name: 'Richard Mille RM 011 Felipe Massa 18K Rose Gold & Grade 5 Titanium',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Felipe Massa Edition',
    model: 'RM 011',
    reference: 'RM011 Felipe Massa',
    material: '18K Rose Gold, Grade 5 Titanium, and Rubber',
    size: '40 × 50 mm',
    caliber: 'RMAC1',
    warranty: 'Two Years of Service',
    priceUSD: '$1,609',
    priceAED: 'AED 5,900',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC1',
    casing: '18K Rose Gold and Grade 5 Titanium',
    bezel: '18K Rose Gold',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'Featuring a bi-material construction of 18K Rose Gold and Grade 5 Titanium, this Richard Mille RM 011 Felipe Massa edition delivers the perfect balance of luxury and athletic durability, driven by the skeletonised Calibre RMAC1.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Felipe Massa Flyback Chronograph',
      'Reference Number: RM011 Felipe Massa',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC1)',
      'Casing Material: 18K Rose Gold and Grade 5 Titanium',
      'Bezel: Rose Gold',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: 18K Rose Gold, Grade 5 Titanium, and Rubber',
      'Diameter Size: 40 × 50 mm',
      'Engine / Caliber: RMAC1',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 011 فيليبي ماسا ذهب وردي 18 قيراط وتيتانيوم درجة 5',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 011',
    materialAr: 'ذهب وردي 18 قيراط، تيتانيوم درجة 5، ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC1',
    casingAr: 'ذهب وردي عيار 18 قيراط وتيتانيوم درجة 5',
    bezelAr: 'ذهب وردي عيار 18 قيراط',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 011 فيليبي ماسا بتصميم ثنائي المعدن يجمع بين فخامة الذهب الوردي 18 قيراط وصلابة تيتانيوم الدرجة 5 مع عيار RMAC1 الأوتوماتيكي.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: فيليبي ماسا ذهب وردي وتيتانيوم',
      'الرقم المرجعي: RM011 Felipe Massa',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC1)',
      'مادة العلبة: ذهب وردي 18 قيراط وتيتانيوم درجة 5',
      'الإطار: ذهب وردي',
      'الأبعاد: 40 × 50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  12: {
    folder: 'Watch 12',
    name: 'Richard Mille RM 11-03 Jean Todt 50th Anniversary Limited Edition (Blue Quartz TPT)',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'Jean Todt Edition',
    model: 'RM 11-03',
    reference: 'RM 11-03',
    material: 'Blue Quartz TPT®, Carbon, and Titanium',
    size: '49.94 × 44.50 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: 'Blue Quartz TPT® and Carbon TPT',
    bezel: 'Carbon TPT',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'Celebrating 50 years of FIA president Jean Todt’s career in motorsport, this limited edition Richard Mille RM 11-03 is housed in a revolutionary Blue Quartz TPT® and Carbon TPT composite case. Houses the skeletonised Calibre RMAC3 flyback chronograph.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: Jean Todt 50th Anniversary Limited Edition',
      'Reference Number: RM 11-03',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Blue Quartz TPT®',
      'Bezel: Carbon',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Blue Quartz TPT®, Carbon, and Titanium',
      'Diameter Size: 49.94 × 44.50 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 إصدار جان تود الذكرى الخمسين (كوارتز TPT أزرق)',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'كوارتز TPT® أزرق، كربون، وتيتانيوم',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'كوارتز TPT® أزرق',
    bezelAr: 'كربون TPT',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'إصدار الذكرى الخمسين لجان تود من ريتشارد ميل RM 11-03 بعلبة مبتكرة من كوارتز TPT® الأزرق المتموج وإطار كربون، مزودة بحركة فلايباك كرونوغراف هيكلية RMAC3.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: جان تود الذكرى الخمسين',
      'الرقم المرجعي: RM 11-03',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: كوارتز TPT® أزرق',
      'الإطار: كربون',
      'الأبعاد: 49.94 × 44.50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  13: {
    folder: 'Watch 13',
    name: 'Richard Mille RM 11-03 McLaren Automatic Flyback Chronograph Limited Edition',
    brand: 'Richard Mille',
    audience: 'Mens',
    factory: 'McLaren Edition',
    model: 'RM 11-03',
    reference: 'RM11-03 MCL CA-FQ',
    material: 'Carbon TPT, Orange Quartz TPT, and Rubber',
    size: '50 mm',
    caliber: 'RMAC3',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Automatic Flyback Chronograph, Calibre RMAC3',
    casing: 'Carbon TPT interlaced with Orange Quartz TPT',
    bezel: 'Carbon TPT with McLaren aerodynamic styling',
    glass: 'Sapphire crystal',
    waterResistance: '50m waterproof vacuum tested',
    description: 'Created in collaboration with McLaren, the Richard Mille RM 11-03 McLaren Flyback Chronograph is constructed from lightweight Carbon TPT interlaced with iconic McLaren Orange Quartz TPT. Inspired by the aerodynamic design of the McLaren 720S.',
    features: [
      'Brand: Richard Mille',
      'Sub-brand: RM 011',
      'Edition / Maker: McLaren Limited Edition',
      'Reference Number: RM11-03 MCL CA-FQ',
      'Movement: Automatic Flyback Chronograph (Calibre RMAC3)',
      'Casing Material: Carbon TPT interlaced with Orange Quartz TPT',
      'Bezel: Carbon',
      'Glass / Crystal: Sapphire crystal',
      'Material Composition: Carbon TPT, Orange Quartz TPT, and Rubber',
      'Diameter Size: 50 mm',
      'Engine / Caliber: RMAC3',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'ريتشارد ميل RM 11-03 إصدار ماكلارين فلايباك كرونوغراف أوتوماتيك المحدود',
    brandAr: 'ريتشارد ميل',
    modelAr: 'RM 11-03',
    materialAr: 'كربون TPT، كوارتز TPT برتقالي، ومطاط',
    movementAr: 'حركة أوتوماتيكية فلايباك كرونوغراف، عيار RMAC3',
    casingAr: 'كربون TPT متداخل مع كوارتز TPT برتقالي',
    bezelAr: 'كربون TPT',
    glassAr: 'زجاج ياقوتي كريستال',
    waterResistanceAr: 'مقاومة الماء حتى 50 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة ريتشارد ميل RM 11-03 ماكلارين فلايباك كرونوغراف صممت بالتعاون مع ماكلارين، مصنوعة من كربون TPT مع كوارتز TPT البرتقالي الشهير لسيارات ماكلارين الخارقة.',
    featuresAr: [
      'العلامة التجارية: ريتشارد ميل',
      'العلامة الفرعية: RM 011',
      'الإصدار: ماكلارين المحدود',
      'الرقم المرجعي: RM11-03 MCL CA-FQ',
      'الحركة: أوتوماتيك فلايباك كرونوغراف (عيار RMAC3)',
      'مادة العلبة: كربون TPT وكوارتز TPT برتقالي',
      'الإطار: كربون',
      'الأبعاد: 50 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  }
};

async function convertAndUploadWithRetry(filePath, publicId, maxRetries = 3) {
  const webpPath = path.join(TEMP_DIR, `${publicId}.webp`);

  // Convert to high-quality WebP using sharp
  await sharp(filePath)
    .webp({ quality: 90, alphaQuality: 100, lossless: false })
    .toFile(webpPath);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  [Upload attempt ${attempt}/${maxRetries}] Cloudinary: ${publicId}...`);
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
  console.log('🚀 PROCESSING & UPLOADING 13 BHAVANA WATCHES (201026) TO CLOUDINARY & MONGODB');
  console.log('========================================================================');

  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✓ Connected to MongoDB:', mongoose.connection.name);

  // Update master-brands if necessary to include 'RM 011' in Richard Mille models
  try {
    const settings = await CatalogueSettings.findOne({ key: 'master-brands' });
    if (settings && settings.brands) {
      const rmIndex = settings.brands.findIndex(b => b.name && b.name.toLowerCase() === 'richard mille');
      if (rmIndex !== -1) {
        let modified = false;
        if (!settings.brands[rmIndex].models.includes('RM 011')) {
          settings.brands[rmIndex].models.push('RM 011');
          modified = true;
        }
        if (!settings.brands[rmIndex].models.includes('RM 11-03')) {
          settings.brands[rmIndex].models.push('RM 11-03');
          modified = true;
        }
        if (modified) {
          await settings.save();
          console.log('✓ Updated master-brands for Richard Mille (models:', settings.brands[rmIndex].models, ')');
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Could not update CatalogueSettings:', err.message);
  }

  // Clean up any prior records for this batch to ensure all 13 watches receive clean sequential IDs
  await Product.deleteMany({ features: /BHAVANA_WATCHES_201026/ });
  console.log('✓ Reset prior records for BHAVANA_WATCHES_201026');

  // Find next available numeric product ID
  const allProducts = await Product.find({}, { id: 1 }).lean();
  const numericIds = allProducts.map(p => p.id).filter(id => typeof id === 'number');
  let nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 201;
  console.log(`✓ Next Product ID sequence starts at: ${nextId}`);

  const results = [];
  const imagesArchived = [];

  for (let folderNum = 1; folderNum <= 13; folderNum++) {
    const spec = WATCH_SPECS[folderNum];
    const folderPath = path.join(SOURCE_DIR, spec.folder);

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`📁 PROCESSING WATCH ${folderNum} / 13: ${spec.name}`);
    console.log(`   Source Folder: ${folderPath}`);
    console.log(`------------------------------------------------------------------------`);

    if (!fs.existsSync(folderPath)) {
      throw new Error(`Directory not found: ${folderPath}`);
    }

    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(f => /\.(jpe?g|png|webp)$/i.test(f));

    // Identify main banner image
    const mainBannerFile = imageFiles.find(f => /main\s*banner/i.test(f));
    if (!mainBannerFile) {
      throw new Error(`Could not find main banner image in ${folderPath}`);
    }

    // Other gallery images sorted
    const otherImages = imageFiles.filter(f => f !== mainBannerFile).sort();

    console.log(`  ⭐ Main Banner: "${mainBannerFile}"`);
    console.log(`  🖼️  Gallery Images (${otherImages.length}):`, otherImages);

    const folderPad = String(folderNum).padStart(2, '0');

    // 1. Upload Main Banner
    const mainBannerPublicId = `bhavana_watch_201026_${folderPad}_banner`;
    console.log(`  Converting and uploading Main Banner...`);
    const mainBannerUrl = await convertAndUploadWithRetry(
      path.join(folderPath, mainBannerFile),
      mainBannerPublicId
    );
    console.log(`  ✓ Main Banner WebP URL: ${mainBannerUrl}`);

    // Copy to images in directory for archiving
    const bannerExt = path.extname(mainBannerFile);
    const bannerArchiveName = `bhavana_watch_201026_${folderPad}_banner${bannerExt}`;
    const bannerArchivePath = path.join(IMAGES_IN_DIR, bannerArchiveName);
    fs.copyFileSync(path.join(folderPath, mainBannerFile), bannerArchivePath);
    imagesArchived.push(bannerArchiveName);

    // 2. Upload Other Gallery Images
    const galleryUrls = [mainBannerUrl];
    for (let i = 0; i < otherImages.length; i++) {
      const imgFile = otherImages[i];
      const imgPublicId = `bhavana_watch_201026_${folderPad}_gallery_${i + 1}`;
      console.log(`  Converting and uploading Gallery ${i + 1} ("${imgFile}")...`);
      const imgUrl = await convertAndUploadWithRetry(
        path.join(folderPath, imgFile),
        imgPublicId
      );
      galleryUrls.push(imgUrl);
      console.log(`  ✓ Gallery ${i + 1} WebP URL: ${imgUrl}`);

      // Copy to images in directory for archiving
      const imgExt = path.extname(imgFile);
      const galleryArchiveName = `bhavana_watch_201026_${folderPad}_gallery_${i + 1}${imgExt}`;
      fs.copyFileSync(path.join(folderPath, imgFile), path.join(IMAGES_IN_DIR, galleryArchiveName));
      imagesArchived.push(galleryArchiveName);
    }

    // 3. Upsert product into MongoDB
    const trackingTag = `Folder: Watch ${folderNum} / BHAVANA_WATCHES_201026`;
    let existing = await Product.findOne({
      $or: [
        { features: trackingTag },
        { name: spec.name }
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
      features: [...spec.features, trackingTag],
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
      reference: savedProduct.reference,
      priceUSD: savedProduct.priceUSD,
      priceAED: savedProduct.priceAED,
      imageCount: savedProduct.images.length,
      bannerUrl: savedProduct.image
    });
  }

  // Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('\n✓ Cleaned up temp WebP files.');
  } catch {}

  console.log('\n========================================================================');
  console.log(`✅ ALL 13 WATCHES SUCCESSFULLY PROCESSED, CONVERTED TO WEBP, UPLOADED & INSERTED`);
  console.log('========================================================================');
  console.table(results);
  console.log(`✓ Total images archived to "${IMAGES_IN_DIR}": ${imagesArchived.length}`);

  await mongoose.connection.close();
  console.log('Database connection closed. Done!');
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error in main:', err);
  mongoose.connection.close().finally(() => process.exit(1));
});
