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

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas successfully.'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

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
      watchLabelLine4: settings.heroWatchLabelLine4
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
    return res.status(200).json(settings);
  } catch (err) {
    console.error('GET /api/homepage error:', err);
    return res.status(500).json({ error: 'Server error fetching homepage data.' });
  }
});

// 2. Fetch Catalogue (supports brand pills filter, query search, pagination)
app.get('/api/products', async (req, res) => {
  try {
    const { brand, search, page = 1, limit = 6 } = req.query;
    const query = {};

    if (brand && brand !== 'ALL BRANDS') {
      query.brand = new RegExp('^' + brand + '$', 'i');
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { factory: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    const currentPage = parseInt(page);
    const itemLimit = parseInt(limit);
    const skip = (currentPage - 1) * itemLimit;

    const totalItems = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ id: -1 }) // Sort by ID descending
      .skip(skip)
      .limit(itemLimit);

    return res.status(200).json({
      products,
      pagination: {
        currentPage,
        totalPages: Math.ceil(totalItems / itemLimit),
        totalItems,
      }
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
    return res.status(200).json(watch);
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
      inStock
    } = req.body;

    if (!name || !brand || !factory || !priceUSD || !priceAED || !image || !movement || !description) {
      return res.status(400).json({ error: 'Please enter all required catalogue fields.' });
    }

    // Get the maximum custom product id to increment
    const maxWatch = await Product.findOne().sort({ id: -1 });
    const nextId = maxWatch ? maxWatch.id + 1 : 100;

    const newProduct = new Product({
      id: nextId,
      name,
      brand,
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
      inStock: inStock !== undefined ? inStock : true
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
      inStock
    } = req.body;

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
