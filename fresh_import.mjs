/**
 * fresh_import.mjs
 * ─────────────────────────────────────────────────────────────
 * 1. Scrapes ALL products from dubaiwatchstores.com WooCommerce API
 * 2. Puts Mens/Gents watches FIRST, then Ladies
 * 3. Downloads every product image & uploads to Cloudinary CDN
 * 4. Saves formatted products into MongoDB
 *
 * Run:  node fresh_import.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── ENV ──────────────────────────────────────────────────────
dotenv.config({ path: path.join(__dirname, 'server/.env') });

// ── CLOUDINARY ───────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── MONGOOSE MODEL (inline to avoid ESM path issues) ─────────
const productSchema = new mongoose.Schema(
  {
    id:             { type: Number, required: true, unique: true, index: true },
    name:           { type: String, required: true, trim: true },
    brand:          { type: String, required: true, trim: true, index: true },
    audience:       { type: String, enum: ['Womens', 'Mens', 'Ladies', 'Gents'], required: true, default: 'Mens', index: true },
    factory:        { type: String, required: true, trim: true },
    model:          { type: String, default: '' },
    reference:      { type: String, default: '' },
    material:       { type: String, default: '' },
    size:           { type: String, default: '' },
    caliber:        { type: String, default: '' },
    warranty:       { type: String, default: '2-Year Service Warranty' },
    priceUSD:       { type: String, required: true },
    priceAED:       { type: String, required: true },
    url:            { type: String },
    image:          { type: String, required: true },
    thumbnail:      { type: String, default: '' },
    images:         { type: [String], default: [] },
    movement:       { type: String, required: true },
    casing:         { type: String, required: true },
    bezel:          { type: String, required: true },
    glass:          { type: String, required: true },
    waterResistance:{ type: String, required: true, default: '50m waterproof vacuum tested' },
    description:    { type: String, required: true },
    features:       { type: [String], default: [] },
    inStock:        { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);
productSchema.index({ name: 'text', factory: 'text', brand: 'text', audience: 'text' });
const Product = mongoose.model('Product', productSchema);

// ── IMAGE URL CACHE (persisted locally) ──────────────────────
const CACHE_FILE = path.join(__dirname, 'cloudinary_mappings.json');
let urlCache = {};
if (fs.existsSync(CACHE_FILE)) {
  try { urlCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8')); }
  catch { urlCache = {}; }
}
const saveCache = () => fs.writeFileSync(CACHE_FILE, JSON.stringify(urlCache, null, 2));

// ── HELPERS ───────────────────────────────────────────────────
function decodeHtml(str = '') {
  return str
    .replace(/&rsquo;|&#8217;/g, "'")
    .replace(/&lsquo;|&#8216;/g, "'")
    .replace(/&ldquo;|&#8220;/g, '"')
    .replace(/&rdquo;|&#8221;/g, '"')
    .replace(/&amp;|&#038;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '—')
    .trim();
}

function stripHtml(str = '') {
  return str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/** Download a URL and stream it up to Cloudinary. Returns the Cloudinary secure_url. */
async function uploadImage(rawUrl, folder = 't24_watches') {
  if (!rawUrl) return '';

  // Unwrap weserv proxy if present
  let url = rawUrl;
  if (url.includes('images.weserv.nl')) {
    try {
      const u = new URL(url);
      const inner = u.searchParams.get('url');
      if (inner) url = decodeURIComponent(inner);
    } catch { /* keep original */ }
  }

  // Already on Cloudinary?
  if (url.includes('res.cloudinary.com')) return url;

  // Hit local cache first
  if (urlCache[url]) return urlCache[url];

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Referer': 'https://dubaiwatchstores.com/',
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const buf = Buffer.from(await res.arrayBuffer());

      const secureUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
          if (err) reject(err);
          else resolve(result.secure_url);
        });
        stream.end(buf);
      });

      urlCache[url] = secureUrl;
      saveCache();
      console.log(`   ☁  Uploaded → ${secureUrl.split('/').slice(-2).join('/')}`);
      return secureUrl;
    } catch (err) {
      console.warn(`   ⚠  Attempt ${attempt}/3 failed for ${url}: ${err.message}`);
      if (attempt < 3) await sleep(2500);
    }
  }

  // All retries exhausted – fall back to original URL so product still saves
  console.error(`   ✗  Giving up on ${url}, using original URL as fallback`);
  return url;
}

