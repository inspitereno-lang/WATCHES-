import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const INDEX_HTML_PATH = path.resolve(DIST_DIR, 'index.html');
const SITE_URL = 'https://dubaiwatchesgallery.com';

function createProductSlug(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function optimizeOgImage(rawImage) {
  if (!rawImage) return `${SITE_URL}/watch-grid-1.jpg`;
  let img = rawImage.trim();
  if (img.startsWith('/')) {
    img = `${SITE_URL}${img}`;
  }
  // Cloudinary image transformation for optimal WhatsApp link unfurling:
  // Convert to JPG format, 1200px width, automatic quality
  if (img.includes('res.cloudinary.com') && img.includes('/upload/')) {
    img = img.replace(/\/upload\/(?:v\d+\/)?/, (match) => {
      return match.includes('v')
        ? match.replace('/upload/', '/upload/f_jpg,q_auto,w_1200/')
        : '/upload/f_jpg,q_auto,w_1200/';
    });
  }
  return img;
}

async function fetchProducts() {
  console.log('Fetching live product catalogue from API...');
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${SITE_URL}/api/products?limit=1000`, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ProductPageGenerator/1.0' },
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data.products || []);
      if (list.length > 0) {
        console.log(`Successfully fetched ${list.length} products from ${SITE_URL}/api/products`);
        return list;
      }
    }
  } catch (err) {
    console.warn('API fetch failed or timed out:', err.message);
  }

  // Fallback to local files if API unreachable
  const scrapedPath = path.resolve(ROOT_DIR, 'scraped_products.json');
  if (fs.existsSync(scrapedPath)) {
    try {
      console.log('Falling back to local scraped_products.json...');
      const localData = JSON.parse(fs.readFileSync(scrapedPath, 'utf8'));
      const list = Array.isArray(localData) ? localData : (localData.products || []);
      if (list.length > 0) return list;
    } catch (e) {
      console.error('Error reading scraped_products.json:', e.message);
    }
  }

  return [];
}

function generateProductHtml(templateHtml, product) {
  const name = product.name || 'Dubai Watches Gallery';
  const brand = product.brand || 'Luxury Watch';
  const price = product.priceAED || '';
  const title = price
    ? `${name} (${price}) | Dubai Watches Gallery`
    : `${name} | Dubai Watches Gallery`;
  const slug = createProductSlug(name);
  const canonicalUrl = `${SITE_URL}/product/${slug || product.id}`;
  const ogImage = optimizeOgImage(product.image);
  const rawPriceNumber = price ? price.replace(/[^0-9]/g, '') : '0';

  const rawDescription =
    product.description ||
    `Shop 1:1 super clone ${name} in Dubai at Dubai Watches Gallery. Premium Swiss replica timepieces, flawless sweep calibers, sapphire glass & cash on delivery across Dubai & UAE. ${price}`;
  // Strip any HTML tags from description and truncate to 200 chars for clean meta display
  const cleanDescription = rawDescription.replace(/<[^>]*>/g, '').trim().slice(0, 220);

  let html = templateHtml;

  // Replace Title
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Replace Canonical Link
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`
  );

  // Replace standard description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="description" content="${escapeHtml(cleanDescription)}" />`
  );

  // Replace Open Graph tags
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:description" content="${escapeHtml(cleanDescription)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:image" content="${ogImage}" />\n    <meta property="og:image:secure_url" content="${ogImage}" />\n    <meta property="og:image:type" content="image/jpeg" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="1200" />\n    <meta property="og:image:alt" content="${escapeHtml(name)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:url" content="${canonicalUrl}" />`
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/i,
    `<meta property="og:type" content="product" />\n    <meta property="product:price:amount" content="${rawPriceNumber}" />\n    <meta property="product:price:currency" content="AED" />`
  );

  // Replace Twitter tags
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:description" content="${escapeHtml(cleanDescription)}" />`
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/i,
    `<meta name="twitter:image" content="${ogImage}" />`
  );

  // Inject Schema.org Product structured data
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    image: [ogImage],
    description: cleanDescription,
    brand: {
      '@type': 'Brand',
      name: brand,
    },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'AED',
      price: rawPriceNumber,
      availability: product.inStock !== false ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Dubai Watches Gallery',
      },
    },
  };

  const schemaTag = `<script type="application/ld+json">\n${JSON.stringify(productSchema, null, 2)}\n    </script>`;
  html = html.replace('</head>', `    ${schemaTag}\n  </head>`);

  return html;
}

async function main() {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.warn(`[generate-product-pages] dist/index.html not found at ${INDEX_HTML_PATH}. Run 'vite build' first.`);
    return;
  }

  const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
  const products = await fetchProducts();

  if (products.length === 0) {
    console.warn('[generate-product-pages] No products found to pre-render.');
    return;
  }

  console.log(`Pre-rendering product pages for ${products.length} products...`);
  let renderedCount = 0;

  for (const product of products) {
    if (!product || !product.id) continue;
    const html = generateProductHtml(baseHtml, product);
    const slug = createProductSlug(product.name);

    // Save under:
    // 1) /product/:id/index.html (e.g. /product/214/index.html)
    const idDir = path.resolve(DIST_DIR, 'product', String(product.id));
    fs.mkdirSync(idDir, { recursive: true });
    fs.writeFileSync(path.join(idDir, 'index.html'), html, 'utf8');

    // 2) /product/:slug/index.html (e.g. /product/richard-mille-rm-055.../index.html)
    if (slug) {
      const slugDir = path.resolve(DIST_DIR, 'product', slug);
      fs.mkdirSync(slugDir, { recursive: true });
      fs.writeFileSync(path.join(slugDir, 'index.html'), html, 'utf8');

      // 3) /product/:id-:slug/index.html
      const idSlugDir = path.resolve(DIST_DIR, 'product', `${product.id}-${slug}`);
      fs.mkdirSync(idSlugDir, { recursive: true });
      fs.writeFileSync(path.join(idSlugDir, 'index.html'), html, 'utf8');
    }

    renderedCount++;
  }

  console.log(`[generate-product-pages] Successfully pre-rendered ${renderedCount} products with custom Open Graph tags into dist/product/`);
}

main().catch((err) => {
  console.error('[generate-product-pages] Error:', err);
  process.exit(1);
});
