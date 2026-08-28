import mongoose from 'mongoose';

const specItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: [{ type: String }]
});

const heroStatSchema = new mongoose.Schema({
  value: { type: String, required: true },
  label: { type: String, required: true }
});

const newArrivalSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  image: { type: String, required: true },
  label: { type: String, required: true }
});

const craftImageSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  image: { type: String, required: true },
  alt: { type: String, required: true }
});

const detailCategorySchema = new mongoose.Schema({
  category: { type: String, required: true },
  items: [{
    label: { type: String, required: true },
    value: { type: String, required: true }
  }]
});

const testimonialSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  role: { type: String, required: true },
  watchBought: { type: String, required: true },
  rating: { type: Number, default: 5 },
  quote: { type: String, required: true },
  avatar: { type: String }
});

const footerGroupSchema = new mongoose.Schema({
  title: { type: String, required: true },
  links: [{ type: String }]
});

const salesRepSchema = new mongoose.Schema({
  name: { type: String, required: true },
  number: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false }
});

const homepageSchema = new mongoose.Schema(
  {
    // SALES REPRESENTATIVES ROTATION
    salesReps: {
      type: [salesRepSchema],
      default: [
        { name: 'WhatsApp', number: '971501234567', isActive: true, isFeatured: true },
        { name: 'WhatsApp', number: '971507654321', isActive: true, isFeatured: false }
      ]
    },
    // HERO SECTION
    heroTitle: {
      type: String,
      required: true,
      default: 'SWISS | PRECISION',
    },
    heroSubtitleLabel: {
      type: String,
      required: true,
      default: 'SUPER CLONE WATCHES DUBAI',
    },
    heroSubtitleDesc: {
      type: String,
      required: true,
      default: 'Best replica watches in Dubai. Master copy watches & clone watches.',
    },
    heroBodyDescription: {
      type: String,
      required: true,
      default: "Dubai's ultimate boutique for 1:1 super clone watches. Hand-calibrated with flawless sweep movements, premium Oystersteel, and sapphire crystals. Cash on delivery available.",
    },
    heroCtaLabel: {
      type: String,
      required: true,
      default: 'VIEW COLLECTION',
    },
    heroCtaTarget: {
      type: String,
      required: true,
      default: '#store',
    },
    heroWatchImageUrl: {
      type: String,
      required: true,
      default: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171809/t24_watches_defaults/eehkzalmujmziwekwq9a.png',
    },
    heroVideoUrl: {
      type: String,
      default: '/videos/hero-banner.mp4',
    },
    heroMobileVideoUrl: {
      type: String,
      default: 'https://res.cloudinary.com/dwqxzzqpn/video/upload/v1787901807/t24_watches_videos/hero_video_mobile_clean.mp4',
    },
    heroWatchLabelLine1: { type: String, default: 'SWISS' },
    heroWatchLabelLine2: { type: String, default: 'DUBAI EDITION' },
    heroWatchLabelLine3: { type: String, default: 'PREMIUM OYSTERSTEEL' },
    heroWatchLabelLine4: { type: String, default: '1:1 BUILD' },
    heroStats: {
      type: [heroStatSchema],
      default: [
        { value: 'FREE', label: 'Same-day delivery' },
        { value: '2 YR', label: 'Service warranty' },
        { value: 'COD', label: 'Multiple payments' }
      ]
    },

    // SPECS BAR
    specsBarItems: {
      type: [specItemSchema],
      default: [
        {
          title: '1:1 SWISS MOVEMENT',
          details: ['VS3235 & Caliber 4130 Clones', 'Flawless Sweep & Chronograph']
        },
        {
          title: '904L OYSTERSTEEL',
          details: ['Highly Corrosion Resistant', 'Genuine Luxury Weight']
        },
        {
          title: 'SAPPHIRE CRYSTAL',
          details: ['Anti-Reflective Coating', 'Scratch-Proof Durability']
        }
      ]
    },

    // NEW ARRIVALS
    newArrivalsTitle: { type: String, default: 'NEW ARRIVALS' },
    craftsmanshipTitle: { type: String, default: 'CRAFTSMANSHIP' },
    newArrivals: {
      type: [newArrivalSchema],
      default: [
        {
          id: 105,
          name: 'Rolex Daytona Cosmograph M126505-0001 Oyster – 40mm',
          type: '1:1 Swiss Master Copy Edition',
          image: 'https://dubaiwatchstores.com/wp-content/uploads/2025/04/m126505-0001.jpg',
          label: 'BEST SELLER',
        },
        {
          id: 106,
          name: 'Patek Philippe Celestial 5102PR Blue',
          type: '1:1 Swiss Master Copy Edition',
          image: 'https://dubaiwatchstores.com/wp-content/uploads/2025/04/6102P_001_1@2x-e1743605689581.jpg',
          label: 'NEW ARRIVAL',
        }
      ]
    },
    craftsmanshipImages: {
      type: [craftImageSchema],
      default: [
        { 
          id: 103, 
          image: 'https://dubaiwatchstores.com/wp-content/uploads/2026/05/67-01-rose-removebg-preview.webp', 
          alt: 'Richard Mille RM 67-01 Rose Gold Skeleton Dial Extra Flat' 
        },
        { 
          id: 138, 
          image: 'https://dubaiwatchstores.com/wp-content/uploads/2023/01/AP_skeleton-removebg-preview-1.png', 
          alt: 'Audemars Piguet Royal Oak Double Balance Wheel Skeleton' 
        }
      ]
    },

    // CLONE WATCHES DETAIL SECTION (Patek Celestial specs)
    detailBrand: { type: String, default: 'PATEK PHILIPPE' },
    detailModel: { type: String, default: 'CELESTIAL' },
    detailImage: { type: String, default: 'https://dubaiwatchstores.com/wp-content/uploads/2025/04/6102P_001_1@2x-e1743605689581.jpg' },
    detailDesc1: { type: String, default: 'The Patek Philippe Celestial represents the absolute zenith of grand complication horology. Its deep-sky chart dial captures the mesmerizing, slow progression of the stars and the moon in the Northern Hemisphere, bringing cosmic mechanics to your wrist.' },
    detailDesc2: { type: String, default: 'This premium Swiss master copy execution features a multi-layered dial disk, sapphire dial apertures, and the micro-rotor Calibre 240 LU CL C movement. Fine-tuned and pressure tested by our workshop for seamless mechanical sweeps and identical weight parameters.' },
    detailSpecs: {
      type: [detailCategorySchema],
      default: [
        {
          category: 'Movement',
          items: [
            { label: 'Caliber', value: 'Calibre 240 LU CL C' },
            { label: 'Type', value: 'Automatic (Micro-Rotor)' },
            { label: 'Frequency', value: '21,600 vph' },
            { label: 'Jewels', value: '45' }
          ]
        },
        {
          category: 'Case',
          items: [
            { label: 'Material', value: '904L White Gold Plating' },
            { label: 'Diameter', value: '44mm' },
            { label: 'Thickness', value: '10.58mm' },
            { label: 'Crystal', value: 'Double AR Sapphire' }
          ]
        },
        {
          category: 'Strap',
          items: [
            { label: 'Material', value: 'Blue Alligator Leather' },
            { label: 'Color', value: 'Celestial Navy Blue' },
            { label: 'Buckle', value: 'Fold-over Clasp' },
            { label: 'Width', value: '22mm' }
          ]
        }
      ]
    },

    // LUMINESCENCE SECTION (Patek Nautilus Carbon Orange)
    lumeHeading1: { type: String, default: 'PATEK' },
    lumeHeading2: { type: String, default: 'NAUTILUS' },
    lumeSubhead: { type: String, default: 'DIW ALL CARBON BLACK ORANGE' },
    lumeBody: { type: String, default: 'A customized, ultra-modern carbon-forged masterpiece by DIW. Extremely light, durable, featuring dynamic orange luminous hour markers and indicators that absorb UV light during the day to emit a soft, enduring glow in total darkness.' },
    lumeImage: { type: String, default: 'https://dubaiwatchstores.com/wp-content/uploads/2025/12/IMG_1196.webp' },

    // HERITAGE SECTION (Maison Atelier)
    heritageHeading1: { type: String, default: 'DWG' },
    heritageHeading2: { type: String, default: 'ATELIER' },
    heritageDesc1: { type: String, default: 'At Dubai Watches Gallery, we offer the best replica watches in Dubai. Our dedicated watchmaking atelier is specializing in the selection, calibration, and tuning of 1:1 super clone watches Dubai collectors cherish. Every super clone watch in Dubai that we hand-deliver is built using identical weight distribution and flawless Swiss sweep movements.' },
    heritageDesc2: { type: String, default: 'As a premier source for copy watches Dubai and copy watches in Dubai, our in-house watchmakers specialize in tuning and recalibrating first copy movements. From disassembling to lubricating, each timepiece is optimized to replicate the fluid sweeps, tick rates, and robustness of original luxury brands.' },
    heritageDesc3: { type: String, default: 'From Daytona configurations to complex NTPT carbon fiber builds, we represent the peak of super clone watches Dubai has to offer. We use high-end 904L anti-corrosive steel, sapphire glass, and heavy bracelets to ensure our clone watches Dubai collection stands out.' },
    heritageImage: { type: String, default: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171811/t24_watches_defaults/igkoymjeabkrvpmjcx3o.jpg' },
    heritageCaptionLabel: { type: String, default: 'FROM THE EYES OF THE ARTISAN' },
    heritageCaptionText: { type: String, default: 'Every custom timepiece undergoes calibration and pressure testing to ensure confident daily precision' },

    // ARCHITECTURE OF TIME SECTION
    architectureHeading1: { type: String, default: 'ARCHITECTURE' },
    architectureHeading2: { type: String, default: 'OF TIME' },
    architectureSubhead: { type: String, default: 'CASE, DIAL, MOVEMENT' },
    architectureDesc: { type: String, default: 'Discover the ultimate collection of superclone watches and superclone watches in Dubai. At Dubai Watches Gallery, we offer the finest superclone watches Dubai has ever seen, engineered with 1:1 replica-watch detailing, refined case architecture, exposed mechanical caliber movement depth, and polished gold finishing. We are the leading source for collectors seeking premium replica watches in Dubai and authentic-weight Dubai replica watches, fully calibrated for daily-wear precision.' },
    architectureImage: { type: String, default: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1783924974/t24_watches_defaults/watch-architecture.webp' },
    architectureImageAlt: { type: String, default: 'Watchmaker assembling a gold skeleton watch movement' },

    // SIGNATURE CATALOGUE HEADER
    catalogueEyebrow: { type: String, default: 'CURATED WATCH DIRECTORY' },
    catalogueHeading1: { type: String, default: 'THE SIGNATURE' },
    catalogueHeading2: { type: String, default: 'CATALOGUE' },
    catalogueDescription: { type: String, default: 'Refined timepieces selected for balanced weight, smooth movement, and daily-wear precision.' },

    // TESTIMONIALS SECTION
    testimonials: {
      type: [testimonialSchema],
      default: [
        {
          id: 1,
          name: 'Fahad Al-Mansoori',
          location: 'Dubai Marina, UAE',
          role: 'Watch Collector',
          watchBought: 'Rolex Daytona Panda (Premium Edition)',
          rating: 5,
          quote: 'Absolutely mind-blowing. I own a genuine Datejust, but I wanted a Daytona for daily wear without the risk. The weight, bezel luster, and mechanical chronograph sweep are identical. Hand-delivered in Dubai within 4 hours!',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 2,
          name: 'Lucas Sterling',
          location: 'London, UK',
          role: 'Finance Director',
          watchBought: 'Patek Philippe Nautilus 5711 (Premium Edition)',
          rating: 5,
          quote: 'I was skeptical about the 8.3mm thickness, but our workshop nailed it. It fits exactly like my friend\'s authentic 5711. The blue-grey gradient dial shifts beautifully in direct light. Direct WhatsApp ordering was fast and smooth.',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 3,
          name: 'Sarah Jenkins',
          location: 'Los Angeles, USA',
          role: 'Creative Director',
          watchBought: 'Rolex Datejust 41 Wimbledon (Premium Edition)',
          rating: 5,
          quote: 'The Wimbledon slate Roman dial dial is a masterpiece of precision. The fluted bezel catches light like real gold. The super clone bezel luster is superb. Incredible premium customer service from their Dubai desk!',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 4,
          name: 'Khalid Bin-Fahd',
          location: 'Riyadh, Saudi Arabia',
          role: 'Business Owner',
          watchBought: 'Audemars Piguet Royal Oak 15500 (Premium Edition)',
          rating: 5,
          quote: 'Unbelievable craftsmanship on the brushed stainless steel bracelet. The links slide smoothly without any friction, catching light beautifully. Fast courier delivery to Riyadh. Recommended 100%!',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      ]
    },

    // NOCTURNE SECTION (Richard Mille)
    nocturneHeading1: { type: String, default: 'RICHARD' },
    nocturneHeading2: { type: String, default: 'MILLE' },
    nocturneCopy: { type: String, default: 'Discover the finest Richard Mille replica watches Dubai collection. From the ultra-thin RM 67-01 replica in Dubai and RM 67-02 replica in Dubai to complex skeleton dials, each Richard Mille super clone in Dubai is crafted with carbon casings and exact details, making them the ultimate Richard Mille replica watches in Dubai.' },
    nocturneBuildSpec: { type: String, default: 'RICHARD MILLE SUPER CLONE IN DUBAI' },
    nocturneImage: { type: String, default: 'https://dubaiwatchstores.com/wp-content/uploads/2026/05/richard-mille-extra-flat-mutaz-barshim-qatar-white-carbon-quartz-tpt-pink-rm-67-02-2-removebg-preview.webp' },

    // FOOTER SECTION
    footerHeading: { type: String, default: 'CONTACT US' },
    footerWhatsAppNumber: { type: String, default: '971501234567' },
    footerWhatsAppMessage: { type: String, default: 'Hi Dubai Watches Gallery! I\'m visiting your website and would like to inquire about your premium 1:1 Super Clone watch collection.' },
    footerContactImage: { type: String, default: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171812/t24_watches_defaults/hk3mfvm17mljab3czc5h.jpg' },
    footerLinks: {
      type: [footerGroupSchema],
      default: [
        {
          title: 'COLLECTIONS',
          links: ['Rolex 1:1 Super Clones', 'Patek Philippe Super Clones', 'Audemars Piguet Super Clones', 'Richard Mille Super Clones', 'Vacheron Constantin'],
        },
        {
          title: 'OUR SPECIFICATIONS',
          links: ['Clone Caliber Movement', '904L Anti-Corrosive Steel', 'Bespoke Bezel Finishes', 'Ultra-Clear Sapphire Glass'],
        },
        {
          title: 'CUSTOMER SERVICE',
          links: ['WhatsApp Order Desk', 'QC Photo Review', 'GCC Secure Delivery', 'Secure Packaging'],
        },
        {
          title: 'DWG REPLICA ASSURANCE',
          links: ['1:1 Weight Guarantee', 'AAA+ Precision Sweeping', 'Indistinguishable Engravings', 'Dual Waterproof Seals'],
        }
      ]
    },
    footerCopyright: { type: String, default: '© 2026 Dubai Watches Gallery. All rights reserved. Premium 1:1 Super Clone replica timepieces.' }
  },
  {
    timestamps: true,
  }
);

export const Homepage = mongoose.model('Homepage', homepageSchema);
export default Homepage;
