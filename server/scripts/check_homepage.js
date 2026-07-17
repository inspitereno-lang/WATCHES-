import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Homepage from '../models/Homepage.js';

dotenv.config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const home = await Homepage.findOne({});
  console.log('NEW ARRIVALS:');
  console.log(JSON.stringify(home.newArrivals, null, 2));
  console.log('CRAFTSMANSHIP IMAGES:');
  console.log(JSON.stringify(home.craftsmanshipImages, null, 2));
  process.exit(0);
}

check();
