import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import Product from './models/Product.js';
import Homepage from './models/Homepage.js';
import User from './models/User.js';
import BlogPost from './models/BlogPost.js';
import { DEFAULT_BLOG_POSTS } from './data/blogPosts.js';
import auth from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ARCHITECTURE_IMAGE_URL = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp';
const HERITAGE_IMAGE_URL = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171811/t24_watches_defaults/igkoymjeabkrvpmjcx3o.jpg';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer Memory Storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Middlewares
app.use(cors());
app.use(express.json());

const normalizeHomepageSettings = (settings) => {
  if (
    !settings.architectureImage ||
    settings.architectureImage === '/watch-architecture.webp' ||
    settings.architectureImage === settings.heritageImage ||
    settings.architectureImage === HERITAGE_IMAGE_URL
  ) {
    settings.architectureImage = ARCHITECTURE_IMAGE_URL;
  }
  // Enforce new SEO-optimized architecture text on existing database documents
  const targetSEO = 'superclone watches in Dubai';
  if (!settings.architectureDesc || !settings.architectureDesc.includes(targetSEO)) {
    settings.architectureDesc = 'Discover the ultimate collection of superclone watches and superclone watches in Dubai. At T24, we offer the finest superclone watches Dubai has ever seen, engineered with 1:1 replica-watch detailing, refined case architecture, exposed mechanical caliber movement depth, and polished gold finishing. We are the leading source for collectors seeking premium replica watches in Dubai and authentic-weight Dubai replica watches, fully calibrated for daily-wear precision.';
  }
  if (!settings.salesReps || settings.salesReps.length === 0) {
    settings.salesReps = [
      { name: 'WhatsApp', number: '971501234567', isActive: true, isFeatured: true },
      { name: 'WhatsApp', number: '971507654321', isActive: true, isFeatured: false }
    ];
  } else {
    settings.salesReps = settings.salesReps.map(rep => {
      let newName = rep.name;
      if (newName.includes('Faisal') || newName.includes('Faisle') || newName.includes('Marcus')) {
        newName = 'WhatsApp';
      }
      if (newName.includes('(Support Desk)')) {
        newName = newName.replace('(Support Desk)', '(WhatsApp)');
      }
      if (newName.includes('(Senior Concierge)')) {
        newName = newName.replace('(Senior Concierge)', '(WhatsApp)');
      }
      if (newName.includes('Concierge')) {
        newName = newName.replace('Concierge', 'WhatsApp Support');
      }
      return { ...rep, name: newName };
    });
  }
  if (settings.testimonials && Array.isArray(settings.testimonials)) {
    settings.testimonials = settings.testimonials.map(t => {
      let name = t.name || '';
      if (name.includes('Faisal') || name.includes('Faisle')) {
        name = name.replace('Faisal', 'Fahad').replace('Faisle', 'Fahad');
      }
      if (name.includes('Marcus')) {
        name = name.replace('Marcus', 'Lucas');
      }
      return { ...t, name };
    });
  }
  return settings;
};

