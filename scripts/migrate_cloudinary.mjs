import fs from 'fs';
import path from 'path';
import { MongoClient } from '/var/www/fastuser/data/backend/node_modules/mongodb/lib/index.js';

const UPLOADS_ROOT = '/var/www/fastuser/data/www/dubaiwatchesgallery.com/uploads';
const MONGO_URI = 'mongodb://127.0.0.1:27017';
const DB_NAME = 't24watches';

async function main() {
  console.log('🚀 Starting Cloudinary to Local Migration...');
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db(DB_NAME);

  const urlMap = new Map();

  const products = await db.collection('products').find({}).toArray();
  for (const p of products) {
    if (p.image && p.image.includes('cloudinary')) registerUrl(p.image);
    if (p.thumbnail && p.thumbnail.includes('cloudinary')) registerUrl(p.thumbnail);
    if (Array.isArray(p.images)) {
      for (const img of p.images) {
        if (img && img.includes('cloudinary')) registerUrl(img);
      }
    }
  }

  const homepages = await db.collection('homepages').find({}).toArray();
  for (const h of homepages) {
    for (const [k, v] of Object.entries(h)) {
      if (typeof v === 'string' && v.includes('cloudinary')) registerUrl(v);
    }
  }

  const blogposts = await db.collection('blogposts').find({}).toArray();
  for (const b of blogposts) {
    for (const [k, v] of Object.entries(b)) {
      if (typeof v === 'string' && v.includes('cloudinary')) registerUrl(v);
    }
  }

  const heros = await db.collection('heros').find({}).toArray();
  for (const h of heros) {
    for (const [k, v] of Object.entries(h)) {
      if (typeof v === 'string' && v.includes('cloudinary')) registerUrl(v);
    }
  }

  function registerUrl(url) {
    if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) return;
    if (urlMap.has(url)) return;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
    if (match) {
      const relPath = match[1];
      urlMap.set(url, {
        remoteUrl: url,
        relPath: relPath,
        localUrl: '/uploads/' + relPath,
        diskPath: path.join(UPLOADS_ROOT, relPath),
      });
    }
  }

  console.log('📦 Found ' + urlMap.size + ' unique Cloudinary media assets to download.');

  const items = Array.from(urlMap.values());
  let downloaded = 0;
  let skipped = 0;
  let errors = 0;
  const CONCURRENCY = 15;

  async function downloadWorker(task) {
    const { remoteUrl, diskPath } = task;
    try {
      const dir = path.dirname(diskPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(diskPath) && fs.statSync(diskPath).size > 0) {
        skipped++;
        return;
      }

      const res = await fetch(remoteUrl);
      if (!res.ok) {
        throw new Error('HTTP ' + res.status + ' ' + res.statusText);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(diskPath, buffer);
      downloaded++;
    } catch (err) {
      console.error('❌ Failed downloading ' + remoteUrl + ':', err.message);
      errors++;
    }
  }

  console.log('⬇️ Downloading assets to VPS disk...');
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(downloadWorker));
    const progress = Math.min(i + CONCURRENCY, items.length);
    if (progress % 50 === 0 || progress === items.length) {
      console.log('⏳ Progress: ' + progress + '/' + items.length + ' (Downloaded: ' + downloaded + ', Skipped: ' + skipped + ', Errors: ' + errors + ')');
    }
  }

  console.log('✅ Download complete! (Downloaded: ' + downloaded + ', Skipped: ' + skipped + ', Errors: ' + errors + ')');

  console.log('🔄 Updating URLs in local MongoDB...');
  let productsUpdated = 0;
  for (const p of products) {
    let changed = false;
    let updateDoc = {};

    if (p.image && urlMap.has(p.image)) {
      updateDoc.image = urlMap.get(p.image).localUrl;
      changed = true;
    }
    if (p.thumbnail && urlMap.has(p.thumbnail)) {
      updateDoc.thumbnail = urlMap.get(p.thumbnail).localUrl;
      changed = true;
    }
    if (Array.isArray(p.images)) {
      const newImages = p.images.map(img => urlMap.has(img) ? urlMap.get(img).localUrl : img);
      if (JSON.stringify(newImages) !== JSON.stringify(p.images)) {
        updateDoc.images = newImages;
        changed = true;
      }
    }

    if (changed) {
      await db.collection('products').updateOne({ _id: p._id }, { $set: updateDoc });
      productsUpdated++;
    }
  }
  console.log('✅ Updated ' + productsUpdated + ' products in local MongoDB.');

  let homepagesUpdated = 0;
  for (const h of homepages) {
    let updateDoc = {};
    for (const [k, v] of Object.entries(h)) {
      if (typeof v === 'string' && urlMap.has(v)) {
        updateDoc[k] = urlMap.get(v).localUrl;
      }
    }
    if (Object.keys(updateDoc).length > 0) {
      await db.collection('homepages').updateOne({ _id: h._id }, { $set: updateDoc });
      homepagesUpdated++;
    }
  }
  console.log('✅ Updated ' + homepagesUpdated + ' homepage configurations in local MongoDB.');

  let blogpostsUpdated = 0;
  for (const b of blogposts) {
    let updateDoc = {};
    for (const [k, v] of Object.entries(b)) {
      if (typeof v === 'string' && urlMap.has(v)) {
        updateDoc[k] = urlMap.get(v).localUrl;
      }
    }
    if (Object.keys(updateDoc).length > 0) {
      await db.collection('blogposts').updateOne({ _id: b._id }, { $set: updateDoc });
      blogpostsUpdated++;
    }
  }
  console.log('✅ Updated ' + blogpostsUpdated + ' blog posts in local MongoDB.');

  let herosUpdated = 0;
  for (const h of heros) {
    let updateDoc = {};
    for (const [k, v] of Object.entries(h)) {
      if (typeof v === 'string' && urlMap.has(v)) {
        updateDoc[k] = urlMap.get(v).localUrl;
      }
    }
    if (Object.keys(updateDoc).length > 0) {
      await db.collection('heros').updateOne({ _id: h._id }, { $set: updateDoc });
      herosUpdated++;
    }
  }
  console.log('✅ Updated ' + herosUpdated + ' hero documents in local MongoDB.');

  await client.close();
  console.log('🎉 Cloudinary media and local MongoDB migration finished successfully!');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
