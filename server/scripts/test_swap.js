import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function testSwap() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({ image: /dubaiwatchstores\.com/ });
  console.log(`Found ${products.length} products with dubaiwatchstores.com images.`);

  const samples = products.slice(0, 10);
  for (const p of samples) {
    const originalUrl = p.image;
    // Replace dubaiwatchstores.com with ticker24watches.com
    const swappedUrl = originalUrl.replace(/dubaiwatchstores\.com/g, 'ticker24watches.com');
    
    try {
      const res = await fetch(swappedUrl, { method: 'HEAD' });
      console.log(`Product ID: ${p.id}`);
      console.log(`Original: ${originalUrl}`);
      console.log(`Swapped:  ${swappedUrl}`);
      console.log(`Status code: ${res.status}`);
      console.log('---');
    } catch (e) {
      console.log(`Product ID: ${p.id} Error: ${e.message}`);
      console.log('---');
    }
  }
  process.exit(0);
}

testSwap();
