import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to load from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

async function syncProducts() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('Error: MONGO_URI is missing from server/.env environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully.');

    // Clear only Product collection
    console.log('Clearing existing products from the database...');
    await Product.deleteMany({});
    console.log('Product collection cleared.');

    // Load scraped products from root
    const rootProductsPath = path.join(__dirname, '../../scraped_products.json');
    if (!fs.existsSync(rootProductsPath)) {
      throw new Error(`scraped_products.json not found at ${rootProductsPath}`);
    }

    console.log('Loading scraped products...');
    const productsData = JSON.parse(fs.readFileSync(rootProductsPath, 'utf8'));
    console.log(`Found ${productsData.length} products to import.`);

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
        .replace(/\b(Clean|VSF|3K|BTF|ZF|PPF|OMF|APS|ARF|Noob)\s+Factory\b/gi, 'Swiss Edition')
        .replace(/\b(Clean|VSF|3K|BTF|ZF|PPF|OMF|APS|ARF|Noob)\b/gi, 'Swiss')
        .replace(/\bfactory\b/gi, 'Edition')
        .replace(/swiss\s+clone/gi, 'master copy')
        .replace(/swiss\s+clones/gi, 'master copies')
        .replace(/mirror\s+copy/gi, 'master copy')
        .replace(/mirror\s+copies/gi, 'master copies');
    };

    const formattedProducts = productsData.map(item => {
      const parsed = parseSpecsFromDescription(item.description, item);
      
      const rawFactory = item.factory || 'Custom Factory';
      let cleanedFactory = cleanBrandingText(rawFactory);
      if (cleanedFactory.toLowerCase() === 'custom factory' || cleanedFactory.toLowerCase() === 'factory' || !cleanedFactory) {
        cleanedFactory = 'Swiss Precision';
      }

      return {
        id: item.id,
        name: cleanBrandingText(item.name),
        brand: item.brand,
        audience: item.audience === 'Ladies' ? 'Womens' : 'Mens',
        factory: cleanedFactory,
        priceUSD: item.priceUSD || '$1,490.00',
        priceAED: item.priceAED || 'AED 5,468',
        url: item.url || '',
        image: item.image,
        thumbnail: item.thumbnail || item.image || '',
        images: item.images || [item.image],
        movement: cleanBrandingText(parsed.movement || item.movement || 'Clone Caliber Swiss movement'),
        casing: cleanBrandingText(parsed.material || item.casing || '904L anti-corrosive stainless steel casing'),
        bezel: cleanBrandingText(item.bezel || 'Hand-finished structural bezel'),
        glass: cleanBrandingText(item.glass || 'Ultra-clear sapphire glass with anti-scratch'),
        waterResistance: cleanBrandingText(item.waterResistance || '50m waterproof vacuum tested'),
        description: cleanBrandingText(item.description || `Superb execution of the iconic ${item.name}.`),
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
      };
    });

    console.log('Inserting products into database...');
    await Product.insertMany(formattedProducts);
    console.log(`Successfully seeded ${formattedProducts.length} watches.`);

    await mongoose.connection.close();
    console.log('Synchronization completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during synchronization:', error);
    process.exit(1);
  }
}

syncProducts();
