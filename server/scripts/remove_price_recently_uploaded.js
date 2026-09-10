import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { MONGO_URI } = process.env;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in server/.env');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find the recently uploaded Patek Philippe products (IDs 124 through 144)
    const recentProducts = await Product.find({
      brand: 'Patek Philippe',
      id: { $gte: 124, $lte: 144 }
    }).sort({ id: 1 });

    console.log(`Found ${recentProducts.length} recently uploaded products to update:`);
    for (const p of recentProducts) {
      console.log(`ID ${p.id}: "${p.name}" | Current priceUSD: "${p.priceUSD}" | Current priceAED: "${p.priceAED}"`);
    }

    if (recentProducts.length === 0) {
      console.log('No matching products found!');
      process.exit(0);
    }

    // Update only these products
    const result = await Product.updateMany(
      {
        brand: 'Patek Philippe',
        id: { $gte: 124, $lte: 144 }
      },
      {
        $set: {
          priceUSD: '',
          priceAED: ''
        }
      }
    );

    console.log(`\nUpdated ${result.modifiedCount} products.`);

    // Verify the update
    const verified = await Product.find({
      brand: 'Patek Philippe',
      id: { $gte: 124, $lte: 144 }
    }).sort({ id: 1 });

    console.log('\nVerification of updated products:');
    for (const p of verified) {
      console.log(`ID ${p.id}: "${p.name}" | priceUSD: "${p.priceUSD}" | priceAED: "${p.priceAED}"`);
    }

    // Check that other products were NOT touched
    const otherSample = await Product.find({
      id: { $nin: recentProducts.map(p => p.id) }
    }).limit(3);

    console.log('\nSample of other products (confirming unchanged):');
    for (const p of otherSample) {
      console.log(`ID ${p.id}: "${p.name}" | priceUSD: "${p.priceUSD}" | priceAED: "${p.priceAED}"`);
    }

    console.log('\nDone successfully.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

run();
