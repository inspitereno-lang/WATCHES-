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
      { name: 'Faisal (Senior Concierge)', number: '971501234567', isActive: true, isFeatured: true },
      { name: 'Marcus (Support Desk)', number: '971507654321', isActive: true, isFeatured: false }
    ];
  }
  return settings;
};

// Connect to MongoDB Atlas (use separate test DB during test runs)
let dbUri = process.env.MONGO_URI;
if (process.env.NODE_ENV === 'test' && dbUri) {
  dbUri = dbUri.replace('/t24watches', '/t24watches_test');
}
mongoose.connect(dbUri)
  .then(() => console.log(`Connected to MongoDB successfully (${process.env.NODE_ENV === 'test' ? 'TEST' : 'PRODUCTION'} DB).`))
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
    return res.status(200).json({
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
    });
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
    if (req.query.lang === 'ar') {
      data = await translateHomepage(settings, 'ar');
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

async function translateText(text, to = 'ar') {
  if (!text || typeof text !== 'string') return text;
  if (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/') || text.includes('/upload/')) {
    return text;
  }
  const cacheKey = `${to}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey);
  }
  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${to}&dt=t&q=${encodeURIComponent(text)}`);
    if (!response.ok) return text;
    const data = await response.json();
    const translatedText = data[0].map(item => item[0]).join('');
    translationCache.set(cacheKey, translatedText);
    return translatedText;
  } catch (err) {
    console.error('Translation helper error:', err);
    return text;
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
      label: await translateText(item.label, to),
      value: await translateText(item.value, to)
    })));
  }

  if (Array.isArray(plain.footerLinks)) {
    plain.footerLinks = await Promise.all(plain.footerLinks.map(async (item) => ({
      ...item,
      label: await translateText(item.label, to)
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

// 2. Fetch Catalogue (supports brand/category pills filter, query search, pagination)
app.get('/api/products', async (req, res) => {
  try {
    const { brand, audience, search, model, page = 1, limit = 6 } = req.query;
    const query = {};
    const andConditions = [];

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
    const countsQueryAll = {};
    const countsQueryLadies = { audience: { $in: ['Ladies', 'Womens'] } };
    const countsQueryGents = { audience: { $in: ['Gents', 'Mens'] } };

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

// 3. Fetch specific watch details
app.get('/api/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const watch = await Product.findOne({ id: productId });
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

    // Stream upload buffer to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 't24_watches_catalogue' },
      (error, result) => {
        if (error) {
          console.error('Cloudinary stream upload error:', error);
          return res.status(500).json({ error: 'Failed to upload image file to Cloudinary CDN.' });
        }
        return res.status(200).json({ url: result.secure_url });
      }
    );

    uploadStream.end(req.file.buffer);
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
      movement,
      casing,
      bezel,
      glass,
      waterResistance,
      description,
      features,
      inStock,
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
      movement,
      casing: casing || '904L anti-corrosive stainless steel casing',
      bezel: bezel || 'Hand-finished structural bezel',
      glass: glass || 'Ultra-clear sapphire glass with anti-scratch',
      waterResistance: waterResistance || '50m waterproof vacuum tested',
      description,
      features: features || [],
      inStock: inStock !== undefined ? inStock : true,
      model: model || '',
      reference: reference || '',
      material: material || '',
      size: size || '',
      caliber: caliber || '',
      warranty: warranty || '2-Year Service Warranty'
    });

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
      movement,
      casing,
      bezel,
      glass,
      waterResistance,
      description,
      features,
      inStock,
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
    watch.movement = movement || watch.movement;
    watch.casing = casing || watch.casing;
    watch.bezel = bezel || watch.bezel;
    watch.glass = glass || watch.glass;
    watch.waterResistance = waterResistance || watch.waterResistance;
    watch.description = description || watch.description;
    watch.features = features || watch.features;
    watch.inStock = inStock !== undefined ? inStock : watch.inStock;
    watch.model = model !== undefined ? model : watch.model;
    watch.reference = reference !== undefined ? reference : watch.reference;
    watch.material = material !== undefined ? material : watch.material;
    watch.size = size !== undefined ? size : watch.size;
    watch.caliber = caliber !== undefined ? caliber : watch.caliber;
    watch.warranty = warranty !== undefined ? warranty : watch.warranty;

    await watch.save();
    return res.status(200).json({ message: 'Watch specs updated successfully.', product: watch });
  } catch (err) {
    console.error('PUT /api/products/:id error:', err);
    return res.status(500).json({ error: 'Server error updating watch specs.' });
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

// Start listening
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`T24 Watches Express Server running on port ${PORT}`);
  });
}

export default app;
