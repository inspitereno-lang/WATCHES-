import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({ brand: 'Richard Mille' });
  console.log(`Found ${products.length} Richard Mille products.`);
  
  for (const p of products) {
    if (p.image && p.image.includes('ticker24watches.com')) {
      console.log(`ID: ${p.id} | Name: ${p.name} | Image: ${p.image}`);
    }
  }
  
  process.exit(0);
}

check();
