import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Homepage from './models/Homepage.js';

dotenv.config({ path: './.env' });

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing from server/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB successfully.');

  let settings = await Homepage.findOne();
  if (!settings) {
    settings = new Homepage({});
  }

  settings.testimonials = [
    {
      id: 1,
      name: 'Fahad Al-Mansoori',
      location: 'Dubai Marina, UAE',
      role: 'Watch Collector',
      watchBought: 'Rolex Daytona Panda',
      rating: 5,
      quote: 'Absolutely mind-blowing. I own a genuine Datejust, but I wanted a Daytona for daily wear without the risk. The weight, bezel luster, and mechanical chronograph sweep are identical. Hand-delivered in Dubai within 4 hours!',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Lucas Sterling',
      location: 'London, UK',
      role: 'Finance Director',
      watchBought: 'Patek Philippe Nautilus 5711',
      rating: 5,
      quote: 'I was skeptical about the 8.3mm thickness, but the proportions are excellent. It fits beautifully on wrist. The blue-grey gradient dial shifts beautifully in direct light. Direct WhatsApp ordering was fast and smooth.',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Sarah Jenkins',
      location: 'Los Angeles, USA',
      role: 'Creative Director',
      watchBought: 'Rolex Datejust 41 Wimbledon',
      rating: 5,
      quote: 'The Wimbledon slate Roman dial is a masterpiece of precision. The fluted bezel catches light beautifully. Incredible premium customer service from their Dubai desk!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Khalid Bin-Fahd',
      location: 'Riyadh, Saudi Arabia',
      role: 'Business Owner',
      watchBought: 'Audemars Piguet Royal Oak 15500',
      rating: 5,
      quote: 'Unbelievable craftsmanship on the brushed stainless steel bracelet. The links slide smoothly without any friction, catching light beautifully. Fast courier delivery to Riyadh. Recommended 100%!',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 5,
      name: 'Jean-Pierre Moreau',
      location: 'Geneva, Switzerland',
      role: 'Horological Enthusiast',
      watchBought: 'Vacheron Constantin Overseas',
      rating: 5,
      quote: 'Living in Geneva, I appreciate quality watchmaking. The Maltese Cross bezel finish and the quick-release steel strap mechanism work exactly like the original. Truly exceptional copy quality.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 6,
      name: 'Amara Okafor',
      location: 'Lagos, Nigeria',
      role: 'Art Director',
      watchBought: 'AP Royal Oak Double Balance Wheel',
      rating: 5,
      quote: 'The skeleton dial is breathtaking. You can see the double balance wheels beating in perfect synchronization. The gold plating color is exceptionally rich and heavy. Exceeded all expectations!',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
    }
  ];

  await settings.save();
  console.log('Successfully saved updated testimonials in the DB.');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