// ── FETCH ALL PAGES FROM WOOCOMMERCE API ──────────────────────
async function fetchAllRaw() {
  const BASE = 'https://dubaiwatchstores.com/wp-json/wc/store/v1/products';
  const all = [];
  let page = 1;

  while (page <= 15) {
    const url = `${BASE}?per_page=30&page=${page}`;
    console.log(`📡 Fetching page ${page}: ${url}`);
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 Chrome/124.0.0.0 Safari/537.36' },
      });
      if (!res.ok) { console.warn(`   HTTP ${res.status} – stopping`); break; }
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      page++;
    } catch (err) {
      console.error(`   Error on page ${page}: ${err.message}`);
      break;
    }
  }
  return all;
}

// ── BRAND DETECTION ───────────────────────────────────────────
function detectBrand(name, categories = []) {
  const n = name.toLowerCase();
  const cats = categories.map(c => c.name?.toLowerCase() ?? '');
  const all = n + ' ' + cats.join(' ');

  if (all.includes('rolex'))                                        return 'Rolex';
  if (all.includes('patek') || all.includes('nautilus') || all.includes('aquanaut')) return 'Patek Philippe';
  if (all.includes('audemars') || all.includes('royal oak'))        return 'Audemars Piguet';
  if (all.includes('richard mille') || /\brm[ -]?\d/.test(all))    return 'Richard Mille';
  if (all.includes('hublot'))                                       return 'Hublot';
  if (all.includes('vacheron'))                                     return 'Vacheron Constantin';
  if (all.includes('cartier'))                                      return 'Cartier';
  if (all.includes('omega'))                                        return 'Omega';
  if (all.includes('iwc'))                                          return 'IWC';
  if (all.includes('breitling'))                                    return 'Breitling';
  if (all.includes('tag heuer') || all.includes('tagheuer'))        return 'TAG Heuer';
  if (all.includes('panerai'))                                      return 'Panerai';
  return null; // skip unknown brands
}

// ── AUDIENCE DETECTION ────────────────────────────────────────
function detectAudience(name, desc, shortDesc, categories) {
  const cats = categories.map(c => c.name?.toLowerCase() ?? '').join(' ');
  const full = [name, desc, shortDesc, cats].join(' ').toLowerCase();
  if (full.includes('ladies') || full.includes('lady') || full.includes('women') || full.includes('woman') || full.includes('unisex-watches')) {
    return 'Womens';
  }
  return 'Mens';
}

// ── FACTORY LABEL ─────────────────────────────────────────────
function factoryFor(brand) {
  const map = {
    'Rolex':              'Swiss Precision Edition',
    'Patek Philippe':     'Swiss Precision Edition',
    'Audemars Piguet':    'Swiss Precision Edition',
    'Richard Mille':      'Swiss Precision Edition',
    'Hublot':             'Swiss Precision Edition',
    'Vacheron Constantin':'Swiss Precision Edition',
    'Cartier':            'Swiss Precision Edition',
    'Omega':              'Swiss Precision Edition',
    'IWC':                'Swiss Precision Edition',
    'Breitling':          'Swiss Precision Edition',
    'TAG Heuer':          'Swiss Precision Edition',
    'Panerai':            'Swiss Precision Edition',
  };
  return map[brand] ?? 'Swiss Precision Edition';
}

