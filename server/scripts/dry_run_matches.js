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

async function dryRun() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // 1. Fetch all products from ticker24watches API
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
      console.error(e.message);
      break;
    }
  }
  console.log(`Fetched ${tickerProducts.length} live products from ticker24watches.`);

  // 2. Fetch products in DB that have dubaiwatchstores images
  const dbProducts = await Product.find({ image: /dubaiwatchstores\.com/ });
  console.log(`Found ${dbProducts.length} database products with dubaiwatchstores images.`);

  let matchedCount = 0;
  let unmatchedCount = 0;
  const matchResults = [];

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
      matchedCount++;
      // Get the image URL from weserv proxy format if it's there
      let imgUrl = bestMatch.images[0]?.src || '';
      if (imgUrl && !imgUrl.includes('weserv.nl')) {
        imgUrl = `https://images.weserv.nl/?url=${encodeURIComponent(imgUrl)}`;
      }
      matchResults.push({
        id: dbP.id,
        name: dbP.name,
        brand: dbP.brand,
        matchedName: bestMatch.name,
        overlap: maxOverlap,
        originalImg: dbP.image,
        newImg: imgUrl
      });
    } else {
      unmatchedCount++;
      matchResults.push({
        id: dbP.id,
        name: dbP.name,
        brand: dbP.brand,
        matchedName: null,
        overlap: 0,
        originalImg: dbP.image,
        newImg: null
      });
    }
  }

  console.log(`\nDry Run Matching Results:`);
  console.log(`- Matched: ${matchedCount}`);
  console.log(`- Unmatched: ${unmatchedCount}`);
  
  console.log('\nSample Matched Products:');
  console.log(JSON.stringify(matchResults.filter(r => r.matchedName).slice(0, 10), null, 2));

  console.log('\nSample Unmatched Products:');
  console.log(JSON.stringify(matchResults.filter(r => !r.matchedName).slice(0, 10), null, 2));

  process.exit(0);
}

dryRun();
