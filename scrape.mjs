import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_FILE = path.join(__dirname, 'scraped_products.json')

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&rsquo;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

async function fetchAllProducts(baseUrl) {
  let allProducts = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore && page <= 10) {
    const url = `${baseUrl}?per_page=30&page=${page}`;
    console.log(`Fetching WooCommerce API: ${url}...`);
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (!response.ok) {
        console.warn(`Failed to fetch page ${page} from ${baseUrl}: ${response.status}`);
        hasMore = false;
        break;
      }
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) {
        hasMore = false;
        break;
      }
      allProducts = [...allProducts, ...data];
      page++;
    } catch (err) {
      console.error(`Error fetching page ${page} from ${baseUrl}:`, err.message);
      hasMore = false;
    }
  }
  return allProducts;
}

function formatProduct(p, sourceSite) {
  const name = decodeHtmlEntities(p.name);
  
  // Find brand based on name and categories
  let brand = '';
  const nameLower = name.toLowerCase();
  const categoryNames = (p.categories || []).map(c => c.name.toLowerCase());
  
  if (nameLower.includes('rolex') || categoryNames.some(c => c.includes('rolex'))) {
    brand = 'Rolex';
  } else if (nameLower.includes('patek') || nameLower.includes('nautilus') || nameLower.includes('aquanaut') || categoryNames.some(c => c.includes('patek') || c.includes('nautilus') || c.includes('aquanaut'))) {
    brand = 'Patek Philippe';
  } else if (nameLower.includes('audemars') || nameLower.includes('ap ') || nameLower.includes('royal oak') || categoryNames.some(c => c.includes('audemars') || c.includes('royal oak') || c.includes('ap '))) {
    brand = 'Audemars Piguet';
  } else if (nameLower.includes('richard') || nameLower.includes('rm') || categoryNames.some(c => c.includes('richard') || c.includes('rm'))) {
    brand = 'Richard Mille';
  } else if (nameLower.includes('hublot') || categoryNames.some(c => c.includes('hublot'))) {
    brand = 'Hublot';
  } else if (nameLower.includes('vacheron') || categoryNames.some(c => c.includes('vacheron'))) {
    brand = 'Vacheron Constantin';
  } else if (nameLower.includes('cartier') || categoryNames.some(c => c.includes('cartier'))) {
    brand = 'Cartier';
  } else {
    // Discard non-supported brands
    return null;
  }
  
  // Determine audience (Ladies vs Gents)
  let audience = 'Gents';
  const descText = (p.description || '').toLowerCase();
  const shortDescText = (p.short_description || '').toLowerCase();
  const combinedText = `${nameLower} ${descText} ${shortDescText} ${categoryNames.join(' ')}`;
  
  if (
    combinedText.includes('ladies') || 
    combinedText.includes('lady') || 
    combinedText.includes('women') || 
    combinedText.includes('woman') || 
    combinedText.includes('mini') ||
    combinedText.includes('unisex-watches')
  ) {
    audience = 'Ladies';
  }
  
  // Format Price
  let priceVal = 1490;
  if (p.prices && p.prices.price) {
    const rawPrice = parseFloat(p.prices.price);
    if (rawPrice > 0) {
      // WooCommerce prices are in cents
      priceVal = rawPrice / 100;
    }
  }
  
  if (priceVal < 500) priceVal = 1490;
  if (priceVal > 20000) priceVal = priceVal / 10;
  
  const priceUSD = `$${priceVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const priceAED = `AED ${(priceVal * 3.67).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  
  // Image URL & Proxy
  let image = '';
  if (p.images && p.images.length > 0 && p.images[0].src) {
    image = p.images[0].src;
  } else if (p.thumbnail) {
    image = p.thumbnail;
  }
  
  if (image && !image.includes('weserv.nl')) {
    image = `https://images.weserv.nl/?url=${encodeURIComponent(image)}`;
  }
  
  // Factory classification
  let factory = 'Clean Factory';
  if (brand === 'Audemars Piguet') factory = 'ZF Factory';
  else if (brand === 'Patek Philippe') factory = '3K Factory';
  else if (brand === 'Richard Mille') factory = 'KV Factory';
  else if (brand === 'Vacheron Constantin') factory = 'PPF Factory';
  else if (brand === 'Cartier') factory = 'BV Factory';
  
  // Technical specs
  const movement = `Clone Caliber movement custom-engineered for 1:1 ${brand} sweeps`;
  const casing = '904L anti-corrosive stainless steel casing';
  const bezel = 'Hand-finished structural bezel with genuine texture luster';
  const glass = 'Ultra-clear sapphire glass with anti-scratch and anti-glare finish';
  const waterResistance = '50m waterproof vacuum tested';
  
  const cleanDescription = (p.description || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim() || `Superb execution of the iconic ${name}. Engineered down to the exact millimeter matching weight, sweep frequency, and bezel dimensions seamlessly.`;

  return {
    name,
    brand,
    priceUSD,
    priceAED,
    url: p.permalink || sourceSite,
    image,
    factory,
    audience,
    movement,
    casing,
    bezel,
    glass,
    waterResistance,
    description: cleanDescription.substring(0, 300) + (cleanDescription.length > 300 ? '...' : ''),
    features: ['1:1 original weight & alignments', 'Sweeping second hand matching Swiss sweep speeds', 'Super-LumiNova elements']
  };
}

async function scrapeAll() {
  console.log('Initiating product crawler for WooCommerce REST APIs...');
  
  // 1. Fetch raw products from both sites
  const tickerProductsRaw = await fetchAllProducts('https://ticker24watches.com/wp-json/wc/store/v1/products');
  const dubaiProductsRaw = await fetchAllProducts('https://dubaiwatchstores.com/wp-json/wc/store/v1/products');
  
  console.log(`Fetched raw product counts: Ticker24 (${tickerProductsRaw.length}), DubaiWatchStores (${dubaiProductsRaw.length})`);
  
  const mergedList = [];
  const seenNames = new Set();
  
  // Process Ticker24 products
  for (const raw of tickerProductsRaw) {
    const formatted = formatProduct(raw, 'https://ticker24watches.com/');
    if (formatted && !seenNames.has(formatted.name.toLowerCase())) {
      seenNames.add(formatted.name.toLowerCase());
      mergedList.push(formatted);
    }
  }
  
  // Process DubaiWatchStores products
  for (const raw of dubaiProductsRaw) {
    const formatted = formatProduct(raw, 'https://dubaiwatchstores.com/');
    if (formatted && !seenNames.has(formatted.name.toLowerCase())) {
      seenNames.add(formatted.name.toLowerCase());
      mergedList.push(formatted);
    }
  }
  
  // Re-index all with incremental IDs
  const finalProducts = mergedList.map((p, index) => ({
    ...p,
    id: 100 + index
  }));
  
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalProducts, null, 2));
  
  const gentsCount = finalProducts.filter(p => p.audience === 'Gents').length;
  const ladiesCount = finalProducts.filter(p => p.audience === 'Ladies').length;
  
  console.log(`Success! Crawled and saved ${finalProducts.length} total watches to: ${OUTPUT_FILE}`);
  console.log(`- Gents (Male): ${gentsCount}`);
  console.log(`- Ladies (Female): ${ladiesCount}`);
}

scrapeAll();
