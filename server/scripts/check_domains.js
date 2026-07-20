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
  const products = await Product.find({});
  
  const domains = {};
  let dubaiCount = 0;
  let tickerCount = 0;
  let otherCount = 0;
  
  for (const p of products) {
    if (p.image) {
      try {
        const url = new URL(p.image);
        let targetUrl = url.searchParams.get('url') || p.image;
        const targetDomain = new URL(targetUrl).hostname;
        domains[targetDomain] = (domains[targetDomain] || 0) + 1;
        if (targetDomain.includes('dubaiwatchstores.com')) {
          dubaiCount++;
        } else if (targetDomain.includes('ticker24watches.com')) {
          tickerCount++;
        } else {
          otherCount++;
        }
      } catch (e) {
        domains['invalid'] = (domains['invalid'] || 0) + 1;
      }
    } else {
      domains['none'] = (domains['none'] || 0) + 1;
    }
  }
  
  console.log('Image Domains Distribution:');
  console.log(domains);
  console.log(`Dubai Watch Stores count: ${dubaiCount}`);
  console.log(`Ticker 24 Watches count: ${tickerCount}`);
  console.log(`Other count: ${otherCount}`);
  
  process.exit(0);
}

check();