// Connect to MongoDB Atlas (use separate test DB during test runs)
let dbUri = process.env.MONGO_URI;
if (process.env.NODE_ENV === 'test' && dbUri) {
  dbUri = dbUri.replace('/t24watches', '/t24watches_test');
}
mongoose.connect(dbUri)
  .then(() => {
    console.log(`Connected to MongoDB successfully (${process.env.NODE_ENV === 'test' ? 'TEST' : 'PRODUCTION'} DB).`);
    autoTranslateExistingProducts();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// =========================================================================
// CUSTOMER APIS (PUBLIC)
// =========================================================================

// 1. Fetch Hero Section copies
app.get('/api/hero', async (req, res) => {
  try {
    let settings = await Homepage.findOne();
    if (!settings) {
      settings = await Homepage.create({});
    }
    let heroPayload = {
      title: settings.heroTitle,
      subtitleLabel: settings.heroSubtitleLabel,
      subtitleDesc: settings.heroSubtitleDesc,
      bodyDescription: settings.heroBodyDescription,
      ctaLabel: settings.heroCtaLabel,
      ctaTarget: settings.heroCtaTarget,
      watchImageUrl: settings.heroWatchImageUrl,
      watchLabelLine1: settings.heroWatchLabelLine1,
      watchLabelLine2: settings.heroWatchLabelLine2,
      watchLabelLine3: settings.heroWatchLabelLine3,
      watchLabelLine4: settings.heroWatchLabelLine4,
      stats: settings.heroStats
    };
    if (req.query.lang === 'ar') {
      heroPayload.title = await translateText(heroPayload.title, 'ar');
      heroPayload.subtitleLabel = await translateText(heroPayload.subtitleLabel, 'ar');
      heroPayload.subtitleDesc = await translateText(heroPayload.subtitleDesc, 'ar');
      heroPayload.bodyDescription = await translateText(heroPayload.bodyDescription, 'ar');
      heroPayload.ctaLabel = await translateText(heroPayload.ctaLabel, 'ar');
      heroPayload.watchLabelLine1 = await translateText(heroPayload.watchLabelLine1, 'ar');
      heroPayload.watchLabelLine2 = await translateText(heroPayload.watchLabelLine2, 'ar');
      heroPayload.watchLabelLine3 = await translateText(heroPayload.watchLabelLine3, 'ar');
      heroPayload.watchLabelLine4 = await translateText(heroPayload.watchLabelLine4, 'ar');
      if (Array.isArray(heroPayload.stats)) {
        heroPayload.stats = await Promise.all(heroPayload.stats.map(async s => ({
          value: await translateText(s.value, 'ar'),
          label: await translateText(s.label, 'ar')
        })));
      }
    }
    return res.status(200).json(heroPayload);
  } catch (err) {
    console.error('GET /api/hero error:', err);
    return res.status(500).json({ error: 'Server error fetching homepage hero copy.' });
  }
});

// 1.5 Fetch All Homepage Sections
app.get('/api/homepage', async (req, res) => {
  try {
    let settings = await Homepage.findOne();
    if (!settings) {
      settings = await Homepage.create({});
    }
    normalizeHomepageSettings(settings);
    if (settings.isModified('architectureImage')) {
      await settings.save();
    }
    let data = settings;

    // Fetch latest 12 in-stock products to dynamically populate/fill New Arrivals
    const latestProducts = await Product.find({
      inStock: true,
      isVisible: { $ne: false },
    })
      .sort({ id: -1 })
      .limit(12);

    const dynamicArrivals = latestProducts.map(p => ({
      id: p.id,
      name: p.name,
      type: p.movement || '1:1 Master Copy Edition',
      image: p.image,
      label: p.brand.toUpperCase(),
      priceUSD: p.priceUSD,
      priceAED: p.priceAED
    }));

    let plainSettings = settings.toObject ? settings.toObject() : settings;
    const configuredArrivalIds = (plainSettings.newArrivals || [])
      .map((item) => item.id)
      .filter((id) => Number.isFinite(id));
    const visibleConfiguredProducts = configuredArrivalIds.length
      ? await Product.find({
          id: { $in: configuredArrivalIds },
          isVisible: { $ne: false },
        }).select('id')
      : [];
    const visibleConfiguredIds = new Set(
      visibleConfiguredProducts.map((product) => product.id)
    );
    plainSettings.newArrivals = (plainSettings.newArrivals || []).filter((item) =>
      visibleConfiguredIds.has(item.id)
    );
    if (!plainSettings.newArrivals || plainSettings.newArrivals.length <= 2) {
      plainSettings.newArrivals = dynamicArrivals;
    } else {
      const customIds = new Set(plainSettings.newArrivals.map(item => item.id));
      const filledArrivals = [...plainSettings.newArrivals];
      for (const dynamicItem of dynamicArrivals) {
        if (filledArrivals.length >= 12) break;
        if (!customIds.has(dynamicItem.id)) {
          filledArrivals.push(dynamicItem);
        }
      }
      plainSettings.newArrivals = filledArrivals;
    }

    data = plainSettings;

    if (req.query.lang === 'ar') {
      data = await translateHomepage(plainSettings, 'ar');
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('GET /api/homepage error:', err);
    return res.status(500).json({ error: 'Server error fetching homepage data.' });
  }
});

const withAudience = (product) => {
  const plainProduct = typeof product.toObject === 'function' ? product.toObject() : product;
  let aud = plainProduct.audience || 'Mens';
  if (aud === 'Gents' || aud === 'gents') aud = 'Mens';
  if (aud === 'Ladies' || aud === 'ladies') aud = 'Womens';

  const cleanText = (text) => {
    if (!text) return '';
    return text
      .replace(/\b(Clean|VSF|3K|BTF|ZF|PPF|OMF|APS|ARF|Noob)\s+Factory\b/gi, 'Swiss Edition')
      .replace(/\b(Clean|VSF|3K|BTF|ZF|PPF|OMF|APS|ARF|Noob)\b/gi, 'Swiss')
      .replace(/\bfactory\b/gi, 'Edition')
      .replace(/swiss\s+clone/gi, 'master copy')
      .replace(/swiss\s+clones/gi, 'master copies')
      .replace(/mirror\s+copy/gi, 'master copy')
      .replace(/mirror\s+copies/gi, 'master copies');
  };

  let name = cleanText(plainProduct.name);
  let description = cleanText(plainProduct.description);
  
  let factory = cleanText(plainProduct.factory);
  if (factory.toLowerCase() === 'custom factory' || factory.toLowerCase() === 'factory' || !factory) {
    factory = 'Swiss Precision';
  }

  let movement = cleanText(plainProduct.movement);
  let casing = cleanText(plainProduct.casing);
  let bezel = cleanText(plainProduct.bezel);
  let glass = cleanText(plainProduct.glass);
  let waterResistance = cleanText(plainProduct.waterResistance);
  
  let model = cleanText(plainProduct.model);
  let reference = cleanText(plainProduct.reference);
  let material = cleanText(plainProduct.material);
  let caliber = cleanText(plainProduct.caliber);

  let features = plainProduct.features || [];
  if (Array.isArray(features)) {
    features = features.map(f => cleanText(f));
  }

  return {
    ...plainProduct,
    name,
    factory,
    description,
    movement,
    casing,
    bezel,
    glass,
    waterResistance,
    model,
    reference,
    material,
    caliber,
    features,
    audience: aud,
  };
};

const translationCache = new Map();
const STATIC_AR_TRANSLATIONS = new Map([
  // Hero translations
  ['SWISS | PRECISION', 'الدقة | السويسرية'],
  ['SWISS PRECISION', 'الدقة السويسرية'],
  ['SWISS', 'سويسري'],
  ['PRECISION', 'الدقة'],
  ['SUPER CLONE WATCHES DUBAI', 'ساعات سوبر كلون دبي'],
  ['SUPER CLONE WATCHES IN DUBAI', 'ساعات سوبر كلون في دبي'],
  ['Best replica watches in Dubai. Master copy watches & clone watches.', 'أفضل الساعات الماستر كوبي في دبي. ساعات طبق الأصل وساعات كلون.'],
  ['BEST REPLICA WATCHES IN DUBAI. MASTER COPY WATCHES & CLONE WATCHES.', 'أفضل الساعات الماستر كوبي في دبي. ساعات طبق الأصل وساعات كلون.'],
  ["Dubai's ultimate boutique for 1:1 super clone watches. Hand-calibrated with flawless sweep movements, premium Oystersteel, and sapphire crystals. Cash on delivery available.", "بوتيك دبي الرائد لساعات السوبر كلون ١:١. معايرة يدوياً بحركات انسيابية متقنة، وفولاذ أويسترستيل الفاخر، وزجاج السافير. الدفع عند الاستلام متوفر."],
  ['VIEW COLLECTION', 'عرض المجموعة'],
  ['SWISS 1:1 BUILD', 'صناعة سويسرية ١:١'],
  ['DUBAI EDITION', 'إصدار دبي'],
  ['PREMIUM OYSTERSTEEL', 'فولاذ أويسترستيل فاخر'],
  ['1:1 BUILD', 'صناعة ١:١'],
  ['FREE', 'مجانًا'],
  ['Same-day delivery', 'توصيل في نفس اليوم'],
  ['2 YR', 'سنتين'],
  ['Service warranty', 'ضمان الخدمة'],
  ['COD', 'الدفع عند الاستلام'],
  ['Multiple payments', 'طرق دفع متعددة'],

  // Architecture of Time
  ['ARCHITECTURE', 'هندسة'],
  ['OF TIME', 'الوقت'],
  ['ARCHITECTURE OF TIME', 'هندسة الوقت'],
  ['CASE, DIAL, MOVEMENT', 'العلبة، الميناء، الحركة'],
  ['CASE', 'العلبة'],
  ['DIAL', 'الميناء'],
  ['MOVEMENT', 'الحركة'],
  ['Discover the best copy watches and super clone watches in Dubai, crafted with replica-watch detailing, refined case architecture, exposed movement depth, and polished gold finishing for collectors seeking premium replica watches in Dubai.', 'اكتشف أفضل الساعات الماستر كوبي وساعات السوبر كلون في دبي، المصنوعة بتفاصيل دقيقة، وهيكل علبة راقٍ، وعمق حركة مكشوف، وتشطيبات ذهبية مصقولة لهواة الساعات الفاخرة في دبي.'],
  ['Discover the ultimate collection of superclone watches and superclone watches in Dubai. At T24, we offer the finest superclone watches Dubai has ever seen, engineered with 1:1 replica-watch detailing, refined case architecture, exposed mechanical caliber movement depth, and polished gold finishing. We are the leading source for collectors seeking premium replica watches in Dubai and authentic-weight Dubai replica watches, fully calibrated for daily-wear precision.', 'اكتشف المجموعة النهائية من ساعات السوبر كلون وساعات السوبر كلون في دبي. في تي ٢٤، نقدم أفضل ساعات السوبر كلون التي شهدتها دبي على الإطلاق، والمصممة بتفاصيل ساعات تقليدية ١:١، وهيكل علبة راقٍ، وعمق حركة ميكانيكي مكشوف، وتشطيب ذهبي مصقول. نحن المصدر الرائد لهواة جمع الساعات الباحثين عن ساعات تقليدية ممتاز في دبي وساعات دبي التقليدية ذات الوزن الأصلي والمعايرة بالكامل لدقة الارتداء اليومي.'],
  ['At T24 Watches, the engineering of our master copy timepieces represents the ultimate synthesis of form and function. Discover the finest selection of superclone watches and premium superclone watches in Dubai, meticulously crafted to replicate original luxury standards. As the premier destination for superclone watches Dubai collectors trust, each watch features a 1:1 case architecture, scratch-resistant sapphire glass, and a fully calibrated clone movement. For those seeking the highest quality replica watches in Dubai, our collection delivers identical luxury weights and detailed hand-finishing, making us the benchmark for Dubai replica watches and premium copy watches.', 'في تي 24 للساعات، تمثل هندسة ساعاتنا الماستر كوبي التكامل الأمثل بين الشكل والأداء. اكتشف أرقى تشكيلة من ساعات السوبر كلون وساعات السوبر كلون في دبي، المصممة بدقة لتحاكي المعايير الفاخرة الأصلية. بصفتنا الوجهة الأولى لساعات السوبر كلون التي يثق بها هواة الجمع في دبي، تتميز كل ساعة بهيكل علبة ١:١، وزجاج سافير مقاوم للخدش، وحركة كلون معايرة بالكامل لدقة الاستخدام اليومي.'],

  // Atelier (Maison Aeterna)
  ['T24', 'تي 24'],
  ['ATELIER', 'المشغل'],
  ['At T24 Watches, we offer the best replica watches in Dubai. Our dedicated watchmaking atelier is specializing in the selection, calibration, and tuning of 1:1 super clone watches Dubai collectors cherish. Every super clone watch in Dubai that we hand-deliver is built using identical weight distribution and flawless Swiss sweep movements.', 'في تي ٢٤ للساعات، نقدم أفضل الساعات التقليدية في دبي. يتخصص مشغل الساعات المخصص لدينا في اختيار ومعايرة وضبط ساعات السوبر كلون ١:١ التي يفضلها جامعو الساعات في دبي. كل ساعة سوبر كلون في دبي نقوم بتسليمها يدويًا مصممة باستخدام توزيع وزن متطابق وحركات مسح سويسرية خالية من العيوب.'],
  ['As a premier source for copy watches Dubai and copy watches in Dubai, our in-house watchmakers specialize in tuning and recalibrating first copy movements. From disassembling to lubricating, each timepiece is optimized to replicate the fluid sweeps, tick rates, and robustness of original luxury brands.', 'بصفتنا مصدرًا رئيسيًا لساعات الكوبي في دبي، يتخصص صانعو الساعات لدينا في ضبط وإعادة معايرة حركات الفيرست كوبي. من التفكيك إلى التشحيم، يتم تحسين كل ساعة لتكرار عمليات المسح الانسيابية ومعدلات التكتكة ومتانة الماركات الفاخرة الأصلية.'],
  ['From Daytona configurations to complex NTPT carbon fiber builds, we represent the peak of master copy watches Dubai has to offer. We use high-end 904L anti-corrosive steel, sapphire glass, and heavy bracelets to ensure our clone watches Dubai collection stands out.', 'من تكوينات دايتونا إلى إصدارات ألياف الكربون NTPT المعقدة، نحن نمثل قمة ساعات الماستر كوبي التي تقدمها دبي. نحن نستخدم فولاذ 904L الراقي المقاوم للتآكل، وزجاج السافير، والأساور الثقيلة لضمان تميز مجموعة الساعات الكلون في دبي.'],
  ['FROM THE EYES OF THE ARTISAN', 'من منظور الحرفي'],
  ['Every custom T24 watch undergoes calibration and pressure testing to ensure confident daily precision', 'تخضع كل ساعة مخصصة من تي ٢٤ للمعايرة واختبار الضغط لضمان الدقة اليومية الموثوقة'],

  // Blog Posts
  ['Buying Guides', 'أدلة الشراء'],
  ['Reference Guides', 'أدلة المراجع'],
  ['Watch Care', 'العناية بالساعات'],
  ['Watch Knowledge', 'ثقافة الساعات'],
  ['Style Guides', 'أدلة الأناقة'],
  ['Collector Guides', 'أدلة هواة الجمع'],
  ['T24 Editorial', 'تحرير تي 24'],
  ['How to Choose a Premium Replica Watch in Dubai', 'كيف تختار ساعة ماستر كوبي فاخرة في دبي'],
  ['A complete quality-control guide covering the reference, movement, dial, crystal, case finishing, bracelet feel, fit, delivery, and after-sales support.', 'دليل شامل لمراقبة الجودة يغطي الرقم المرجعي، الحركة، الميناء، الزجاج، تشطيب العلبة، ملمس السوار، المقاس، التوصيل، وخدمة ما بعد البيع.'],
  ['The Architecture of a 1:1 Clone Movement', 'هندسة حركة الساعات الكلون ١:١'],
  ['An engineering explainer detailing how modern clone calibers reproduce the balance assembly, bridge architecture, rotor winding, and beat rate of Swiss movements.', 'شرح هندسي يوضح كيف تحاكي عيارات الكلون الحديثة مجمع التوازن، وهيكل الجسور، وتعبئة الدوار، ومعدل النبض للحركات السويسرية.'],
  ['Rolex Daytona Reference Guide: Selecting the Right Dial and Caliber', 'دليل مرجع رولكس دايتونا: اختيار الميناء والعيار المناسبين'],
  ['Explore the differences between steel, ceramic, Oysterflex, and precious-metal Daytona references with buying advice for collectors in Dubai.', 'استكشف الفروق بين إصدارات دايتونا المصنوعة من الفولاذ، السيراميك، أويسترفليكس، والمعادن الثمينة مع نصائح شراء لهواة الجمع في دبي.'],
  ['Caring for High-End Replica Watches in Dubai’s Climate', 'العناية بالساعات الماستر كوبي الفاخرة في مناخ دبي'],
  ["Caring for High-End Replica Watches in Dubai's Climate", 'العناية بالساعات الماستر كوبي الفاخرة في مناخ دبي'],
  ['Practical ownership rules covering heat, humidity, dust exposure, magnetic fields, bracelet cleaning, and scheduled service intervals.', 'قواعد عملية للملكية تغطي الحرارة، الرطوبة، التعرض للغبار، المجالات المغناطيسية، تنظيف السوار، وجداول الصيانة الدورية.'],
  ['Mechanical vs. Automatic vs. Quartz: A Practical Collector’s Guide', 'الميكانيكية مقابل الأوتوماتيكية مقابل الكوارتز: دليل عملي لهواة الجمع'],
  ["Mechanical vs. Automatic vs. Quartz: A Practical Collector's Guide", 'الميكانيكية مقابل الأوتوماتيكية مقابل الكوارتز: دليل عملي لهواة الجمع'],
  ['Understand the mechanical heart of luxury timepieces, how automatic rotors function, and why sweep movements remain the collector standard.', 'افهم القلب الميكانيكي للساعات الفاخرة، وكيف تعمل الدوارات الأوتوماتيكية، ولماذا تظل حركات المسح الانسيابية معيار هواة الجمع.'],
  ['The Essential 3-Watch Replica Collection for Every Occasion', 'المجموعة الأساسية المكونة من 3 ساعات ماستر كوبي لكل مناسبة'],
  ['How to build a complete watch wardrobe with one daily sports piece, one formal dress reference, and one expressive weekend chronograph.', 'كيفية بناء خزانة ساعات متكاملة بساعة رياضية يومية، وساعة رسمية للمناسبات، وكرونوغراف مميز لعطلة نهاية الأسبوع.'],
  ['Begin with the exact reference', 'ابدأ بالرقم المرجعي الدقيق'],
  ['Inspect the dial and crystal', 'افحص الميناء والزجاج'],
  ['Test the movement and controls', 'اختبر الحركة وعناصر التحكم'],
  ['Evaluate finishing, weight, and comfort', 'قيّم التشطيب والوزن والراحة'],
  ['Choose transparent delivery and service', 'اختر خدمة وتوصيلًا بشروط واضحة'],
  ['Understand the Daytona silhouette', 'تعرّف إلى تصميم دايتونا'],
  ['Choose the reference before the colour', 'اختر الرقم المرجعي قبل اللون'],
  ['Read the chronograph dial', 'اقرأ ميناء الكرونوغراف'],
  ['Assess fit on the wrist', 'قيّم الملاءمة على المعصم'],
  ['Pick a configuration for your lifestyle', 'اختر التكوين المناسب لأسلوب حياتك'],
  ['Build a two-minute after-wear routine', 'اتبع روتين عناية لدقيقتين بعد الارتداء'],
  ['Manage heat and rapid temperature changes', 'تعامل مع الحرارة والتغير السريع في درجات الحرارة'],
  ['Treat water resistance as a tested condition', 'تعامل مع مقاومة الماء كحالة تحتاج إلى اختبار'],
  ['Protect the watch from impact and magnetism', 'احمِ الساعة من الصدمات والمغناطيسية'],
  ['Store and service it intelligently', 'خزّن الساعة وصُنها بطريقة ذكية'],
  ['Mechanical versus quartz', 'الميكانيكية مقارنة بالكوارتز'],
  ['How automatic winding works', 'كيف يعمل التعبئة الأوتوماتيكية'],
  ['Power reserve and beat rate', 'احتياطي الطاقة ومعدل النبض'],
  ['What jewels and finishing do', 'دور الجواهر والتشطيبات'],
  ['Use and maintain a mechanical movement', 'استخدام الحركة الميكانيكية وصيانتها'],
  ['Case diameter is only the beginning', 'قطر العلبة ليس سوى البداية'],
  ['Lug-to-lug controls wrist coverage', 'المسافة بين العروات تحدد تغطية المعصم'],
  ['Thickness changes comfort', 'السماكة تؤثر في الراحة'],
  ['Bracelet and strap sizing matter', 'مقاس السوار والحزام مهم'],
  ['Choose proportion, not a rule', 'اختر التناسب لا قاعدة ثابتة'],
  ['Start with your real calendar', 'ابدأ بجدول حياتك الحقيقي'],
  ['Watch one: the dependable daily piece', 'الساعة الأولى: خيار يومي موثوق'],
  ['Watch two: the refined option', 'الساعة الثانية: الخيار الأنيق'],
  ['Watch three: the expressive piece', 'الساعة الثالثة: القطعة الجريئة'],
  ['Make every addition earn its place', 'اجعل كل إضافة تستحق مكانها'],
  ['master copy', 'ماستر كوبي'],
  ['Master Copy', 'ماستر كوبي'],
  ['1:1 Master Copy Edition', 'إصدار ماستر كوبي ١:١'],
  ['1:1 Swiss Master Copy Edition', 'إصدار ماستر كوبي سويسري ١:١'],
  ['1:1 Flyback Chrono Master Copy', 'كرونوغراف فلايباك ماستر كوبي ١:١'],
  ['Automatic Swiss Clone', 'ساعة كلون سويسرية أوتوماتيكية'],
  ['Swiss QC Standards Guaranteed', 'معايير الجودة السويسرية مضمونة'],
  ['SWISS QC STANDARDS GUARANTEED', 'معايير الجودة السويسرية مضمونة'],
  ['NEW ARRIVALS', 'وصل حديثاً'],
  ['EXQUISITE CRAFTSMANSHIP', 'حرفية استثنائية'],
  ['BEST SELLER', 'الأكثر مبيعًا'],
  ['NEW ARRIVAL', 'وصل حديثًا'],
  ['EXQUISITE', 'استثنائي'],
  ['CRAFTSMANSHIP', 'الحرفية'],
  ['Spotlight', 'تحت الضوء'],
  ['THE SIGNATURE', 'التشكيلة المميزة'],
  ['CATALOGUE', 'الكتالوج'],
  ['CURATED WATCH DIRECTORY', 'دليل الساعات المختار'],
  ['Refined timepieces selected for balanced weight, smooth movement, and daily-wear precision.', 'ساعات راقية مختارة بوزن متوازن وحركة انسيابية ودقة للاستخدام اليومي.'],
]);

async function translateText(text, to = 'ar') {
  if (!text || typeof text !== 'string') return text;
  if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/') || text.includes('/upload/')) {
    return text;
  }
  const trimmed = text.trim();
  if (to === 'ar') {
    if (STATIC_AR_TRANSLATIONS.has(text)) return STATIC_AR_TRANSLATIONS.get(text);
    if (STATIC_AR_TRANSLATIONS.has(trimmed)) return STATIC_AR_TRANSLATIONS.get(trimmed);
  }
  const cacheKey = `${to}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
    if (!response.ok) return text;
    const data = await response.json();
    let translatedText = data[0].map(item => item[0]).join('');
    
    // Apply Arabic terminology post-processing for "master copy"
    if (to === 'ar') {
      translatedText = translatedText
        .replace(/النسخة الرئيسية/g, 'ماستر كوبي')
        .replace(/نسخة رئيسية/g, 'ماستر كوبي')
        .replace(/النسخة الماستر/g, 'ماستر كوبي')
        .replace(/نسخة ماستر/g, 'ماستر كوبي')
        .replace(/نسخ رئيسية/g, 'ماستر كوبي')
        .replace(/النسخ الرئيسية/g, 'ماستر كوبي')
        .replace(/نسخة الكوبي/g, 'ماستر كوبي')
        .replace(/ساعة تقليدية/g, 'ساعة ماستر كوبي')
        .replace(/ساعات تقليدية/g, 'ساعات ماستر كوبي')
        .replace(/ساعة سوبر كلون/g, 'ساعة سوبر كلون ماستر كوبي')
        .replace(/ساعات سوبر كلون/g, 'ساعات سوبر كلون ماستر كوبي')
        .replace(/١:١/g, '1:1')
        .replace(/1: 1/g, '1:1')
        .replace(/Master Copy/gi, 'ماستر كوبي')
        .replace(/master copy/gi, 'ماستر كوبي')
        .replace(/master copies/gi, 'ماستر كوبي')
        .replace(/super clone/gi, 'سوبر كلون')
        .replace(/superclone/gi, 'سوبر كلون')
        .replace(/clone/gi, 'كلون')
        .replace(/replica/gi, 'ماستر كوبي')
        .replace(/replicas/gi, 'ماستر كوبي')
        .replace(/T24/gi, 'تي ٢٤');
    }
    
    translationCache.set(cacheKey, translatedText);
    return translatedText;
  } catch (err) {
    console.error('Translation helper error:', err);
    return text;
  }
}

async function populateProductArabicFields(product) {
  try {
    product.nameAr = await translateText(product.name, 'ar');
    product.brandAr = await translateText(product.brand, 'ar');
    product.modelAr = await translateText(product.model, 'ar');
    product.materialAr = await translateText(product.material, 'ar');
    product.movementAr = await translateText(product.movement, 'ar');
    product.casingAr = await translateText(product.casing, 'ar');
    product.bezelAr = await translateText(product.bezel, 'ar');
    product.glassAr = await translateText(product.glass, 'ar');
    product.waterResistanceAr = await translateText(product.waterResistance, 'ar');
    product.descriptionAr = await translateText(product.description, 'ar');
    product.warrantyAr = await translateText(product.warranty, 'ar');

    if (Array.isArray(product.features)) {
      product.featuresAr = await Promise.all(
        product.features.map(f => translateText(f, 'ar'))
      );
    }
  } catch (err) {
    console.error('Failed to populate Arabic fields for product:', err);
  }
}

async function autoTranslateExistingProducts() {
  try {
    const products = await Product.find({
      $or: [
        { nameAr: { $exists: false } },
        { nameAr: '' },
        { descriptionAr: { $exists: false } },
        { descriptionAr: '' }
      ]
    });
    if (products.length > 0) {
      console.log(`🌍 Found ${products.length} products missing Arabic translations. Auto-translating now...`);
      for (const product of products) {
        await populateProductArabicFields(product);
        await product.save();
        console.log(`✅ Translated Product ID ${product.id} to Arabic.`);
      }
      console.log('🌍 Auto-translation complete.');
    }
  } catch (err) {
    console.error('Error auto-translating existing products:', err);
  }
}


async function translateHomepage(homepage, to = 'ar') {
  if (!homepage) return homepage;
  const plain = typeof homepage.toObject === 'function' ? homepage.toObject() : homepage;
  
  const stringFields = [
    'heroTitle', 'heroSubtitleLabel', 'heroSubtitleDesc', 'heroBodyDescription', 'heroCtaLabel',
    'newArrivalsTitle', 'craftsmanshipTitle',
    'architectureHeading1', 'architectureHeading2', 'architectureSubhead', 'architectureDesc',
    'catalogueEyebrow', 'catalogueHeading1', 'catalogueHeading2', 'catalogueDescription',
    'heritageHeading1', 'heritageHeading2', 'heritageDesc1', 'heritageDesc2', 'heritageDesc3',
    'heritageCaptionLabel', 'heritageCaptionText',
    'nocturneHeading1', 'nocturneHeading2', 'nocturneCopy', 'nocturneBuildSpec',
    'footerHeading', 'footerWhatsAppMessage', 'footerCopyright'
  ];

  for (const field of stringFields) {
    if (plain[field]) {
      plain[field] = await translateText(plain[field], to);
    }
  }

  if (Array.isArray(plain.newArrivals)) {
    plain.newArrivals = await Promise.all(plain.newArrivals.map(async (item) => ({
      ...item,
      name: await translateText(item.name, to),
      type: await translateText(item.type, to),
      label: await translateText(item.label, to)
    })));
  }

  if (Array.isArray(plain.testimonials)) {
    plain.testimonials = await Promise.all(plain.testimonials.map(async (item) => ({
      ...item,
      name: await translateText(item.name, to),
      location: await translateText(item.location, to),
      role: await translateText(item.role, to),
      watchBought: await translateText(item.watchBought, to),
      quote: await translateText(item.quote, to)
    })));
  }

  if (Array.isArray(plain.specsBarItems)) {
    plain.specsBarItems = await Promise.all(plain.specsBarItems.map(async (item) => ({
      ...item,
      title: await translateText(item.title, to),
      details: Array.isArray(item.details)
        ? await Promise.all(item.details.map((detail) => translateText(detail, to)))
        : item.details
    })));
  }

  if (Array.isArray(plain.footerLinks)) {
    plain.footerLinks = await Promise.all(plain.footerLinks.map(async (item) => ({
      ...item,
      title: await translateText(item.title, to),
      links: Array.isArray(item.links)
        ? await Promise.all(item.links.map((link) => translateText(link, to)))
        : item.links
    })));
  }

  return plain;
}

async function translateProduct(product, to = 'ar') {
  if (!product) return product;
  const plain = typeof product.toObject === 'function' ? product.toObject() : product;

  const stringFields = [
    'name', 'brand', 'factory', 'model', 'reference', 'material', 'size',
    'caliber', 'warranty', 'movement', 'casing', 'bezel', 'glass',
    'waterResistance', 'description'
  ];

  for (const field of stringFields) {
    if (plain[field]) {
      plain[field] = await translateText(plain[field], to);
    }
  }

  if (Array.isArray(plain.features)) {
    plain.features = await Promise.all(plain.features.map(f => translateText(f, to)));
  }

  return plain;
}

async function translateBlogPost(post, to = 'ar', includeSections = true) {
  if (!post) return post;
  const plain = typeof post.toObject === 'function' ? post.toObject() : { ...post };
  const fields = ['title', 'excerpt', 'category', 'author', 'seoTitle', 'seoDescription'];

  await Promise.all(fields.map(async (field) => {
    if (plain[field]) plain[field] = await translateText(plain[field], to);
  }));

  if (Array.isArray(plain.keywords)) {
    plain.keywords = await Promise.all(plain.keywords.map((keyword) => translateText(keyword, to)));
  }
  if (includeSections && Array.isArray(plain.sections)) {
    plain.sections = await Promise.all(plain.sections.map(async (section) => ({
      ...section,
      heading: await translateText(section.heading, to),
      paragraphs: Array.isArray(section.paragraphs)
        ? await Promise.all(section.paragraphs.map((paragraph) => translateText(paragraph, to)))
        : section.paragraphs,
      bullets: Array.isArray(section.bullets)
        ? await Promise.all(section.bullets.map((bullet) => translateText(bullet, to)))
        : section.bullets,
    })));
  }
  return plain;
}

// GET /api/translate
app.get('/api/translate', async (req, res) => {
  try {
    const { text, to = 'ar' } = req.query;
    if (!text) {
      return res.status(400).json({ error: 'Text query parameter is required.' });
    }
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
    const data = await response.json();
    const translatedText = data[0].map(item => item[0]).join('');
    return res.status(200).json({ original: text, translated: translatedText });
  } catch (err) {
    console.error('Translation error:', err);
    return res.status(500).json({ error: 'Failed to translate text.' });
  }
});

app.post('/api/translate/batch', async (req, res) => {
  try {
    const { texts = [], to = 'ar' } = req.body || {};
    if (!Array.isArray(texts)) {
      return res.status(400).json({ error: 'Texts must be an array.' });
    }
    const safeTexts = [...new Set(texts)]
      .filter((text) => typeof text === 'string' && text.trim())
      .slice(0, 200);
    const translations = {};
    await Promise.all(safeTexts.map(async (text) => {
      translations[text] = await translateText(text, to);
    }));
    return res.status(200).json({ translations });
  } catch (err) {
    console.error('Batch translation error:', err);
    return res.status(500).json({ error: 'Failed to translate interface text.' });
  }
});

// 1.8 Fetch Category Filters List (Brands, Audiences, and Brand-to-Model mappings)
app.get('/api/categories', async (req, res) => {
  try {
    const defaultBrands = [
      'Richard Mille',
      'Audemars Piguet',
      'Patek Philippe',
      'Rolex',
      'Hublot',
      'Cartier',
      'Vacheron Constantin',
      'Omega',
      'IWC',
      'Breitling',
      'Chopard',
      'TAG Heuer'
    ];

    const defaultBrandModels = {
      'Rolex': ['Daytona', 'Submariner', 'Datejust', 'GMT-Master', 'Day-Date', 'Yacht-Master', 'Sea-Dweller', 'Sky-Dweller', 'Milgauss', 'Cellini'],
      'Audemars Piguet': ['Royal Oak', 'Royal Oak Offshore', 'Concept'],
      'Patek Philippe': ['Nautilus', 'Aquanaut', 'Complications'],
      'Richard Mille': ['RM 11-03', 'RM 35-02', 'RM 67-02', 'RM 21-02', 'RM 55'],
      'Hublot': ['Big Bang', 'Classic Fusion', 'Spirit of Big Bang'],
      'Cartier': ['Santos', 'Tank', 'Baignoire', 'Panthère'],
      'Vacheron Constantin': ['Patrimony', 'Overseas', 'Historiques']
    };

    // Query database for all products
    const includeHidden = req.query.includeHidden === 'true';
    const filter = includeHidden ? {} : { isVisible: true };
    const products = await Product.find(filter, 'brand model');

    // Build sets for merging
    const brandsSet = new Set(defaultBrands);
    const brandModels = {};

    // Initialize brandModels with defaultBrandModels
    for (const brand in defaultBrandModels) {
      brandModels[brand] = new Set(defaultBrandModels[brand]);
    }

    // Merge database items
    products.forEach(p => {
      if (p.brand) {
        const brandTrimmed = p.brand.trim();
        if (brandTrimmed) {
          brandsSet.add(brandTrimmed);
          
          if (!brandModels[brandTrimmed]) {
            brandModels[brandTrimmed] = new Set();
          }
          if (p.model) {
            const modelTrimmed = p.model.trim();
            if (modelTrimmed) {
              brandModels[brandTrimmed].add(modelTrimmed);
            }
          }
        }
      }
    });

    // Convert to sorted lists
    const brandsList = Array.from(brandsSet).sort((a, b) => a.localeCompare(b));
    const formattedBrandModels = {};
    for (const brand in brandModels) {
      formattedBrandModels[brand] = Array.from(brandModels[brand]).sort((a, b) => a.localeCompare(b));
    }

    const brands = ['ALL BRANDS', ...brandsList];
    const audiences = ['ALL', 'Womens', 'Mens'];

    return res.status(200).json({
      brands,
      audiences,
      brandModels: formattedBrandModels
    });
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 2. Fetch Catalogue (supports brand/category pills filter, query search, pagination)
app.get('/api/products', async (req, res) => {
  try {
    const { brand, audience, search, model, page = 1, limit = 6 } = req.query;
    const query = {};
    const andConditions = [{ isVisible: { $ne: false } }];

    if (brand && brand !== 'ALL BRANDS') {
      andConditions.push({ brand: new RegExp('^' + brand + '$', 'i') });
    }

    if (audience && audience !== 'ALL') {
      if (audience === 'Ladies' || audience === 'Womens') {
        andConditions.push({ audience: { $in: ['Ladies', 'Womens'] } });
      } else if (audience === 'Gents' || audience === 'Mens') {
        andConditions.push({ audience: { $in: ['Gents', 'Mens'] } });
      } else {
        andConditions.push({ audience: audience });
      }
    }

    if (model) {
      andConditions.push({
        $or: [
          { model: { $regex: model, $options: 'i' } },
          { name: { $regex: model, $options: 'i' } }
        ]
      });
    }

    if (search) {
      andConditions.push({ $or: [
        { name: { $regex: search, $options: 'i' } },
        { factory: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { audience: { $regex: search, $options: 'i' } },
      ] });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const currentPage = parseInt(page);
    const itemLimit = parseInt(limit);
    const skip = (currentPage - 1) * itemLimit;

    const totalItems = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ id: -1 }) // Sort by ID descending
      .skip(skip)
      .limit(itemLimit);

    // Compute dynamic category counts matching the current search & brand filters
    const countsQueryAll = { isVisible: { $ne: false } };
    const countsQueryLadies = {
      isVisible: { $ne: false },
      audience: { $in: ['Ladies', 'Womens'] },
    };
    const countsQueryGents = {
      isVisible: { $ne: false },
      audience: { $in: ['Gents', 'Mens'] },
    };

    const brandSearchConditions = [];
    if (brand && brand !== 'ALL BRANDS') {
      brandSearchConditions.push({ brand: new RegExp('^' + brand + '$', 'i') });
    }
    if (search) {
      brandSearchConditions.push({ $or: [
        { name: { $regex: search, $options: 'i' } },
        { factory: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { audience: { $regex: search, $options: 'i' } },
      ] });
    }

    if (brandSearchConditions.length > 0) {
      countsQueryAll.$and = brandSearchConditions;
      countsQueryLadies.$and = [...brandSearchConditions, { audience: { $in: ['Ladies', 'Womens'] } }];
      countsQueryGents.$and = [...brandSearchConditions, { audience: { $in: ['Gents', 'Mens'] } }];
    }

    const counts = {
      all: await Product.countDocuments(countsQueryAll),
      womens: await Product.countDocuments(countsQueryLadies),
      mens: await Product.countDocuments(countsQueryGents),
    };

    let finalProducts = products.map(withAudience);
    if (req.query.lang === 'ar') {
      finalProducts = await Promise.all(finalProducts.map(p => translateProduct(p, 'ar')));
    }

    return res.status(200).json({
      products: finalProducts,
      pagination: {
        currentPage,
        totalPages: Math.ceil(totalItems / itemLimit),
        totalItems,
      },
      counts
    });
  } catch (err) {
    console.error('GET /api/products error:', err);
    return res.status(500).json({ error: 'Server error fetching catalogue.' });
  }
});

const celebrityMatches = [
  {
    celebrity: 'Rafael Nadal',
    productId: 100,
    reference: 'Richard Mille RM 27-04 Tourbillon Rafael Nadal',
    image: 'https://media.gq.com.mx/photos/61f1c2e9c981b856e36972ff/16:9/w_1600,c_limit/PR27-04.jpg',
    imagePosition: 'center center',
    source: 'https://www.gq.com.mx/relojes/articulo/rafael-nadal-tiene-un-nuevo-reloj-richard-mille',
    sourceLabel: 'GQ',
  },
  {
    celebrity: 'Alexander Zverev',
    productId: 118,
    reference: 'Richard Mille RM 67-02 Alexander Zverev',
    image: 'https://watchpaparazzi.com/img/pairings/8cb9b89f-0326-40df-84b0-86ed75542157.jpg',
    imagePosition: 'left center',
    imageScale: 1.55,
    captionAlign: 'right',
    source: 'https://watchpaparazzi.com/spotted.php?id=8cb9b89f-0326-40df-84b0-86ed75542157',
    sourceLabel: 'Watch Paparazzi',
  },
  {
    celebrity: 'Lewis Hamilton',
    productId: 259,
    reference: 'Patek Philippe Nautilus 5980/1R Rose Gold',
    image: 'https://watchpaparazzi.com/img/pairings/907a07b1-f845-4a94-b1d8-3ef95dc0d56c.jpg',
    imagePosition: 'left center',
    imageScale: 1.55,
    source: 'https://watchpaparazzi.com/spotted.php?id=907a07b1-f845-4a94-b1d8-3ef95dc0d56c',
    sourceLabel: 'Watch Paparazzi',
  },
  {
    celebrity: 'Lando Norris',
    productId: 116,
    reference: 'Richard Mille RM 67-02 McLaren',
    image: 'https://oracleoftime.com/wp-content/uploads/2023/02/Lando-Norris-Mclaren-Richard-Mille-RM-67-02-Automatic-Extra-Flat.jpg',
    imagePosition: 'center 24%',
    source: 'https://oracleoftime.com/f1-drivers-watches-2023/',
    sourceLabel: 'Oracle Time',
  },
];

app.get('/api/collections/celebrity-matches', async (req, res) => {
  try {
    const productIds = celebrityMatches.map((match) => match.productId);
    const products = await Product.find({
      id: { $in: productIds },
      isVisible: { $ne: false },
    });
    const productsById = new Map(products.map((product) => [product.id, withAudience(product)]));

    let matches = celebrityMatches
        .filter((match) => productsById.has(match.productId))
        .map((match) => ({
          ...match,
          product: productsById.get(match.productId),
        }));
    if (req.query.lang === 'ar') {
      matches = await Promise.all(matches.map(async (match) => ({
        ...match,
        celebrity: await translateText(match.celebrity, 'ar'),
        reference: await translateText(match.reference, 'ar'),
        product: await translateProduct(match.product, 'ar'),
      })));
    }
    return res.status(200).json({ matches });
  } catch (err) {
    console.error('GET /api/collections/celebrity-matches error:', err);
    return res.status(500).json({ error: 'Server error loading editorial collection.' });
  }
});

async function ensureDefaultBlogPosts() {
  const slugs = DEFAULT_BLOG_POSTS.map((post) => post.slug);
  const currentPosts = await BlogPost.find({ slug: { $in: slugs } }).select('slug seedVersion');
  const currentVersions = new Map(
    currentPosts.map((post) => [post.slug, Number(post.seedVersion || 0)])
  );
  const operations = DEFAULT_BLOG_POSTS
    .filter((post) => (currentVersions.get(post.slug) ?? -1) < post.seedVersion)
    .map((post) => ({
      updateOne: {
        filter: { slug: post.slug },
        update: { $set: post },
        upsert: true,
      },
    }));

  if (operations.length > 0) {
    await BlogPost.bulkWrite(operations);
  }
}

app.get('/api/blogs', async (req, res) => {
  try {
    await ensureDefaultBlogPosts();
    const query = { published: true };
    if (req.query.category) {
      query.category = new RegExp(`^${req.query.category}$`, 'i');
    }
    const limit = Math.min(parseInt(req.query.limit || '20'), 50);
    let posts = await BlogPost.find(query)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .select('-sections');
    if (req.query.lang === 'ar') {
      posts = await Promise.all(posts.map((post) => translateBlogPost(post, 'ar', false)));
    }
    return res.status(200).json({ posts });
  } catch (err) {
    console.error('GET /api/blogs error:', err);
    return res.status(500).json({ error: 'Server error loading journal posts.' });
  }
});

app.get('/api/blogs/:slug', async (req, res) => {
  try {
    await ensureDefaultBlogPosts();
    let post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) {
      return res.status(404).json({ error: 'Journal article not found.' });
    }
    if (req.query.lang === 'ar') {
      post = await translateBlogPost(post, 'ar', true);
    }
    return res.status(200).json(post);
  } catch (err) {
    console.error('GET /api/blogs/:slug error:', err);
    return res.status(500).json({ error: 'Server error loading journal article.' });
  }
});

// 3. Fetch specific watch details
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const watch = await Product.findOne({
      id: productId,
      isVisible: { $ne: false },
    });
    if (!watch) {
      return res.status(404).json({ error: 'Requested watch model not found in catalogue.' });
    }
    let data = withAudience(watch);
    if (req.query.lang === 'ar') {
      data = await translateProduct(data, 'ar');
    }
    return res.status(200).json(data);
  } catch (err) {
    console.error('GET /api/products/:id error:', err);
    return res.status(500).json({ error: 'Server error loading watch details.' });
  }
});


// =========================================================================
// ADMIN APIS (SECURE)
// =========================================================================

// 1. Admin login credentials verify
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Please enter all fields.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid administrator credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid administrator credentials.' });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 't24watches_dubai_luxury_secret_signature_jwt_hash_key_182937',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ error: 'Server authentication failure.' });
  }
});

app.get('/api/admin/products', auth, async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { brand: { $regex: search, $options: 'i' } },
            { factory: { $regex: search, $options: 'i' } },
            { model: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const currentPage = Math.max(parseInt(page), 1);
    const itemLimit = Math.min(Math.max(parseInt(limit), 1), 100);
    const skip = (currentPage - 1) * itemLimit;

    const [totalItems, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort({ id: -1 }).skip(skip).limit(itemLimit),
    ]);

    return res.status(200).json({
      products: products.map(withAudience),
      pagination: {
        currentPage,
        totalPages: Math.max(Math.ceil(totalItems / itemLimit), 1),
        totalItems,
      },
    });
  } catch (err) {
    console.error('GET /api/admin/products error:', err);
    return res.status(500).json({ error: 'Server error loading admin catalogue.' });
  }
});

app.post('/api/admin/blogs', auth, async (req, res) => {
  try {
    const post = await BlogPost.create(req.body);
    return res.status(201).json({ message: 'Journal article created.', post });
  } catch (err) {
    console.error('POST /api/admin/blogs error:', err);
    return res.status(400).json({ error: 'Unable to create journal article.' });
  }
});

app.put('/api/admin/blogs/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!post) return res.status(404).json({ error: 'Journal article not found.' });
    return res.status(200).json({ message: 'Journal article updated.', post });
  } catch (err) {
    console.error('PUT /api/admin/blogs/:id error:', err);
    return res.status(400).json({ error: 'Unable to update journal article.' });
  }
});

app.delete('/api/admin/blogs/:id', auth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Journal article not found.' });
    return res.status(200).json({ message: 'Journal article deleted.' });
  } catch (err) {
    console.error('DELETE /api/admin/blogs/:id error:', err);
    return res.status(500).json({ error: 'Unable to delete journal article.' });
  }
});

// 2. Modify Hero Section content
app.put('/api/admin/hero', auth, async (req, res) => {
  try {
    const {
      title,
      subtitleLabel,
      subtitleDesc,
      bodyDescription,
      ctaLabel,
      ctaTarget,
      watchImageUrl,
      watchLabelLine1,
      watchLabelLine2,
      watchLabelLine3,
      watchLabelLine4,
    } = req.body;

    let settings = await Homepage.findOne();
    if (!settings) {
      settings = new Homepage({});
    }

    if (title) settings.heroTitle = title;
    if (subtitleLabel) settings.heroSubtitleLabel = subtitleLabel;
    if (subtitleDesc) settings.heroSubtitleDesc = subtitleDesc;
    if (bodyDescription) settings.heroBodyDescription = bodyDescription;
    if (ctaLabel) settings.heroCtaLabel = ctaLabel;
    if (ctaTarget) settings.heroCtaTarget = ctaTarget;
    if (watchImageUrl) settings.heroWatchImageUrl = watchImageUrl;
    if (watchLabelLine1 !== undefined) settings.heroWatchLabelLine1 = watchLabelLine1;
    if (watchLabelLine2 !== undefined) settings.heroWatchLabelLine2 = watchLabelLine2;
    if (watchLabelLine3 !== undefined) settings.heroWatchLabelLine3 = watchLabelLine3;
    if (watchLabelLine4 !== undefined) settings.heroWatchLabelLine4 = watchLabelLine4;

    await settings.save();
    return res.status(200).json({ message: 'Homepage hero copy updated successfully.', hero: settings });
  } catch (err) {
    console.error('PUT /api/admin/hero error:', err);
    return res.status(500).json({ error: 'Server error updating hero copy.' });
  }
});

// 2.5 Modify All Homepage Sections copy
app.put('/api/admin/homepage', auth, async (req, res) => {
  try {
    let settings = await Homepage.findOne();
    if (!settings) {
      settings = new Homepage({});
    }

    // Clean body of immutable metadata keys
    const updateData = { ...req.body };
    delete updateData._id;
    delete updateData.__v;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    Object.assign(settings, updateData);
    normalizeHomepageSettings(settings);
    await settings.save();
    return res.status(200).json({ message: 'Homepage settings updated successfully.', settings });
  } catch (err) {
    console.error('PUT /api/admin/homepage error:', err);
    return res.status(500).json({ error: 'Server error saving homepage content.' });
  }
});

// 3. Image upload to Cloudinary CDN
app.post('/api/admin/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    let bufferToUpload = req.file.buffer;
    let folderName = 't24_watches_catalogue';

    if (req.query.removeBg === 'true' && process.env.REMOVEBG_API_KEY) {
      try {
        console.log('🎨 Requesting remove.bg API to remove background...');
        const removeBgForm = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        removeBgForm.append('image_file', blob, req.file.originalname);
        removeBgForm.append('size', 'auto');
        removeBgForm.append('format', 'png');

        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': process.env.REMOVEBG_API_KEY,
          },
          body: removeBgForm,
        });

        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer();
          bufferToUpload = Buffer.from(arrayBuffer);
          folderName = 't24_watches_clean';
          console.log('✅ Background removed successfully via API.');
        } else {
          const errMsg = await response.text();
          console.warn(`⚠️ remove.bg API returned error: ${response.status} - ${errMsg}. Uploading original image.`);
        }
      } catch (bgError) {
        console.error('❌ Background removal failed, uploading original image instead:', bgError);
      }
    }

    // Stream upload buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          return res.status(500).json({ error: 'Failed to upload image file to Cloudinary CDN.' });
        }
        return res.status(200).json({ url: result.secure_url });
      }
    );

    uploadStream.end(bufferToUpload);
  } catch (err) {
    console.error('Upload API error:', err);
    return res.status(500).json({ error: 'Server upload error.' });
  }
});

// 4. Create watch product
app.post('/api/products', auth, async (req, res) => {
  try {
    const {
      name,
      brand,
      factory,
      audience,
      priceUSD,
      priceAED,
      url,
      image,
      thumbnail,
      images,
      movement,
      casing,
      bezel,
      glass,
      waterResistance,
      description,
      features,
      inStock,
      isVisible,
      model,
      reference,
      material,
      size,
      caliber,
      warranty
    } = req.body;

    if (!name || !brand || !factory || !priceUSD || !priceAED || !image || !movement || !description) {
      return res.status(400).json({ error: 'Please enter all required catalogue fields.' });
    }

    // Get the maximum custom product id to increment
    const maxWatch = await Product.findOne().sort({ id: -1 });
    const nextId = maxWatch ? maxWatch.id + 1 : 100;

    let normalizedAudience = 'Mens';
    if (audience === 'Womens' || audience === 'Ladies') {
      normalizedAudience = 'Womens';
    }

    const newProduct = new Product({
      id: nextId,
      name,
      brand,
      audience: normalizedAudience,
      factory,
      priceUSD,
      priceAED,
      url: url || '',
      image,
      thumbnail: thumbnail || image || '',
      images: images || [image],
      movement,
      casing: casing || '904L anti-corrosive stainless steel casing',
      bezel: bezel || 'Hand-finished structural bezel',
      glass: glass || 'Ultra-clear sapphire glass with anti-scratch',
      waterResistance: waterResistance || '50m waterproof vacuum tested',
      description,
      features: features || [],
      inStock: inStock !== undefined ? inStock : true,
      isVisible: isVisible !== undefined ? isVisible : true,
      model: model || '',
      reference: reference || '',
      material: material || '',
      size: size || '',
      caliber: caliber || '',
      warranty: warranty || '2-Year Service Warranty'
    });

    await populateProductArabicFields(newProduct);
    await newProduct.save();
    return res.status(201).json({ message: 'Watch added successfully to catalogue.', product: newProduct });
  } catch (err) {
    console.error('POST /api/products error:', err);
    return res.status(500).json({ error: 'Server error creating watch item.' });
  }
});

// 5. Update watch details
app.put('/api/products/:id', auth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const watch = await Product.findOne({ id: productId });
    if (!watch) {
      return res.status(404).json({ error: 'Watch not found.' });
    }

    const {
      name,
      brand,
      factory,
      audience,
      priceUSD,
      priceAED,
      url,
      image,
      thumbnail,
      images,
      movement,
      casing,
      bezel,
      glass,
      waterResistance,
      description,
      features,
      inStock,
      isVisible,
      model,
      reference,
      material,
      size,
      caliber,
      warranty
    } = req.body;

    if (audience) {
      if (audience === 'Womens' || audience === 'Ladies') {
        watch.audience = 'Womens';
      } else {
        watch.audience = 'Mens';
      }
    }

    watch.name = name || watch.name;
    watch.brand = brand || watch.brand;
    watch.factory = factory || watch.factory;
    watch.priceUSD = priceUSD || watch.priceUSD;
    watch.priceAED = priceAED || watch.priceAED;
    watch.url = url !== undefined ? url : watch.url;
    watch.image = image || watch.image;
    watch.thumbnail = thumbnail !== undefined ? thumbnail : (image ? image : watch.thumbnail);
    watch.images = images !== undefined ? images : (image ? [image] : watch.images);
    watch.movement = movement || watch.movement;
    watch.casing = casing || watch.casing;
    watch.bezel = bezel || watch.bezel;
    watch.glass = glass || watch.glass;
    watch.waterResistance = waterResistance || watch.waterResistance;
    watch.description = description || watch.description;
    watch.features = features || watch.features;
    watch.inStock = inStock !== undefined ? inStock : watch.inStock;
    watch.isVisible = isVisible !== undefined ? isVisible : watch.isVisible;
    watch.model = model !== undefined ? model : watch.model;
    watch.reference = reference !== undefined ? reference : watch.reference;
    watch.material = material !== undefined ? material : watch.material;
    watch.size = size !== undefined ? size : watch.size;
    watch.caliber = caliber !== undefined ? caliber : watch.caliber;
    watch.warranty = warranty !== undefined ? warranty : watch.warranty;

    await populateProductArabicFields(watch);
    await watch.save();
    return res.status(200).json({ message: 'Watch specs updated successfully.', product: watch });
  } catch (err) {
    console.error('PUT /api/products/:id error:', err);
    return res.status(500).json({ error: 'Server error updating watch specs.' });
  }
});

app.patch('/api/admin/products/:id/visibility', auth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    if (typeof req.body.isVisible !== 'boolean') {
      return res.status(400).json({ error: 'isVisible must be true or false.' });
    }

    const product = await Product.findOneAndUpdate(
      { id: productId },
      { $set: { isVisible: req.body.isVisible } },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Watch not found.' });
    }

    return res.status(200).json({
      message: req.body.isVisible
        ? 'Watch is now visible on the storefront.'
        : 'Watch is now hidden from the storefront.',
      product: withAudience(product),
    });
  } catch (err) {
    console.error('PATCH /api/admin/products/:id/visibility error:', err);
    return res.status(500).json({ error: 'Server error updating storefront visibility.' });
  }
});

// 6. Delete watch
app.delete('/api/products/:id', auth, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const result = await Product.findOneAndDelete({ id: productId });
    if (!result) {
      return res.status(404).json({ error: 'Watch model not found.' });
    }
    return res.status(200).json({ message: 'Watch deleted successfully from catalogue.' });
  } catch (err) {
    console.error('DELETE /api/products/:id error:', err);
    return res.status(500).json({ error: 'Server error deleting product.' });
  }
});

// 7. Image proxy to bypass CORS for white background removal
app.get('/api/proxy-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    if (!imageUrl) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    if (!imageUrl.startsWith('https://dubaiwatchstores.com/')) {
      return res.status(400).json({ error: 'Untrusted image source' });
    }

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch image');
    }

    const contentType = response.headers.get('content-type');
    res.setHeader('Content-Type', contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    const buffer = Buffer.from(await response.arrayBuffer());
    return res.send(buffer);
  } catch (err) {
    console.error('Image proxy error:', err);
    return res.status(500).send('Server error proxying image');
  }
});

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`T24 Watches Express Server running on port ${PORT}`);
  });
}

export default app;
