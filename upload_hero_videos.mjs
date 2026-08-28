import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: 'dwqxzzqpn',
  api_key: '166385748614328',
  api_secret: 'Cnc2G4jSlw-XDDvTlu72r1izalQ',
});

async function uploadVideo(filePath, publicId) {
  console.log(`Uploading ${filePath} to Cloudinary...`);
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'video',
      folder: 't24_watches_videos',
      public_id: publicId,
      overwrite: true,
    });
    console.log(`Uploaded successfully! Secure URL: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error('Upload failed:', error);
    return null;
  }
}

async function main() {
  const vid1 = path.join(__dirname, 'public/videos/hero-banner.mp4');
  const vid2 = path.join(__dirname, 'public/videos/hero-banner-2.mp4');

  const url1 = await uploadVideo(vid1, 'hero_video_transition');
  const url2 = await uploadVideo(vid2, 'hero_video_orbiting');

  console.log('\nResults:');
  console.log('Video 1 Cloudinary URL:', url1);
  console.log('Video 2 Cloudinary URL:', url2);

  fs.writeFileSync(
    path.join(__dirname, 'cloudinary_hero_videos.json'),
    JSON.stringify({ url1, url2 }, null, 2)
  );
}

main();
