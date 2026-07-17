import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Homepage from '../models/Homepage.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const heroWatchCloudinary = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171809/t24_watches_defaults/eehkzalmujmziwekwq9a.png';
const heritageCloudinary = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171811/t24_watches_defaults/igkoymjeabkrvpmjcx3o.jpg';
const contactUsCloudinary = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171812/t24_watches_defaults/hk3mfvm17mljab3czc5h.jpg';
const architectureImage = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp';

const oldHeroTitles = ['THE ART OF | SWISS CLONES', 'THE ART OF 1:1 SWISS CLONES', 'SWISS | CLONES'];

async function migrate() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('Error: MONGO_URI is missing from environment.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully.');

    let settings = await Homepage.findOne();
    if (!settings) {
      console.log('No homepage settings document found. Creating one...');
      settings = new Homepage({});
    }

    console.log('Current DB values:');
    console.log('heroWatchImageUrl:', settings.heroWatchImageUrl);
    console.log('heritageImage:', settings.heritageImage);
    console.log('architectureImage:', settings.architectureImage);
    console.log('footerContactImage:', settings.footerContactImage);

    if (!settings.heroTitle || oldHeroTitles.includes(settings.heroTitle)) {
      settings.heroTitle = 'SWISS | PRECISION';
    }
    if (!settings.heroCtaLabel || settings.heroCtaLabel === 'EXPLORE THE CATALOGUE') {
      settings.heroCtaLabel = 'VIEW COLLECTION';
    }
    
    // Always enforce/migrate the new USPs stats
    settings.heroStats = [
      { value: 'FREE', label: 'Same-day delivery' },
      { value: '2 YR', label: 'Service warranty' },
      { value: 'COD', label: 'Multiple payments' }
    ];

    if (settings.heroSubtitleDesc && settings.heroSubtitleDesc.includes('mirror copy')) {
      settings.heroSubtitleDesc = settings.heroSubtitleDesc.replace(/mirror copy/gi, 'master copy');
    }
    if (settings.heritageDesc3 && settings.heritageDesc3.includes('mirror copy')) {
      settings.heritageDesc3 = settings.heritageDesc3.replace(/mirror copy/gi, 'master copy');
    }

    // Update old static defaults to Cloudinary URLs
    if (!settings.heroWatchImageUrl || settings.heroWatchImageUrl === '/hero-watch.png') {
      settings.heroWatchImageUrl = heroWatchCloudinary;
    }
    if (!settings.heritageImage || settings.heritageImage === '/heritage-watchmaker.jpg') {
      settings.heritageImage = heritageCloudinary;
    }
    if (!settings.architectureHeading1) {
      settings.architectureHeading1 = 'ARCHITECTURE';
    }
    if (!settings.architectureHeading2) {
      settings.architectureHeading2 = 'OF TIME';
    }
    if (!settings.architectureSubhead) {
      settings.architectureSubhead = 'CASE, DIAL, MOVEMENT';
    }
    if (!settings.architectureDesc) {
      settings.architectureDesc = 'Discover the best copy watches and super clone watches in Dubai, crafted with replica-watch detailing, refined case architecture, exposed movement depth, and polished gold finishing for collectors seeking premium replica watches in Dubai.';
    }
    if (!settings.architectureImage || settings.architectureImage === '/watch-architecture.webp' || settings.architectureImage === heritageCloudinary || settings.architectureImage === settings.heritageImage) {
      settings.architectureImage = architectureImage;
    }
    if (!settings.architectureImageAlt) {
      settings.architectureImageAlt = 'Watchmaker assembling a gold skeleton watch movement';
    }
    if (!settings.footerContactImage || settings.footerContactImage === '/swiss-alps.jpg') {
      settings.footerContactImage = contactUsCloudinary;
    }

    if (!settings.footerCopyright || settings.footerCopyright.includes('Swiss Clone')) {
      settings.footerCopyright = '© 2026 T24 Watches Dubai. All rights reserved. Premium 1:1 Master Copy replica timepieces.';
    }
    if (!settings.footerWhatsAppMessage || settings.footerWhatsAppMessage.includes('Swiss Clone')) {
      settings.footerWhatsAppMessage = 'Hi T24 Watches! I\'m visiting your website and would like to inquire about your premium 1:1 Master Copy watch collection.';
    }

    await settings.save();
    console.log('\nMigration of Homepage completed successfully!');

    // Clean all products in database
    console.log('Cleaning products in database...');
    const products = await Product.find();
    console.log(`Found ${products.length} products to clean.`);
    
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

    let updatedCount = 0;
    for (const p of products) {
      let isChanged = false;
      
      const newName = cleanText(p.name);
      if (newName !== p.name) { p.name = newName; isChanged = true; }
      
      const newDesc = cleanText(p.description);
      if (newDesc !== p.description) { p.description = newDesc; isChanged = true; }

      const rawFactory = p.factory || 'Custom Factory';
      let newFactory = cleanText(rawFactory);
      if (newFactory.toLowerCase() === 'custom factory' || newFactory.toLowerCase() === 'factory' || !newFactory) {
        newFactory = 'Swiss Precision';
      }
      if (newFactory !== p.factory) { p.factory = newFactory; isChanged = true; }

      const newMovement = cleanText(p.movement);
      if (newMovement !== p.movement) { p.movement = newMovement; isChanged = true; }

      const newCasing = cleanText(p.casing);
      if (newCasing !== p.casing) { p.casing = newCasing; isChanged = true; }

      const newBezel = cleanText(p.bezel);
      if (newBezel !== p.bezel) { p.bezel = newBezel; isChanged = true; }

      const newGlass = cleanText(p.glass);
      if (newGlass !== p.glass) { p.glass = newGlass; isChanged = true; }

      const newModel = cleanText(p.model);
      if (newModel !== p.model) { p.model = newModel; isChanged = true; }

      const newRef = cleanText(p.reference);
      if (newRef !== p.reference) { p.reference = newRef; isChanged = true; }

      const newMaterial = cleanText(p.material);
      if (newMaterial !== p.material) { p.material = newMaterial; isChanged = true; }

      const newCaliber = cleanText(p.caliber);
      if (newCaliber !== p.caliber) { p.caliber = newCaliber; isChanged = true; }

      if (p.features && p.features.length > 0) {
        const newFeatures = p.features.map(f => cleanText(f));
        if (JSON.stringify(newFeatures) !== JSON.stringify(p.features)) {
          p.features = newFeatures;
          isChanged = true;
        }
      }

      if (isChanged) {
        await p.save();
        updatedCount++;
      }
    }
    console.log(`Cleaned ${updatedCount} products in database.`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
