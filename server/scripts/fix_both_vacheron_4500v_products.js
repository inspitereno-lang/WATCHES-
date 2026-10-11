import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const { MONGO_URI } = process.env;

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB:', mongoose.connection.name);

    // 1. PRODUCT 1: Steel Bracelet Edition
    const product1 = {
      id: 179,
      name: 'Vacheron Constantin Overseas 4500V/110A-B126 - Steel Bracelet',
      brand: 'Vacheron Constantin',
      audience: 'Mens',
      factory: 'Overseas',
      model: 'Overseas',
      reference: '4500V/110A-B126',
      material: 'Steel case and steel bracelet',
      size: '41 mm',
      caliber: '5100',
      warranty: 'Two Years of Service',
      priceUSD: '$1,550.00',
      priceAED: 'AED 5,680',
      url: '',
      image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789710734/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v3_main_1.webp',
      thumbnail: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789710734/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v3_main_1.webp',
      images: [
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789710734/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v3_main_1.webp',
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789710735/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v3_2.webp',
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789710737/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v3_3.webp',
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789710740/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v3_4.webp'
      ],
      movement: 'Automatic movement',
      casing: 'Steel',
      bezel: 'Steel',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Vacheron Constantin Overseas reference 4500V/110A-B126 in stainless steel with integrated steel bracelet. Featuring a 41 mm case, silver sunburst dial with luminescent hour markers, sapphire crystal, and the in-house self-winding Calibre 5100 movement.',
      features: [
        'Movement: Automatic movement',
        'Casing Material: Steel',
        'Bezel: Steel',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: 4500V/110A-B126',
        'Material Composition: Steel case and steel bracelet',
        'Diameter Size: 41 mm',
        'Engine / Caliber: 5100',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service'
      ],
      inStock: true,
      isVisible: true,
      nameAr: 'فاشيرون كونستانتين أوفرسيز سوار فولاذي 4500V/110A-B126',
      brandAr: 'فاشيرون كونستانتين',
      modelAr: 'أوفرسيز',
      materialAr: 'علبة وسوار من الفولاذ المقاوم للصدأ',
      movementAr: 'حركة أوتوماتيكية',
      casingAr: 'فولاذ',
      bezelAr: 'فولاذ',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة فاشيرون كونستانتين أوفرسيز الفاخرة 4500V/110A-B126 بسوار فولاذي متكامل بحجم 41 مم وميناء فضي أنيق وحركة أوتوماتيكية عيار 5100.',
      featuresAr: [
        'الحركة: حركة أوتوماتيكية',
        'مادة الهيكل: فولاذ',
        'الإطار: فولاذ',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: 4500V/110A-B126',
        'تركيبة المواد: علبة وسوار من الفولاذ',
        'الأبعاد: 41 مم',
        'العيار / المحرك: 5100',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين'
      ]
    };

    // 2. PRODUCT 2: Rubber / Leather Strap Edition
    const product2 = {
      id: 180,
      name: 'Vacheron Constantin Overseas 4500V/110A-B126 - Rubber Strap',
      brand: 'Vacheron Constantin',
      audience: 'Mens',
      factory: 'Overseas',
      model: 'Overseas',
      reference: '4500V/110A-B126 (Strap)',
      material: 'Steel case and rubber strap',
      size: '41 mm',
      caliber: '5100',
      warranty: 'Two Years of Service',
      priceUSD: '$1,550.00',
      priceAED: 'AED 5,680',
      url: '',
      image: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789711526/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v4_main_1.webp',
      thumbnail: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789711526/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v4_main_1.webp',
      images: [
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789711526/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v4_main_1.webp',
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789711528/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v4_2.webp',
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789711529/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v4_3.webp',
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789711531/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v4_4.webp',
        'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1789711533/t24_watches_clean/vacheron_constantin_overseas_4500v_b126_v4_5.webp'
      ],
      movement: 'Automatic movement',
      casing: 'Steel',
      bezel: 'Steel',
      glass: 'Sapphire crystal',
      waterResistance: '50m waterproof vacuum tested',
      description: 'The Vacheron Constantin Overseas reference 4500V/110A-B126 with sporty black rubber strap. Featuring a 41 mm case, silver dial with luminescent markers, deployment clasp, sapphire crystal, and the in-house self-winding Calibre 5100 movement.',
      features: [
        'Movement: Automatic movement',
        'Casing Material: Steel',
        'Bezel: Steel',
        'Glass / Crystal: Sapphire crystal',
        'Reference Number: 4500V/110A-B126',
        'Material Composition: Steel case and rubber strap',
        'Diameter Size: 41 mm',
        'Engine / Caliber: 5100',
        'Shipping: Free Shipping',
        'Warranty: Two Years of Service'
      ],
      inStock: true,
      isVisible: true,
      nameAr: 'فاشيرون كونستانتين أوفرسيز حزام مطاطي 4500V/110A-B126',
      brandAr: 'فاشيرون كونستانتين',
      modelAr: 'أوفرسيز',
      materialAr: 'علبة من الفولاذ وحزام من المطاط',
      movementAr: 'حركة أوتوماتيكية',
      casingAr: 'فولاذ',
      bezelAr: 'فولاذ',
      glassAr: 'زجاج ياقوتي كريستال مقاوم للخدش',
      waterResistanceAr: 'مقاومة الماء حتى 50 متراً',
      warrantyAr: 'ضمان خدمة لمدة عامين',
      descriptionAr: 'ساعة فاشيرون كونستانتين أوفرسيز الفاخرة 4500V/110A-B126 بحزام مطاطي رياضي أسود بحجم 41 مم وميناء فضي أنيق وحركة أوتوماتيكية عيار 5100.',
      featuresAr: [
        'الحركة: حركة أوتوماتيكية',
        'مادة الهيكل: فولاذ',
        'الإطار: فولاذ',
        'الزجاج: زجاج ياقوتي كريستال',
        'الرقم المرجعي: 4500V/110A-B126',
        'تركيبة المواد: علبة من الفولاذ وحزام مطاطي',
        'الأبعاد: 41 مم',
        'العيار / المحرك: 5100',
        'الشحن: شحن مجاني',
        'الضمان: ضمان خدمة لمدة عامين'
      ]
    };

    console.log('Upserting Product 1 (ID: 179 - Steel Bracelet)...');
    await Product.findOneAndUpdate({ id: 179 }, { $set: product1 }, { upsert: true, new: true });
    console.log('✓ Saved Product 179 (Steel Bracelet)');

    console.log('Upserting Product 2 (ID: 180 - Rubber Strap)...');
    await Product.findOneAndUpdate({ id: 180 }, { $set: product2 }, { upsert: true, new: true });
    console.log('✓ Saved Product 180 (Rubber Strap)');

    const list = await Product.find({ id: { $in: [179, 180] } });
    console.log('\nVerification in DB:');
    list.forEach(p => {
      console.log(`- ID ${p.id}: "${p.name}" | Reference: ${p.reference} | Images count: ${p.images.length} | Main banner: ${p.image}`);
    });

    await mongoose.connection.close();
    console.log('\nDone! Both products are now stored as separate individual products in MongoDB.');
  } catch (err) {
    console.error(err);
    try { await mongoose.connection.close(); } catch {}
    process.exit(1);
  }
}

main();