// ── FORMAT PRICE ──────────────────────────────────────────────
function formatPrice(p) {
  let val = 1490;
  if (p.prices?.price) {
    const raw = parseFloat(p.prices.price);
    if (raw > 0) val = raw / 100;
  }
  if (val < 500)   val = 1490;
  if (val > 20000) val = val / 10;
  return {
    priceUSD: `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    priceAED: `AED ${Math.round(val * 3.67).toLocaleString()}`,
  };
}

// ── MAIN ──────────────────────────────────────────────────────
async function main() {
  // ── Connect to MongoDB ────────────────────────────────────
  console.log('\n🔌 Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Connected.\n');

  // ── Wipe existing products ────────────────────────────────
  const deleted = await Product.deleteMany({});
  console.log(`🗑  Cleared ${deleted.deletedCount} existing products.\n`);

  // ── Scrape ────────────────────────────────────────────────
  console.log('🔍 Scraping dubaiwatchstores.com…');
  const raw = await fetchAllRaw();
  console.log(`\n📦 Raw products fetched: ${raw.length}\n`);

  // ── Deduplicate & format ──────────────────────────────────
  const seen = new Set();
  const formatted = [];

  for (const p of raw) {
    const name  = decodeHtml(p.name ?? '');
    const brand = detectBrand(name, p.categories ?? []);
    if (!brand) continue;               // skip unsupported brands
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());

    const desc      = stripHtml(p.description    ?? '');
    const shortDesc = stripHtml(p.short_description ?? '');
    const audience  = detectAudience(name, desc, shortDesc, p.categories ?? []);
    const { priceUSD, priceAED } = formatPrice(p);

    // Collect raw image URLs (strip weserv proxies — we'll upload directly)
    const rawImages = (p.images ?? []).map(img => img.src).filter(Boolean);
    const mainImage = rawImages[0] ?? '';
    const thumbSrc  = p.images?.[0]?.thumbnail ?? mainImage;

    formatted.push({
      name, brand, audience,
      priceUSD, priceAED,
      url: p.permalink ?? 'https://dubaiwatchstores.com/',
      rawImage:  mainImage,
      rawThumb:  thumbSrc,
      rawImages,
      factory:   factoryFor(brand),
      movement:  `Clone Caliber movement custom-engineered for 1:1 ${brand} sweeps`,
      casing:    '904L anti-corrosive stainless steel casing',
      bezel:     'Hand-finished structural bezel with genuine texture luster',
      glass:     'Ultra-clear sapphire glass with anti-scratch and anti-glare finish',
      waterResistance: '50m waterproof vacuum tested',
      description: (desc || shortDesc || `Superb execution of the iconic ${name}. Engineered to exact millimeter tolerances.`).substring(0, 500),
      features: [
        '1:1 original weight & alignments',
        'Sweeping second hand matching Swiss sweep speeds',
        'Super-LumiNova elements',
        'Solid case-back with micro-engravings',
      ],
    });
  }

  // ── Sort: Mens first, then Ladies ─────────────────────────
  formatted.sort((a, b) => {
    if (a.audience === 'Mens' && b.audience !== 'Mens') return -1;
    if (a.audience !== 'Mens' && b.audience === 'Mens') return  1;
    return 0;
  });

  const mensCount   = formatted.filter(p => p.audience === 'Mens').length;
  const womensCount = formatted.filter(p => p.audience !== 'Mens').length;
  console.log(`\n🧍 Men's watches  : ${mensCount}`);
  console.log(`👩 Women's watches: ${womensCount}`);
  console.log(`📋 Total to import : ${formatted.length}\n`);

  // ── Upload images & save to DB ────────────────────────────
  let saved = 0;
  let failed = 0;

  for (let i = 0; i < formatted.length; i++) {
    const item = formatted[i];
    const idNum = 100 + i;

    console.log(`\n[${i + 1}/${formatted.length}] ${item.audience === 'Mens' ? '🧍' : '👩'} ${item.name}`);

    try {
      // Upload images
      const cloudMain  = await uploadImage(item.rawImage);
      const cloudThumb = item.rawThumb !== item.rawImage
        ? await uploadImage(item.rawThumb)
        : cloudMain;

      const cloudGallery = [];
      for (const imgUrl of item.rawImages) {
        const cu = await uploadImage(imgUrl);
        if (cu) cloudGallery.push(cu);
      }

      await Product.create({
        id:             idNum,
        name:           item.name,
        brand:          item.brand,
        audience:       item.audience,
        factory:        item.factory,
        priceUSD:       item.priceUSD,
        priceAED:       item.priceAED,
        url:            item.url,
        image:          cloudMain  || item.rawImage,
        thumbnail:      cloudThumb || cloudMain || item.rawImage,
        images:         cloudGallery.length ? cloudGallery : [cloudMain || item.rawImage],
        movement:       item.movement,
        casing:         item.casing,
        bezel:          item.bezel,
        glass:          item.glass,
        waterResistance:item.waterResistance,
        description:    item.description,
        features:       item.features,
        model:          '',
        reference:      '',
        material:       '',
        size:           '',
        caliber:        '',
        warranty:       '2-Year Service Warranty',
        inStock:        true,
      });

      saved++;
      console.log(`   ✅ Saved [ID ${idNum}]`);
    } catch (err) {
      failed++;
      console.error(`   ❌ Failed to save: ${err.message}`);
    }
  }

  // ── Summary ───────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════');
  console.log(`✅ Import complete!`);
  console.log(`   Saved  : ${saved} products`);
  console.log(`   Failed : ${failed} products`);
  console.log(`   Mens   : ${formatted.filter(p => p.audience === 'Mens').length} (shown first)`);
  console.log(`   Women's: ${womensCount}`);
  console.log('══════════════════════════════════════════\n');

  await mongoose.connection.close();
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
