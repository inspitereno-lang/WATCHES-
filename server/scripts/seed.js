import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Homepage from '../models/Homepage.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to load from one level up (server/.env)
dotenv.config({ path: path.join(__dirname, '../.env') });

async function seed() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('Error: MONGO_URI is missing from server/.env environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully.');

    // Clear existing collections
    console.log('Clearing existing collections...');
    await Product.deleteMany({});
    await Homepage.deleteMany({});
    await User.deleteMany({});
    console.log('Collections cleared.');

    // Load scraped products from root
    const rootProductsPath = path.join(__dirname, '../../scraped_products.json');
    if (!fs.existsSync(rootProductsPath)) {
      throw new Error(`scraped_products.json not found at ${rootProductsPath}`);
    }

    console.log('Loading scraped products...');
    const productsData = JSON.parse(fs.readFileSync(rootProductsPath, 'utf8'));
    console.log(`Found ${productsData.length} products to import.`);

    const formattedProducts = productsData.map(item => ({
      id: item.id,
      name: item.name,
      brand: item.brand,
      factory: item.factory || 'Custom Factory',
      priceUSD: item.priceUSD || '$1,490.00',
      priceAED: item.priceAED || 'AED 5,468',
      url: item.url || '',
      image: item.image,
      movement: item.movement || 'Clone Caliber Swiss movement',
      casing: item.casing || '904L anti-corrosive stainless steel casing',
      bezel: item.bezel || 'Hand-finished structural bezel',
      glass: item.glass || 'Ultra-clear sapphire glass with anti-scratch',
      waterResistance: item.waterResistance || '50m waterproof vacuum tested',
      description: item.description || `Superb execution of the iconic ${item.name}.`,
      features: item.features || [
        "1:1 original weight & alignments",
        "Sweeping second hand matching Swiss sweep speeds",
        "Super-LumiNova elements"
      ],
      inStock: true
    }));

    console.log('Inserting products into database...');
    await Product.insertMany(formattedProducts);
    console.log(`Successfully seeded ${formattedProducts.length} watches.`);

    // Insert Default Homepage Section copy
    console.log('Inserting default homepage copy settings...');
    await Homepage.create({});
    console.log('Default homepage configuration seeded.');

    // Seed default admin account
    console.log('Creating default administrator account...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin12345', salt);
    await User.create({
      username: 'admin',
      email: 'admin@t24watches.com',
      passwordHash: passwordHash
    });
    console.log('Admin user created successfully (username: admin, password: admin12345).');

    console.log('Seeding process finished successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding database:', error);
    process.exit(1);
  }
}

seed();
