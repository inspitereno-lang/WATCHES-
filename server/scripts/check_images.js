import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const products = await Product.find({});
    console.log(`Checking ${products.length} products...`);
    
    const broken = [];
    
    for (const p of products) {
      // Clean up the URL: if it uses the weserv proxy, extract the actual url or test the proxy url
      let imgUrl = p.image;
      if (!imgUrl) {
        broken.push({ id: p.id, name: p.name, reason: 'No image URL' });
        continue;
      }
      
      try {
        const res = await fetch(imgUrl, { method: 'GET', headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (res.status !== 200) {
          broken.push({ id: p.id, name: p.name, image: imgUrl, status: res.status });
        }
      } catch (err) {
        broken.push({ id: p.id, name: p.name, image: imgUrl, error: err.message });
      }
    }
    
    console.log('\n--- BROKEN IMAGES ---');
    console.log(JSON.stringify(broken, null, 2));
    console.log(`Total broken: ${broken.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during check:', error);
    process.exit(1);
  }
}

check();
