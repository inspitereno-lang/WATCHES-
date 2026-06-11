import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Homepage from '../models/Homepage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const heroWatchCloudinary = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171809/t24_watches_defaults/eehkzalmujmziwekwq9a.png';
const heritageCloudinary = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171811/t24_watches_defaults/igkoymjeabkrvpmjcx3o.jpg';
const contactUsCloudinary = 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171812/t24_watches_defaults/hk3mfvm17mljab3czc5h.jpg';

async function migrate() {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      console.error('Error: MONGO_URI is missing from environment.');
      process.exit(1);
    }

    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully.');

    let settings = await Homepage.findOne();
    if (!settings) {
      console.log('No homepage settings document found. Creating one...');
      settings = new Homepage({});
    }

    console.log('Current DB values:');
    console.log('heroWatchImageUrl:', settings.heroWatchImageUrl);
    console.log('heritageImage:', settings.heritageImage);
    console.log('footerContactImage:', settings.footerContactImage);

    // Update old static defaults to Cloudinary URLs
    if (!settings.heroWatchImageUrl || settings.heroWatchImageUrl === '/hero-watch.png') {
      settings.heroWatchImageUrl = heroWatchCloudinary;
    }
    if (!settings.heritageImage || settings.heritageImage === '/heritage-watchmaker.jpg') {
      settings.heritageImage = heritageCloudinary;
    }
    if (!settings.footerContactImage || settings.footerContactImage === '/swiss-alps.jpg') {
      settings.footerContactImage = contactUsCloudinary;
    }

    await settings.save();
    console.log('\nMigration completed successfully! New DB values:');
    console.log('heroWatchImageUrl:', settings.heroWatchImageUrl);
    console.log('heritageImage:', settings.heritageImage);
    console.log('footerContactImage:', settings.footerContactImage);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
