import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function run() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('Error: MONGO_URI is missing from server/.env environment variables.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('Connected.');

    const countBefore = await Product.countDocuments({});
    console.log(`Current products in database: ${countBefore}`);

    if (countBefore > 0) {
      console.log('Deleting all products...');
      const result = await Product.deleteMany({});
      console.log(`Deleted ${result.deletedCount} products.`);
    } else {
      console.log('No products found to delete.');
    }

    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error deleting products:', err);
    process.exit(1);
  }
}

run();
