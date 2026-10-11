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
const SOURCE_DIR = path.join(ROOT_DIR, 'images_all', 'watch', 'bhavana watches');
const IMAGES_IN_DIR = path.join(ROOT_DIR, 'images in');
const TEMP_DIR = path.join(__dirname, 'temp_webp_bhavana');

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

if (!fs.existsSync(IMAGES_IN_DIR)) {
  fs.mkdirSync(IMAGES_IN_DIR, { recursive: true });
}

// Complete specifications & metadata for all 20 Bhavana watches
const WATCH_SPECS = {
  1: {
    folder: '1',
    name: 'Rolex Day-Date 40 18 ct Everose Gold Slate Dial (228235)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228235',
    material: '18 ct Everose Gold Case + 18 ct Everose Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,692',
    priceAED: 'AED 6,200',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '18 ct Everose Gold',
    bezel: 'Fluted Everose Gold',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228235 in 18 ct Everose Gold features a sophisticated slate dark rhodium dial with faceted Roman numeral hour markers and the iconic President bracelet. Powered by the high-precision Calibre 3255 movement, this timepiece represents the ultimate expression of prestige and horological excellence.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40',
      'Movement: Perpetual, Mechanical, Self-Winding (Rolex Calibre 3255)',
      'Casing Material: 18 ct Everose Gold',
      'Bezel: Fluted Everose Gold',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228235',
      'Material Composition: 18 ct Everose Gold Case + 18 ct Everose Gold President Bracelet',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب إيفروز عيار 18 قيراط ميناء أردوازي (228235)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'علبة وسوار بريزيدنت من ذهب إيفروز عيار 18 قيراط',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة، عيار رولكس 3255',
    casingAr: 'ذهب إيفروز عيار 18 قيراط',
    bezelAr: 'إطار مخدد من ذهب إيفروز عيار 18 قيراط',
    glassAr: 'كريستال ياقوتي مقاوم للخدش مع عدسة سايكلوبس',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تتميز ساعة رولكس داي ديت 40 مرجع 228235 المصنوعة من ذهب إيفروز عيار 18 قيراط بميناء أردوازي داكن أنيق بأرقام رومانية وسوار بريزيدنت الأيقوني، مدعومة بحركة العيار 3255 فائقة الدقة.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'العلامة الفرعية: أويستر بربتشوال داي ديت',
      'الإصدار: داي ديت 40',
      'الحركة: حركة ميكانيكية أوتوماتيكية (عيار 3255)',
      'مادة العلبة: ذهب إيفروز عيار 18 قيراط',
      'الإطار: إطار مخدد ذهب إيفروز',
      'الزجاج: زجاج ياقوتي كريستال مع عدسة تكبير',
      'الرقم المرجعي: 228235',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  2: {
    folder: '2',
    name: 'Rolex Day-Date 40 18 ct Everose Gold Olive Green Dial (228235)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228235',
    material: '18 ct Everose Gold Case + 18 ct Everose Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,692',
    priceAED: 'AED 6,200',
    movement: 'Automatic, Rolex Caliber 3255, 70-hour power reserve',
    casing: '18 ct Everose Gold',
    bezel: 'Fluted Rose Gold',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228235 with the signature 60th Anniversary Olive Green dial. Crafted in warm 18 ct Everose Gold with a fluted bezel and faceted Everose Roman numerals, it is celebrated as one of the most coveted modern Rolex references.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Day-Date',
      'Edition / Maker: Rolex Day-Date 40 Olive Green 60th Anniversary',
      'Movement: Automatic (Rolex Caliber 3255, 70-hour power reserve, 31 jewels, 28,800 A/h)',
      'Casing Material: 18 ct Everose Gold',
      'Bezel: Fluted Rose Gold',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228235',
      'Material Composition: Rose Gold case & President bracelet',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Caliber 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب إيفروز ميناء أخضر زيتوني (228235)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'علبة وسوار بريزيدنت من ذهب إيفروز عيار 18 قيراط',
    movementAr: 'حركة أوتوماتيكية، عيار رولكس 3255، احتياطي طاقة 70 ساعة',
    casingAr: 'ذهب إيفروز عيار 18 قيراط',
    bezelAr: 'إطار مخدد من الذهب الوردي',
    glassAr: 'كريستال ياقوتي مقاوم للخدش مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'إصدار الذكرى السنوية الستين الأيقوني لساعة رولكس داي ديت 40 بالميناء الأخضر الزيتوني الفاخر وأرقام رومانية من ذهب إيفروز عيار 18 قيراط وسوار بريزيدنت الرائع.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 الميناء الأخضر الزيتوني',
      'الحركة: عيار رولكس 3255 مع احتياطي 70 ساعة',
      'مادة العلبة: ذهب إيفروز عيار 18 قيراط',
      'الإطار: إطار مخدد من الذهب الوردي',
      'الرقم المرجعي: 228235',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  3: {
    folder: '3',
    name: 'Rolex Day-Date 40 18 ct White Gold Bright Blue Dial (228239)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228239',
    material: '18 ct White Gold Case + 18 ct White Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,582',
    priceAED: 'AED 5,800',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '18 ct White Gold',
    bezel: 'Fluted White Gold',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228239 in solid 18 ct White Gold features an electrifying bright blue sunray dial complemented by white gold faceted Roman numeral indices and a fluted bezel. Equipped with the legendary Calibre 3255 self-winding movement.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40',
      'Movement: Perpetual, Mechanical, Self-Winding (Automatic)',
      'Casing Material: 18 ct White Gold',
      'Bezel: Fluted White Gold',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228239',
      'Material Composition: 18 ct White Gold Case + 18 ct White Gold President Bracelet',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب أبيض عيار 18 قيراط ميناء أزرق لامع (228239)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'علبة وسوار بريزيدنت من ذهب أبيض عيار 18 قيراط',
    movementAr: 'حركة ميكانيكية ذاتية التعبئة، عيار رولكس 3255',
    casingAr: 'ذهب أبيض عيار 18 قيراط',
    bezelAr: 'إطار مخدد ذهب أبيض',
    glassAr: 'كريستال ياقوتي مقاوم للخدش مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة رولكس داي ديت 40 مرجع 228239 من الذهب الأبيض عيار 18 قيراط مع ميناء أزرق مشرق بتشطيب أشعة الشمس وأرقام رومانية بارزة وسوار بريزيدنت الأنيق.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 ذهب أبيض ميناء أزرق',
      'الحركة: عيار رولكس 3255 الأوتوماتيكي',
      'مادة العلبة: ذهب أبيض عيار 18 قيراط',
      'الرقم المرجعي: 228239',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  4: {
    folder: '4',
    name: 'Rolex Day-Date 40 18 ct White Gold Blue Ombré Diamond Dial (228239)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228239',
    material: '18 ct White Gold Case + 18 ct White Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Automatic, Rolex Calibre 3255',
    casing: '18 ct White Gold',
    bezel: 'Fluted White Gold',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228239 features an exquisite blue ombré dial with a vignette transition from deep midnight blue to rich royal blue, accented with baguette-cut diamond hour markers set in 18 ct white gold settings and a fluted bezel.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Day-Date',
      'Edition / Maker: Day-Date 40 Blue Ombré Diamond',
      'Movement: Automatic (Calibre 3255)',
      'Casing Material: 18 ct White Gold',
      'Bezel: Fluted White Gold',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228239',
      'Material Composition: 18 ct White Gold and Baguette Diamonds',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب أبيض ميناء أزرق متدرج مرصع بالألماس (228239)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'ذهب أبيض عيار 18 قيراط وألماس باغيت',
    movementAr: 'حركة أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'ذهب أبيض عيار 18 قيراط',
    bezelAr: 'إطار مخدد ذهب أبيض',
    glassAr: 'كريستال ياقوتي مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تألق مذهل مع ميناء أزرق أومبريه متدرج مع علامات ساعات من أحجار ألماس الباغيت الفاخرة وعلبة وسوار بريزيدنت من الذهب الأبيض عيار 18 قيراط.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 أزرق أومبريه ألماس',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: ذهب أبيض عيار 18 قيراط',
      'الرقم المرجعي: 228239',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  5: {
    folder: '5',
    name: 'Rolex Day-Date 40 Platinum Ice Blue Dial Fluted Bezel (228236)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228236',
    material: '950 Platinum Case + 950 Platinum President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '950 Platinum',
    bezel: 'Fluted 950 Platinum',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The pinnacle of luxury: the Rolex Day-Date 40 reference 228236 crafted in pure 950 Platinum. Featuring Rolex’s exclusive ice blue dial reserved strictly for platinum models, blue Roman numeral indices, and a fluted platinum bezel on the iconic President bracelet.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40 Platinum Ice Blue',
      'Movement: Perpetual, Mechanical, Self-Winding (Rolex Calibre 3255)',
      'Casing Material: 950 Platinum',
      'Bezel: Fluted Platinum',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228236',
      'Material Composition: 950 Platinum Case + 950 Platinum President Bracelet',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 بلاتين ميناء أزرق جليدي إطار مخدد (228236)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'بلاتين عيار 950 وسوار بريزيدنت بلاتيني',
    movementAr: 'حركة ميكانيكية أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'بلاتين 950 نقي',
    bezelAr: 'إطار مخدد من البلاتين 950',
    glassAr: 'كريستال ياقوتي مقاوم للخدش مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'قمة الفخامة والتميز: رولكس داي ديت 40 من البلاتين النقي 950 مع الميناء الجليدي الأيقوني الحصري لساعات البلاتين وأرقام رومانية زرقاء وإطار مخدد من البلاتين.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 بلاتين ميناء جليدي',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: بلاتين 950',
      'الرقم المرجعي: 228236',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  6: {
    folder: '6',
    name: 'Rolex Day-Date 40 18 ct Yellow Gold Bright Green Dial (228238)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228238',
    material: '18 ct Yellow Gold Case + 18 ct Yellow Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '18 ct Yellow Gold',
    bezel: 'Fluted Yellow Gold',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228238 in radiant 18 ct Yellow Gold features a striking vibrant green lacquer dial with faceted Roman numeral indices. Fitted with the celebrated three-piece President bracelet and driven by the state-of-the-art Calibre 3255 movement.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40 Yellow Gold Green',
      'Movement: Perpetual, Mechanical, Self-Winding (Automatic)',
      'Casing Material: 18 ct Yellow Gold',
      'Bezel: Fluted Yellow Gold',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228238',
      'Material Composition: 18 ct Yellow Gold Case + 18 ct Yellow Gold President Bracelet',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب أصفر عيار 18 قيراط ميناء أخضر مشرق (228238)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'علبة وسوار بريزيدنت من ذهب أصفر عيار 18 قيراط',
    movementAr: 'حركة ميكانيكية أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'ذهب أصفر عيار 18 قيراط',
    bezelAr: 'إطار مخدد ذهب أصفر',
    glassAr: 'كريستال ياقوتي مقاوم للخدش مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'رولكس داي ديت 40 بالذهب الأصفر عيار 18 قيراط مع ميناء أخضر مشرق نابض بالحياة وأرقام رومانية ذهبية، تجمع بين الفخامة الكلاسيكية والجرأة العصرية.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 ذهب أصفر ميناء أخضر',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: ذهب أصفر عيار 18 قيراط',
      'الرقم المرجعي: 228238',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  7: {
    folder: '7',
    name: 'Rolex Day-Date 40 18 ct Everose Gold Sundust Diamond Dial (228235)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228235',
    material: '18 ct Rose Gold Case + 18 ct Rose Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '18 ct Rose Gold',
    bezel: 'Fluted Rose Gold',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228235 in 18 ct Everose Gold boasts a warm sunray Sundust dial accented with sparkling baguette-cut diamond hour markers. Enhanced by a classic fluted bezel and comfortable President bracelet.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40 Sundust Diamond',
      'Movement: Perpetual, Mechanical, Self-Winding (Automatic)',
      'Casing Material: 18 ct Rose Gold',
      'Bezel: Fluted Rose Gold',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228235',
      'Material Composition: 18 ct Rose Gold Case + 18 ct Rose Gold President Bracelet with Baguette Diamonds',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب إيفروز ميناء ساندست مرصع بالألماس (228235)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'ذهب إيفروز عيار 18 قيراط وألماس باغيت',
    movementAr: 'حركة أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'ذهب إيفروز عيار 18 قيراط',
    bezelAr: 'إطار مخدد من الذهب الوردي',
    glassAr: 'كريستال ياقوتي مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تألق دافئ وأنيق بميناء ساندست بلون الشمس المشع مع علامات ساعات مرصعة بألماس الباغيت الفاخر وهيكل وسوار بريزيدنت من ذهب إيفروز عيار 18 قيراط.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 ساندست ألماس',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: ذهب إيفروز عيار 18 قيراط',
      'الرقم المرجعي: 228235',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  8: {
    folder: '8',
    name: 'Rolex Day-Date 40 Platinum Ice Blue Baguette Diamond Bezel (228396TBR)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228396TBR',
    material: '950 Platinum Case + 950 Platinum President Bracelet with Baguette Diamonds',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,609',
    priceAED: 'AED 5,900',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '950 Platinum',
    bezel: 'Baguette Diamond-set Bezel',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'An ultimate masterpiece: Rolex Day-Date 40 reference 228396TBR in 950 Platinum adorned with a bezel set with 40 sparkling baguette-cut diamonds. Complemented by the signature ice blue dial with baguette diamond indices and a solid platinum President bracelet.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40 Baguette Diamond Platinum',
      'Movement: Perpetual, Mechanical, Self-Winding (Automatic)',
      'Casing Material: 950 Platinum',
      'Bezel: Baguette Diamond-set Bezel',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228396TBR',
      'Material Composition: 950 Platinum Case + 950 Platinum Bracelet + Baguette Diamonds',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 بلاتين ميناء جليدي إطار ألماس باغيت (228396TBR)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'بلاتين 950 وإطار مرصع بألماس الباغيت',
    movementAr: 'حركة ميكانيكية أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'بلاتين 950 نقي',
    bezelAr: 'إطار مرصع بأحجار ألماس الباغيت الفاخرة',
    glassAr: 'كريستال ياقوتي مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تحفة استثنائية من البلاتين النقي 950 مع إطار مرصع بـ 40 حجر ألماس باغيت وميناء أزرق جليدي ساحر بعلامات ألماس باغيت وسوار بريزيدنت بلاتيني.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 بلاتين إطار ألماس باغيت',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: بلاتين 950 وألماس',
      'الرقم المرجعي: 228396TBR',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  9: {
    folder: '9',
    name: 'Rolex Day-Date 40 18 ct Everose Gold Chocolate Dial (228235)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228235',
    material: '18 ct Everose Gold Case + 18 ct Everose Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '18 ct Rose Gold',
    bezel: 'Fluted Rose Gold',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228235 in 18 ct Everose Gold showcases a rich chocolate brown sunray dial paired with faceted Rose Gold Roman numerals. Completed with a fluted bezel and the distinguished President bracelet.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40 Chocolate Dial',
      'Movement: Perpetual, Mechanical, Self-Winding (Automatic)',
      'Casing Material: 18 ct Rose Gold',
      'Bezel: Fluted Rose Gold',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228235',
      'Material Composition: 18 ct Rose Gold Case + 18 ct Rose Gold President Bracelet',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب إيفروز ميناء بني شوكولاتة (228235)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'علبة وسوار بريزيدنت من ذهب إيفروز عيار 18 قيراط',
    movementAr: 'حركة أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'ذهب إيفروز عيار 18 قيراط',
    bezelAr: 'إطار مخدد ذهب وردي',
    glassAr: 'كريستال ياقوتي مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تناغم فائق بين دفء ذهب إيفروز وعمق الميناء البني الشوكولاتي المشمس مع أرقام رومانية منحوتة وسوار بريزيدنت الأيقوني من رولكس.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 ميناء شوكولاتة',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: ذهب إيفروز عيار 18 قيراط',
      'الرقم المرجعي: 228235',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  10: {
    folder: '10',
    name: 'Rolex Day-Date 40 18 ct Everose Gold Diamond Bezel Olive Green Dial (228345RBR)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228345RBR',
    material: '18 ct Rose Gold Case + 18 ct Rose Gold President Bracelet with Diamonds',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,691',
    priceAED: 'AED 6,200',
    movement: 'Perpetual, Mechanical, Self-Winding (Automatic)',
    casing: '18 ct Rose Gold',
    bezel: 'Brilliant-Cut Diamond-set Rose Gold Bezel',
    glass: 'Sapphire Crystal with Cyclops lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228345RBR combines an 18 ct Everose Gold case with an exquisite bezel set with brilliant-cut diamonds and the iconic olive green dial with faceted Roman numeral markers. Truly a collector’s dream.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Oyster Perpetual Day-Date',
      'Edition / Maker: Day-Date 40 Diamond Bezel Olive Green',
      'Movement: Perpetual, Mechanical, Self-Winding (Automatic)',
      'Casing Material: 18 ct Rose Gold',
      'Bezel: Diamond-set Rose Gold Bezel',
      'Glass / Crystal: Sapphire Crystal with Cyclops lens',
      'Reference Number: 228345RBR',
      'Material Composition: 18 ct Rose Gold Case + 18 ct Rose Gold Bracelet + Diamonds',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Calibre 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب إيفروز إطار ألماس ميناء أخضر زيتوني (228345RBR)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'ذهب إيفروز عيار 18 قيراط وألماس لامع',
    movementAr: 'حركة أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'ذهب إيفروز عيار 18 قيراط',
    bezelAr: 'إطار مرصع بأحجار ألماس بريليانت اللامعة',
    glassAr: 'كريستال ياقوتي مع عدسة مكبرة',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'مزيج فاخر يخطف الأنظار بين إطار مرصع بالألماس البراق وميناء أخضر زيتوني ساحر وهيكل متكامل من ذهب إيفروز عيار 18 قيراط وسوار بريزيدنت.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 إطار ألماس ميناء زيتوني',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: ذهب إيفروز وألماس',
      'الرقم المرجعي: 228345RBR',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  11: {
    folder: '11',
    name: 'Rolex Day-Date 40 18 ct White Gold Olive Green Dial (228239)',
    brand: 'Rolex',
    audience: 'Mens',
    factory: 'Super Clone Edition',
    model: 'Day-Date 40',
    reference: '228239',
    material: '18-carat White Gold Case + 18-carat White Gold President Bracelet',
    size: '40 mm',
    caliber: 'Rolex Calibre 3255',
    warranty: 'Two Years of Service',
    priceUSD: '$1,664',
    priceAED: 'AED 6,100',
    movement: 'Automatic, Rolex Caliber 3255',
    casing: '18-carat White Gold',
    bezel: '18-carat White Gold Fluted Bezel',
    glass: 'Sapphire Crystal with Cyclops Lens',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The Rolex Day-Date 40 reference 228239 in lustrous 18-carat White Gold pairs the striking 60th Anniversary Olive Green dial with white gold Roman numeral hour markers and a fluted bezel on the President bracelet.',
    features: [
      'Brand: Rolex',
      'Sub-brand: Day-Date',
      'Edition / Maker: Day-Date 40 White Gold Olive Green',
      'Movement: Automatic (Rolex Caliber 3255)',
      'Casing Material: 18-carat White Gold',
      'Bezel: 18-carat White Gold Fluted Bezel',
      'Glass / Crystal: Sapphire Crystal with Cyclops Lens',
      'Reference Number: 228239',
      'Material Composition: 18-carat White Gold',
      'Diameter Size: 40 mm',
      'Engine / Caliber: Rolex Caliber 3255',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'رولكس داي ديت 40 ذهب أبيض ميناء أخضر زيتوني (228239)',
    brandAr: 'رولكس',
    modelAr: 'داي ديت 40',
    materialAr: 'ذهب أبيض عيار 18 قيراط وسوار بريزيدنت',
    movementAr: 'حركة أوتوماتيكية، عيار رولكس 3255',
    casingAr: 'ذهب أبيض عيار 18 قيراط',
    bezelAr: 'إطار مخدد ذهب أبيض عيار 18 قيراط',
    glassAr: 'كريستال ياقوتي مع عدسة مكبرة سايكلوبس',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تناغم فائق بين نقاء الذهب الأبيض عيار 18 قيراط وجاذبية الميناء الأخضر الزيتوني الأيقوني مع أرقام رومانية بيضاء وسوار بريزيدنت الفخم.',
    featuresAr: [
      'العلامة التجارية: رولكس',
      'الإصدار: داي ديت 40 ذهب أبيض ميناء زيتوني',
      'الحركة: عيار رولكس 3255',
      'مادة العلبة: ذهب أبيض عيار 18 قيراط',
      'الرقم المرجعي: 228239',
      'الأبعاد: 40 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  12: {
    folder: '12',
    name: 'Cartier Panthère de Cartier Medium Two-Tone (WGPN0009)',
    brand: 'Cartier',
    audience: 'Ladies',
    factory: '1:1 Super Clone Edition',
    model: 'Panthère de Cartier Medium',
    reference: 'WGPN0009',
    material: '18K Yellow Gold and Stainless Steel Case & Bracelet',
    size: '37 mm (27 mm × 37 mm)',
    caliber: 'Cartier High-Precision Quartz Movement',
    warranty: 'Two Years of Service',
    priceUSD: '$1,077',
    priceAED: 'AED 3,950',
    movement: 'High-Precision Quartz Movement',
    casing: 'Yellow Gold and Stainless Steel',
    bezel: 'Fixed 18K Yellow Gold Bezel',
    glass: 'Scratch-Resistant Sapphire Crystal',
    waterResistance: '30m waterproof vacuum tested',
    description: 'An enduring icon of French elegance: the Panthère de Cartier Medium watch reference WGPN0009. Combining 18K Yellow Gold and high-polish stainless steel, it features a silvered opaline dial, blued-steel sword-shaped hands, and a flexible panther-link bracelet.',
    features: [
      'Brand: Cartier',
      'Sub-brand: Panthère de Cartier',
      'Edition / Maker: Panthère de Cartier Medium Two-Tone',
      'Movement: High-Precision Quartz Movement',
      'Casing Material: Yellow Gold and Stainless Steel',
      'Bezel: Fixed 18K Yellow Gold Bezel',
      'Glass / Crystal: Scratch-Resistant Sapphire Crystal',
      'Reference Number: WGPN0009',
      'Material Composition: 18K Yellow Gold and Stainless Steel',
      'Diameter Size: 37 mm',
      'Engine / Caliber: Cartier Quartz Calibre',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'كارتييه بانتير دو كارتييه متوسطة لونين ذهب وفولاذ (WGPN0009)',
    brandAr: 'كارتييه',
    modelAr: 'بانتير دو كارتييه متوسطة',
    materialAr: 'ذهب أصفر عيار 18 قيراط وفولاذ مقاوم للصدأ',
    movementAr: 'حركة كوارتز فائقة الدقة من كارتييه',
    casingAr: 'ذهب أصفر وفولاذ مصقول',
    bezelAr: 'إطار ثابت من الذهب الأصفر عيار 18 قيراط',
    glassAr: 'كريستال ياقوتي مقاوم للخدش',
    waterResistanceAr: 'مقاومة الماء حتى 30 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'أيقونة الأناقة والأنوثة الخالدة من كارتييه: ساعة بانتير دو كارتييه متوسطة الحجم بمزيج فاخر من الذهب الأصفر والفولاذ وسوار الفهد الانسيابي وميناء فضي أوبالين.',
    featuresAr: [
      'العلامة التجارية: كارتييه',
      'الإصدار: بانتير دو كارتييه متوسطة الحجم',
      'الحركة: كوارتز فائقة الدقة',
      'مادة العلبة: ذهب أصفر وفولاذ',
      'الرقم المرجعي: WGPN0009',
      'الأبعاد: 37 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  13: {
    folder: '13',
    name: 'Cartier Panthère Mini 18K Yellow Gold Diamond Bezel (866919)',
    brand: 'Cartier',
    audience: 'Ladies',
    factory: '1:1 Super Clone Edition',
    model: 'Panthère Mini',
    reference: '866919',
    material: '18K Yellow Gold Case & Bracelet with Brilliant-Cut Diamonds',
    size: '24 × 17 mm',
    caliber: 'Cartier Quartz movement',
    warranty: 'Two Years of Service',
    priceUSD: '$1,077',
    priceAED: 'AED 3,950',
    movement: 'Quartz movement',
    casing: '18K Yellow Gold',
    bezel: 'Brilliant-cut Diamond-set bezel',
    glass: 'Scratch-Resistant Sapphire Crystal',
    waterResistance: '30m waterproof vacuum tested',
    description: 'The delicate and dazzling Cartier Panthère Mini reference 866919 in solid 18K Yellow Gold. Accented by a double-row brilliant-cut diamond bezel, classic Roman numerals, and an octagonal crown set with a blue sapphire cabochon.',
    features: [
      'Brand: Cartier',
      'Sub-brand: Panthère',
      'Edition / Maker: Cartier Panthère Mini Diamond Bezel',
      'Movement: Quartz movement',
      'Casing Material: 18K Yellow Gold',
      'Bezel: Diamond-set bezel',
      'Glass / Crystal: Scratch-Resistant Sapphire Crystal',
      'Reference Number: 866919',
      'Material Composition: 18K Yellow Gold and Diamonds',
      'Diameter Size: 24 × 17 mm',
      'Engine / Caliber: Quartz movement',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'كارتييه بانتير ميني ذهب أصفر عيار 18 قيراط إطار ألماس (866919)',
    brandAr: 'كارتييه',
    modelAr: 'بانتير ميني',
    materialAr: 'ذهب أصفر عيار 18 قيراط وألماس بريليانت',
    movementAr: 'حركة كوارتز كارتييه السويسرية',
    casingAr: 'ذهب أصفر عيار 18 قيراط',
    bezelAr: 'إطار مرصع بأحجار الألماس اللامعة',
    glassAr: 'كريستال ياقوتي مقاوم للخدش',
    waterResistanceAr: 'مقاومة الماء حتى 30 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'قطعة مجوهرات ساحرة تنبض برقي كارتييه: ساعة بانتير ميني من الذهب الأصفر عيار 18 قيراط مع إطار مرصع ببريق الألماس وسوار الفهد الأسطوري.',
    featuresAr: [
      'العلامة التجارية: كارتييه',
      'الإصدار: بانتير ميني ذهب أصفر وألماس',
      'الحركة: حركة كوارتز',
      'مادة العلبة: ذهب أصفر عيار 18 قيراط وألماس',
      'الرقم المرجعي: 866919',
      'الأبعاد: 24 × 17 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  14: {
    folder: '14',
    name: 'Cartier Panthère Small Model 18K Rose Gold Diamond Bezel (WJPN0049)',
    brand: 'Cartier',
    audience: 'Ladies',
    factory: '1:1 Super Clone Edition',
    model: 'Panthère Small Model',
    reference: 'WJPN0049',
    material: '18K Rose Gold and Brilliant-Cut Diamonds',
    size: '22 mm (22 mm × 30 mm)',
    caliber: 'Cartier Quartz movement',
    warranty: 'Two Years of Service',
    priceUSD: '$1,077',
    priceAED: 'AED 3,950',
    movement: 'Quartz movement',
    casing: '18K Rose Gold',
    bezel: 'Gem-set diamond bezel',
    glass: 'Sapphire crystal',
    waterResistance: '30m waterproof vacuum tested',
    description: 'The breathtaking Cartier Panthère Small Model reference WJPN0049 in solid 18K Rose Gold. Features a brilliant-cut diamond bezel, silvered opaline dial, blued steel sword hands, and an 18K rose gold bracelet that doubles as fine jewelry.',
    features: [
      'Brand: Cartier',
      'Sub-brand: Panthère',
      'Edition / Maker: Cartier Panthère Small Model Rose Gold Diamond',
      'Category: Ladies Watch',
      'Movement: Quartz movement',
      'Casing Material: Rose Gold',
      'Bezel: Gem-set diamond bezel',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: WJPN0049',
      'Material Composition: Rose Gold and Diamonds',
      'Diameter Size: 22 mm',
      'Engine / Caliber: Quartz movement',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'كارتييه بانتير الحجم الصغير ذهب وردي إطار ألماس (WJPN0049)',
    brandAr: 'كارتييه',
    modelAr: 'بانتير الحجم الصغير',
    materialAr: 'ذهب وردي عيار 18 قيراط وألماس لامع',
    movementAr: 'حركة كوارتز فائقة الدقة',
    casingAr: 'ذهب وردي عيار 18 قيراط',
    bezelAr: 'إطار مرصع بصفين من الألماس اللامع',
    glassAr: 'كريستال ياقوتي مقاوم للخدش',
    waterResistanceAr: 'مقاومة الماء حتى 30 متراً باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة نسائية راقية تجسد قمة الأنوثة من كارتييه: بانتير الحجم الصغير من الذهب الوردي وإطار مرصع بالألماس البراق وسوار مرن يلتف بنعومة حول المعصم.',
    featuresAr: [
      'العلامة التجارية: كارتييه',
      'الفئة: ساعات نسائية',
      'الإصدار: بانتير الحجم الصغير ذهب وردي وألماس',
      'الحركة: حركة كوارتز',
      'مادة العلبة: ذهب وردي وألماس',
      'الرقم المرجعي: WJPN0049',
      'الأبعاد: 22 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  15: {
    folder: '15',
    name: 'Cartier Santos de Cartier Skeleton Black ADLC (WHSA0009)',
    brand: 'Cartier',
    audience: 'Mens',
    factory: '1:1 Super Clone Edition',
    model: 'Santos Skeleton',
    reference: 'WHSA0009',
    material: 'Stainless Steel with Black ADLC Coating and Alligator Leather Strap',
    size: '39.8 mm',
    caliber: 'Cartier Manual-winding Calibre 9612 MC',
    warranty: 'Two Years of Service',
    priceUSD: '$1,336',
    priceAED: 'AED 4,900',
    movement: 'Manual Winding Skeleton Movement (approx. 72h power reserve)',
    casing: 'Stainless Steel with Black ADLC Coating',
    bezel: 'Black ADLC Stainless Steel Bezel',
    glass: 'Sapphire crystal front and caseback',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The avant-garde Cartier Santos Skeleton Black ADLC reference WHSA0009. Featuring a black ADLC-coated stainless steel case and Cartier’s signature skeleton bridges sculptured into bold Roman numerals. Powered by the manufacture manual-winding Calibre 9612 MC.',
    features: [
      'Brand: Cartier',
      'Sub-brand: Santos de Cartier',
      'Edition / Maker: Cartier Santos Skeleton Black ADLC',
      'Movement: Manual Winding Skeleton Movement',
      'Casing Material: Stainless Steel with Black ADLC Coating',
      'Bezel: Black ADLC Steel Bezel',
      'Glass / Crystal: Sapphire crystal front and caseback',
      'Reference Number: WHSA0009',
      'Material Composition: Stainless Steel ADLC and Alligator Skin',
      'Diameter Size: 39.8 mm',
      'Engine / Caliber: Manual-winding movement (Calibre 9612 MC)',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'كارتييه سانتوس دو كارتييه سكيليتون هيكلية أسود ADLC (WHSA0009)',
    brandAr: 'كارتييه',
    modelAr: 'سانتوس سكيليتون',
    materialAr: 'فولاذ مطلي بـ ADLC الأسود وجلد تمساح',
    movementAr: 'حركة تعبئة يدوية هيكلية، عيار 9612 MC، احتياطي 72 ساعة',
    casingAr: 'فولاذ مقاوم للصدأ مع طلاء ADLC أسود غير لامع',
    bezelAr: 'إطار فولاذي أسود ADLC',
    glassAr: 'كريستال ياقوتي مزدوج أمامي وخلفي',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تصميم ثوري يجمع بين الطابع الرياضي العصري والهندسة الميكانيكية الراقية: ساعة كارتييه سانتوس الهيكلية بطلاء ADLC الأسود وجسور الحركة المصممة كأرقام رومانية بارزة.',
    featuresAr: [
      'العلامة التجارية: كارتييه',
      'الإصدار: سانتوس سكيليتون أسود ADLC',
      'الحركة: تعبئة يدوية هيكلية (عيار 9612 MC)',
      'مادة العلبة: فولاذ ADLC أسود',
      'الرقم المرجعي: WHSA0009',
      'الأبعاد: 39.8 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  16: {
    folder: '16',
    name: 'Cartier Santos de Cartier Large Green Dial (WSSA0062)',
    brand: 'Cartier',
    audience: 'Mens',
    factory: '1:1 Super Clone Edition',
    model: 'Santos de Cartier Large',
    reference: 'WSSA0062',
    material: 'Stainless Steel Case & Bracelet with Green Alligator Strap',
    size: '39.8 × 47.5 mm',
    caliber: 'Cartier In-House Calibre 1847 MC',
    warranty: 'Two Years of Service',
    priceUSD: '$1,064',
    priceAED: 'AED 3,900',
    movement: 'Automatic Self-Winding Movement',
    casing: 'Stainless Steel',
    bezel: 'Polished Stainless Steel Bezel',
    glass: 'Sapphire crystal with anti-reflective coating',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The striking Cartier Santos Large Model reference WSSA0062 features a deep emerald gradient green sunray dial, luminescent rhodium-finish hands, and QuickSwitch interchangeable bracelet system. Driven by Cartier’s in-house Calibre 1847 MC automatic movement.',
    features: [
      'Brand: Cartier',
      'Sub-brand: Santos de Cartier',
      'Edition / Maker: Cartier Santos Large Green Dial',
      'Movement: Automatic (Cartier 1847 MC)',
      'Casing Material: Stainless Steel',
      'Bezel: Stainless Steel',
      'Glass / Crystal: Sapphire crystal',
      'Reference Number: WSSA0062',
      'Material Composition: Stainless Steel and Green Alligator Skin',
      'Diameter Size: 39.8 × 47.5 mm',
      'Engine / Caliber: Cartier 1847 MC',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'كارتييه سانتوس دو كارتييه الحجم الكبير ميناء أخضر (WSSA0062)',
    brandAr: 'كارتييه',
    modelAr: 'سانتوس الحجم الكبير',
    materialAr: 'فولاذ مقاوم للصدأ وحزام جلد تمساح أخضر',
    movementAr: 'حركة أوتوماتيكية ذاتية التعبئة، عيار كارتييه 1847 MC',
    casingAr: 'فولاذ مقاوم للصدأ مصقول',
    bezelAr: 'إطار فولاذي مصقول ببراغي كارتييه',
    glassAr: 'كريستال ياقوتي مقاوم للخدش',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'إصدار استثنائي ومحبوب للغاية من كارتييه سانتوس الحجم الكبير بميناء أخضر زمردي متدرج وأرقام رومانية مضيئة ونظام تبديل الأحزمة السريع QuickSwitch.',
    featuresAr: [
      'العلامة التجارية: كارتييه',
      'الإصدار: سانتوس الحجم الكبير ميناء أخضر زمردي',
      'الحركة: عيار كارتييه 1847 MC الأوتوماتيكي',
      'مادة العلبة: فولاذ مقاوم للصدأ',
      'الرقم المرجعي: WSSA0062',
      'الأبعاد: 39.8 × 47.5 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  17: {
    folder: '17',
    name: 'Cartier Santos de Cartier Large Blue Dial (WSSA0030)',
    brand: 'Cartier',
    audience: 'Mens',
    factory: '1:1 Super Clone Edition',
    model: 'Santos de Cartier Large',
    reference: 'WSSA0030',
    material: 'Stainless Steel Case & SmartLink Bracelet',
    size: '39.8 × 47.5 mm',
    caliber: 'Cartier Automatic Calibre 1847 MC',
    warranty: 'Two Years of Service',
    priceUSD: '$1,064',
    priceAED: 'AED 3,900',
    movement: 'Automatic movement',
    casing: 'Stainless Steel',
    bezel: 'Polished Stainless Steel Bezel',
    glass: 'Scratch-resistant Sapphire crystal',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The contemporary classic Cartier Santos Large Model reference WSSA0030 features an intense midnight blue gradient dial with mirrored Roman numerals and luminescent sword hands. Equipped with the QuickSwitch and SmartLink adjustment systems.',
    features: [
      'Brand: Cartier',
      'Sub-brand: Santos de Cartier',
      'Edition / Maker: Cartier Santos Large Blue Dial',
      'Movement: Automatic movement (Cartier 1847 MC)',
      'Casing Material: Stainless Steel',
      'Bezel: Stainless Steel',
      'Glass / Crystal: Scratch-resistant Sapphire crystal',
      'Reference Number: WSSA0030',
      'Material Composition: Stainless Steel Case & Bracelet',
      'Diameter Size: 39.8 × 47.5 mm',
      'Engine / Caliber: Automatic movement',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'كارتييه سانتوس دو كارتييه الحجم الكبير ميناء أزرق (WSSA0030)',
    brandAr: 'كارتييه',
    modelAr: 'سانتوس الحجم الكبير',
    materialAr: 'فولاذ مقاوم للصدأ مع سوار سمارت لينك',
    movementAr: 'حركة أوتوماتيكية، عيار كارتييه 1847 MC',
    casingAr: 'فولاذ مقاوم للصدأ مصقول وساتان',
    bezelAr: 'إطار فولاذي كلاسيكي مع براغي',
    glassAr: 'كريستال ياقوتي مقاوم للخدش',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ساعة كارتييه سانتوس الحجم الكبير بميناء أزرق ملكي متدرج غاية في الروعة، مع أرقام رومانية عاكسة للضوء وحركة ميكانيكية أوتوماتيكية عالية الاعتمادية.',
    featuresAr: [
      'العلامة التجارية: كارتييه',
      'الإصدار: سانتوس الحجم الكبير ميناء أزرق',
      'الحركة: عيار أوتوماتيكي كارتييه 1847 MC',
      'مادة العلبة: فولاذ مقاوم للصدأ',
      'الرقم المرجعي: WSSA0030',
      'الأبعاد: 39.8 × 47.5 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  18: {
    folder: '18',
    name: 'Cartier Santos de Cartier Skeleton Stainless Steel (WHSA0015)',
    brand: 'Cartier',
    audience: 'Mens',
    factory: '1:1 Super Clone Edition',
    model: 'Santos Skeleton',
    reference: 'WHSA0015',
    material: 'Stainless Steel Case & Bracelet with Additional Alligator Strap',
    size: '39.8 mm',
    caliber: 'Cartier In-House Calibre 9611 MC',
    warranty: 'Two Years of Service',
    priceUSD: '$1,336',
    priceAED: 'AED 4,900',
    movement: 'Manual Winding Skeleton (approx. 72h power reserve)',
    casing: 'Stainless Steel',
    bezel: 'Stainless Steel',
    glass: 'Sapphire crystal front and exhibition caseback',
    waterResistance: '100m waterproof vacuum tested',
    description: 'A pure horological sculpture: the Cartier Santos Skeleton reference WHSA0015 in gleaming stainless steel. Its manufacture manual-wind Calibre 9611 MC features mainplate bridges shaped into iconic Roman numerals, offering total transparency through front and back sapphire crystals.',
    features: [
      'Brand: Cartier',
      'Sub-brand: Santos de Cartier',
      'Edition / Maker: Cartier Santos Skeleton Steel',
      'Movement: Manual Winding (approx. 72h power reserve)',
      'Casing Material: Stainless Steel',
      'Bezel: Stainless Steel',
      'Glass / Crystal: Sapphire crystal front and exhibition caseback',
      'Reference Number: WHSA0015',
      'Material Composition: Stainless Steel',
      'Diameter Size: 39.8 mm',
      'Engine / Caliber: Cartier 9611 MC',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'كارتييه سانتوس دو كارتييه سكيليتون هيكلية فولاذ (WHSA0015)',
    brandAr: 'كارتييه',
    modelAr: 'سانتوس سكيليتون',
    materialAr: 'فولاذ مقاوم للصدأ بالكامل',
    movementAr: 'حركة تعبئة يدوية هيكلية، عيار 9611 MC، احتياطي 72 ساعة',
    casingAr: 'فولاذ مقاوم للصدأ مصقول',
    bezelAr: 'إطار فولاذي مصقول',
    glassAr: 'كريستال ياقوتي مزدوج شفاف بالكامل',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'تحفة ميكانيكية مكشوفة تعكس براعة دار كارتييه: ساعة سانتوس سكيليتون الهيكلية من الفولاذ مع حركة Calibre 9611 MC التي تشكل جسورها الأرقام الرومانية الشهيرة.',
    featuresAr: [
      'العلامة التجارية: كارتييه',
      'الإصدار: سانتوس سكيليتون فولاذ شفاف',
      'الحركة: تعبئة يدوية هيكلية عيار 9611 MC',
      'مادة العلبة: فولاذ مقاوم للصدأ',
      'الرقم المرجعي: WHSA0015',
      'الأبعاد: 39.8 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  19: {
    folder: '19',
    name: 'Hublot Big Bang Unico Red Magic Ceramic 45 mm (411.CF.8513.RX)',
    brand: 'Hublot',
    audience: 'Mens',
    factory: '1:1 Super Clone Edition',
    model: 'Big Bang Unico',
    reference: '411.CF.8513.RX',
    material: 'Polished Red Ceramic and Black & Red Lined Rubber Strap',
    size: '45 mm',
    caliber: 'Hublot In-House HUB1242 UNICO Flyback Chronograph',
    warranty: 'Two Years of Service',
    priceUSD: '$1,173',
    priceAED: 'AED 4,300',
    movement: 'Automatic Flyback Chronograph with Column Wheel',
    casing: 'Polished Red Ceramic',
    bezel: 'Polished Red Ceramic with 6 H-shaped Black PVD Titanium Screws',
    glass: 'Sapphire crystal with anti-reflective treatment',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The explosive Hublot Big Bang Unico Red Magic reference 411.CF.8513.RX. Crafted from Hublot’s patented vibrant red high-tech ceramic with a matte red skeleton dial showcasing the column wheel of the in-house UNICO HUB1242 flyback chronograph movement.',
    features: [
      'Brand: Hublot',
      'Sub-brand: Big Bang',
      'Edition / Maker: Hublot Big Bang Unico Red Magic Ceramic',
      'Movement: Automatic Flyback Chronograph (Hublot HUB1242)',
      'Casing Material: Polished Red Ceramic',
      'Bezel: Polished Red Ceramic with 6 H-shaped Titanium Screws',
      'Glass / Crystal: Sapphire crystal with anti-reflective treatment',
      'Reference Number: 411.CF.8513.RX',
      'Material Composition: Ceramic and Rubber',
      'Diameter Size: 45 mm',
      'Engine / Caliber: Hublot HUB1242',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'هوبلو بيج بانج يونيكو ريد ماجيك سيراميك أحمر 45 مم (411.CF.8513.RX)',
    brandAr: 'هوبلو',
    modelAr: 'بيج بانج يونيكو',
    materialAr: 'سيراميك أحمر فائق التطور ومطاط مبطن',
    movementAr: 'حركة كرونوغراف فلايباك أوتوماتيكية، عيار HUB1242 يونيكو',
    casingAr: 'سيراميك أحمر لامع عالي الصلابة',
    bezelAr: 'إطار سيراميك أحمر مع 6 براغي تيتانيوم على شكل H',
    glassAr: 'كريستال ياقوتي معالَج ضد الانعكاس',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'ابتكار استثنائي يجمع بين قوة السيراميك الأحمر الحاصل على براءة اختراع وميناء هيكلي مكشوف يبرز حركة الكرونوغراف فلايباك المصنعة في ورش هوبلو.',
    featuresAr: [
      'العلامة التجارية: هوبلو',
      'الإصدار: بيج بانج يونيكو ريد ماجيك',
      'الحركة: كرونوغراف فلايباك عيار HUB1242 يونيكو',
      'مادة العلبة: سيراميك أحمر ومطاط',
      'الرقم المرجعي: 411.CF.8513.RX',
      'الأبعاد: 45 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  },
  20: {
    folder: '20',
    name: 'Hublot Big Bang Unico King Gold Ceramic 45 mm (411.OM.1180.RX)',
    brand: 'Hublot',
    audience: 'Mens',
    factory: '1:1 Super Clone Edition',
    model: 'Big Bang Unico King Gold',
    reference: '411.OM.1180.RX',
    material: 'Satin-finished & Polished 18K King Gold (Rose Gold) and Black Structured Rubber',
    size: '45 mm',
    caliber: 'Hublot In-House UNICO Automatic Chronograph',
    warranty: 'Two Years of Service',
    priceUSD: '$1,200',
    priceAED: 'AED 4,400',
    movement: 'Automatic Flyback Chronograph with Column Wheel',
    casing: '18K King Gold (Rose Gold)',
    bezel: 'Satin-finished and Polished Black Ceramic with 6 H-shaped Titanium Screws',
    glass: 'Sapphire Crystal with Anti-reflective Treatment',
    waterResistance: '100m waterproof vacuum tested',
    description: 'The commanding Hublot Big Bang Unico King Gold Ceramic reference 411.OM.1180.RX. Combining Hublot’s exclusive 18K King Gold (a warmer, platinum-infused rose gold alloy) with a scratch-resistant black ceramic bezel and a skeletonized matte black dial.',
    features: [
      'Brand: Hublot',
      'Sub-brand: Big Bang',
      'Edition / Maker: Hublot Big Bang Unico King Gold Ceramic',
      'Movement: Automatic Flyback Chronograph',
      'Casing Material: 18K King Gold (Rose Gold)',
      'Bezel: Satin-finished & Polished Black Ceramic',
      'Glass / Crystal: Sapphire Crystal with Anti-reflective Treatment',
      'Reference Number: 411.OM.1180.RX',
      'Material Composition: King Gold (Rose Gold), Ceramic, and Rubber',
      'Diameter Size: 45 mm',
      'Engine / Caliber: Hublot In-House UNICO Automatic Chronograph',
      'Shipping: Free Shipping',
      'Warranty: Two Years of Service'
    ],
    nameAr: 'هوبلو بيج بانج يونيكو كينج جولد وسيراميك 45 مم (411.OM.1180.RX)',
    brandAr: 'هوبلو',
    modelAr: 'بيج بانج يونيكو كينج جولد',
    materialAr: 'ذهب كينج جولد عيار 18 وسيراميك أسود ومطاط',
    movementAr: 'حركة كرونوغراف فلايباك أوتوماتيكية يونيكو',
    casingAr: 'ذهب كينج جولد عيار 18 قيراط ساتان ومصقول',
    bezelAr: 'سيراميك أسود غير لامع مع براغي تيتانيوم على شكل H',
    glassAr: 'كريستال ياقوتي مضاد للانعكاس',
    waterResistanceAr: 'مقاومة الماء حتى 100 متر باختبار التفريغ',
    warrantyAr: 'ضمان خدمة لمدة عامين',
    descriptionAr: 'مزيج هوبلو الأسطوري بين دفء ذهب الكينج جولد عيار 18 قيراط وصلابة السيراميك الأسود، مع ميناء هيكلي يبرز آلية الكرونوغراف المتطورة وحزام مطاطي رياضي.',
    featuresAr: [
      'العلامة التجارية: هوبلو',
      'الإصدار: بيج بانج يونيكو كينج جولد وسيراميك',
      'الحركة: عيار يونيكو الأوتوماتيكي',
      'مادة العلبة: ذهب كينج جولد عيار 18 قيراط وسيراميك',
      'الرقم المرجعي: 411.OM.1180.RX',
      'الأبعاد: 45 مم',
      'الشحن: شحن مجاني',
      'الضمان: ضمان خدمة لمدة عامين'
    ]
  }
};

async function convertAndUploadWithRetry(filePath, publicId, maxRetries = 3) {
  const webpPath = path.join(TEMP_DIR, `${publicId}.webp`);

  // Convert to WebP using sharp
  await sharp(filePath)
    .webp({ quality: 90, alphaQuality: 100, lossless: false })
    .toFile(webpPath);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`  [Upload attempt ${attempt}/${maxRetries}] Cloudinary publicId: ${publicId}...`);
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

function sanitizeFileName(str) {
  return str.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function main() {
  console.log('========================================================================');
  console.log('🚀 PROCESSING & UPLOADING 20 BHAVANA WATCHES TO CLOUDINARY & MONGODB');
  console.log('========================================================================');

  // Connect to MongoDB
  console.log('\nConnecting to MongoDB...');
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✓ Connected to MongoDB:', mongoose.connection.name);

  // Find starting product ID
  const maxProduct = await Product.findOne().sort({ id: -1 });
  let nextId = maxProduct && typeof maxProduct.id === 'number' ? maxProduct.id + 1 : 216;
  console.log(`✓ Starting Product ID sequence at: ${nextId}`);

  const results = [];
  const imagesToMove = []; // Record of source -> destination for moving images after completion

  for (let folderNum = 1; folderNum <= 20; folderNum++) {
    const spec = WATCH_SPECS[folderNum];
    const folderPath = path.join(SOURCE_DIR, String(folderNum));

    console.log(`\n------------------------------------------------------------------------`);
    console.log(`📁 FOLDER ${folderNum} / 20: ${spec.name}`);
    console.log(`------------------------------------------------------------------------`);

    const files = fs.readdirSync(folderPath);
    const imageFiles = files.filter(f => /\.(png|jpe?g|webp)$/i.test(f));

    let mainBannerFile = imageFiles.find(f => /main\s*banner/i.test(f));
    if (!mainBannerFile) {
      throw new Error(`Could not identify main banner in folder ${folderNum}`);
    }

    const otherImages = imageFiles.filter(f => f !== mainBannerFile);

    console.log(`  ⭐ Main Banner: "${mainBannerFile}"`);
    console.log(`  🖼️  Gallery Images (${otherImages.length}):`, otherImages);

    const folderPad = String(folderNum).padStart(2, '0');

    // 1. Convert & Upload Main Banner
    const mainBannerPublicId = `bhavana_watch_${folderPad}_banner`;
    console.log(`  Converting and uploading Main Banner to Cloudinary...`);
    const mainBannerPath = path.join(folderPath, mainBannerFile);
    const mainBannerUrl = await convertAndUploadWithRetry(
      mainBannerPath,
      mainBannerPublicId
    );
    console.log(`  ✓ Main Banner URL: ${mainBannerUrl}`);

    // Track for move to images in
    const mainBannerExt = path.extname(mainBannerFile);
    const mainBannerDestName = `bhavana_watch_${folderPad}_banner${mainBannerExt}`;
    imagesToMove.push({
      src: mainBannerPath,
      dest: path.join(IMAGES_IN_DIR, mainBannerDestName),
      desc: `Folder ${folderNum} banner -> ${mainBannerDestName}`
    });

    // 2. Convert & Upload Other Gallery Images
    const galleryUrls = [mainBannerUrl];
    for (let i = 0; i < otherImages.length; i++) {
      const imgFile = otherImages[i];
      const imgPublicId = `bhavana_watch_${folderPad}_gallery_${i + 1}`;
      console.log(`  Converting and uploading Gallery ${i + 1} ("${imgFile}")...`);
      const imgPath = path.join(folderPath, imgFile);
      const imgUrl = await convertAndUploadWithRetry(
        imgPath,
        imgPublicId
      );
      galleryUrls.push(imgUrl);
      console.log(`  ✓ Gallery ${i + 1} URL: ${imgUrl}`);

      const imgExt = path.extname(imgFile);
      const destImgName = `bhavana_watch_${folderPad}_gallery_${i + 1}${imgExt}`;
      imagesToMove.push({
        src: imgPath,
        dest: path.join(IMAGES_IN_DIR, destImgName),
        desc: `Folder ${folderNum} gallery ${i + 1} -> ${destImgName}`
      });
    }

    // 3. Check if watch already exists or create new
    let existing = await Product.findOne({
      $or: [
        { name: spec.name },
        { 'features': `Folder: ${folderNum} / BHAVANA_WATCH` }
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
      features: [...spec.features, `Folder: ${folderNum} / BHAVANA_WATCH`],
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

  // 4. Move all processed images to "images in" folder
  console.log('\n========================================================================');
  console.log(`📦 MOVING ${imagesToMove.length} ORIGINAL IMAGES TO "images in" FOLDER`);
  console.log('========================================================================');

  let moveSuccessCount = 0;
  for (const item of imagesToMove) {
    if (fs.existsSync(item.src)) {
      fs.copyFileSync(item.src, item.dest);
      fs.unlinkSync(item.src);
      moveSuccessCount++;
      console.log(`  ✓ Moved: ${item.desc}`);
    } else {
      console.warn(`  ⚠️ Source not found: ${item.src}`);
    }
  }
  console.log(`\n✓ Successfully moved ${moveSuccessCount} / ${imagesToMove.length} images to "${IMAGES_IN_DIR}".`);

  // Clean up temp dir
  try {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch { }

  console.log('\n========================================================================');
  console.log('✅ ALL 20 BHAVANA PRODUCTS SUCCESSFULLY UPLOADED AND INSERTED');
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
