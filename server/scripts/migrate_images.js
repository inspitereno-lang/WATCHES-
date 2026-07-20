import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

function normalizeName(name) {
  if (!name) return [];
  return name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => {
      const isNoise = [
        'replica', 'automatic', 'watch', 'watches', 'gold', 'rose', 'carbon', 
        'titanium', 'edition', 'steel', 'casing', 'bezel', 'glass', 'water', 
        'resistance', 'dial', 'mens', 'womens', 'gents', 'ladies', 'quality', 
        'mirror', 'copy', 'clones', 'clone', 'luxury', 'brand', 'design', 'version',
        'super', 'best', 'new', 'premium', 'high', 'quality', 'with', 'and', 'the'
      ].includes(word);
      return word.length > 1 && !isNoise;
    });
}

async function runMigration() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Fetch live products from ticker24watches API
    console.log('Fetching live products from ticker24watches.com...');
    let tickerProducts = [];
    let page = 1;
    while (true) {
      const url = `https://ticker24watches.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
      try {
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        if (!res.ok) break;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;
        tickerProducts = tickerProducts.concat(data);
        page++;
      } catch (e) {
        console.error('Fetch error on page', page, ':', e.message);
        break;
      }
    }
    console.log(`Fetched ${tickerProducts.length} live products from ticker24watches.`);

    // 2. Fetch products in DB that have dubaiwatchstores images
    const dbProducts = await Product.find({ image: /dubaiwatchstores\.com/ });
    console.log(`Found ${dbProducts.length} database products with dubaiwatchstores images to update.`);

    let updatedCount = 0;

    for (const dbP of dbProducts) {
      const dbPWords = normalizeName(dbP.name);
      const dbBrand = dbP.brand ? dbP.brand.toLowerCase() : '';
      
      let bestMatch = null;
      let maxOverlap = 0;

      for (const tickerP of tickerProducts) {
        // Must match brand first
        const tickerPNameLower = tickerP.name.toLowerCase();
        if (dbBrand && !tickerPNameLower.includes(dbBrand)) {
          continue;
        }

        const tickerPWords = normalizeName(tickerP.name);
        
        // Calculate intersection size
        const intersection = dbPWords.filter(w => tickerPWords.includes(w));
        const overlap = intersection.length;

        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          bestMatch = tickerP;
        }
      }

      if (bestMatch && maxOverlap >= 1) {
        let imgUrl = bestMatch.images[0]?.src || '';
        if (imgUrl) {
          if (!imgUrl.includes('weserv.nl')) {
            imgUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imgUrl)}`;
          }
          
          dbP.image = imgUrl;
          await dbP.save();
          updatedCount++;
          console.log(`[${updatedCount}/${dbProducts.length}] Updated ID: ${dbP.id} | ${dbP.name} -> Matched: ${bestMatch.name}`);
        }
      } else {
        // Safe fallback image for each brand if no direct match is found
        const fallbackImages = {
          'Rolex': 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2024%2F07%2FIMG_5432-scaled.jpeg',
          'Patek Philippe': 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F03%2FIMG_2241-scaled.webp',
          'Audemars Piguet': 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F03%2FIMG_3354-scaled.webp',
          'Richard Mille': 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2025%2F11%2FIMG_4155-scaled.webp',
          'Hublot': 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F02%2FIMG_1043-scaled.webp',
          'Cartier': 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2024%2F10%2FIMG_9149.webp'
        };

        const brandKey = dbP.brand || 'Rolex';
        const fallbackUrl = fallbackImages[brandKey] || fallbackImages['Rolex'];
        
        dbP.image = fallbackUrl;
        await dbP.save();
        updatedCount++;
        console.log(`[${updatedCount}/${dbProducts.length}] Updated ID: ${dbP.id} | ${dbP.name} -> FALLBACK Brand Image Used (${brandKey})`);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} products in MongoDB database.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
