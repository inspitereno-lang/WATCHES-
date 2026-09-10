import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({ id: { $gte: 145, $lte: 158 } }).sort({ id: 1 });
  console.log(`Verified ${products.length} new products in MongoDB:`);
  for (const p of products) {
    console.log(`ID ${p.id}: "${p.name}" | Audience: ${p.audience} | Ref: ${p.reference} | Price USD: "${p.priceUSD}" | Price AED: "${p.priceAED}" | Images: ${p.images.length}`);
    console.log(`  Banner: ${p.image}`);
  }

  const imagesInFiles = fs.readdirSync('c:/Users/hp/Downloads/app 8/app 8/images in').filter(f => f.startsWith('patek_philippe_'));
  console.log(`\nTotal Patek images in "images in": ${imagesInFiles.length}`);

  const remaining = fs.readdirSync('c:/Users/hp/Downloads/app 8/app 8/images_all/watch');
  console.log(`Remaining in "images_all/watch":`, remaining);

  await mongoose.disconnect();
}

run();
