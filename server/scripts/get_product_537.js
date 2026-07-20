import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const p = await Product.findOne({ id: 537 });
  console.log('PRODUCT 537:');
  console.log(JSON.stringify(p, null, 2));
  process.exit(0);
}

check();
