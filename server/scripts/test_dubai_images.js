import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({ image: /dubaiwatchstores\.com/ });
  console.log(`Found ${products.length} products with dubaiwatchstores.com images.`);
  
  // Test the first 10 products
  const toTest = products.slice(0, 10);
  const results = [];
  
  await Promise.all(toTest.map(async (p) => {
    try {
      // Append a random parameter to bypass cache correctly
      const separator = p.image.includes('?') ? '&' : '?';
      const testUrl = `${p.image}${separator}test_nocache=${Math.random()}`;
      const res = await fetch(testUrl, { method: 'GET' });
      results.push({
        id: p.id,
        name: p.name,
        originalImage: p.image,
        thumbnail: p.thumbnail,
        proxyStatus: res.status
      });
    } catch (e) {
      results.push({
        id: p.id,
        name: p.name,
        originalImage: p.image,
        thumbnail: p.thumbnail,
        error: e.message
      });
    }
  }));
  
  console.log('Results of first 20 products:');
  console.log(JSON.stringify(results, null, 2));
  
  const successes = results.filter(r => r.proxyStatus === 200).length;
  console.log(`Success rate on test: ${successes}/${results.length}`);
  
  process.exit(0);
}

check();
