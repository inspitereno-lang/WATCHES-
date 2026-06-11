import mongoose from 'mongoose';

const specItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: [{ type: String }]
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
  quote: { type: String, required: true }
});

const footerGroupSchema = new mongoose.Schema({
  title: { type: String, required: true },
  links: [{ type: String }]
});

const homepageSchema = new mongoose.Schema(
  {
    // HERO SECTION
    heroTitle: {
      type: String,
      required: true,
      default: 'THE ART OF | 1:1 SWISS CLONES',
    },
    heroSubtitleLabel: {
      type: String,
      required: true,
      default: 'T24 WATCHES DUBAI:',
    },
    heroSubtitleDesc: {
      type: String,
      required: true,
      default: 'Indistinguishable Swiss movements & 904L Oystersteel',
    },
    heroBodyDescription: {
      type: String,
      required: true,
      default: 'Specializing in the custom curation and assembly of premium 1:1 luxury replica watches. Hand-calibrated in our Dubai laboratory with sweeping seconds, exact casing weights, and genuine sapphire glass.',
    },
    heroCtaLabel: {
      type: String,
      required: true,
      default: 'EXPLORE THE CATALOGUE',
    },
    heroCtaTarget: {
      type: String,
      required: true,
      default: '#store',
    },
    heroWatchImageUrl: {
      type: String,
      required: true,
      default: '/hero-watch.png',
    },
    heroWatchLabelLine1: { type: String, default: 'AUDEMARS PIGUET' },
    heroWatchLabelLine2: { type: String, default: 'ROYAL OAK DOUBLE BALANCE' },
    heroWatchLabelLine3: { type: String, default: 'SKELETON FLUTE' },
    heroWatchLabelLine4: { type: String, default: 'VSF BUILD' },

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
          id: 133,
          name: 'Daytona Pikachu 126518LN Gold',
          type: 'Clean Factory 1:1 Swiss Clone',
          image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F02%2FIMG_0913-300x300.webp',
          label: 'BEST SELLER',
        },
        {
          id: 121,
          name: 'Patek Philippe Celestial Blue',
          type: '3K Factory 1:1 Swiss Clone',
          image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F04%2FIMG_3594-300x300.webp',
          label: 'NEW ARRIVAL',
        }
      ]
    },
    craftsmanshipImages: {
      type: [craftImageSchema],
      default: [
        { 
          id: 108, 
          image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F03%2FIMG_2868-300x300.webp', 
          alt: 'Richard Mille Mother Of Pearl Rose Gold' 
        },
        { 
          id: 120, 
          image: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2025%2F11%2FIMG_4627-300x300.webp', 
          alt: 'Audemars Piguet Frosted Double Balance Wheel' 
        }
      ]
    },

    // CLONE WATCHES DETAIL SECTION (Patek Celestial specs)
    detailBrand: { type: String, default: 'PATEK PHILIPPE' },
    detailModel: { type: String, default: 'CELESTIAL' },
    detailImage: { type: String, default: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F04%2FIMG_3594-300x300.webp' },
    detailDesc1: { type: String, default: 'The Patek Philippe Celestial represents the absolute zenith of grand complication horology. Its deep-sky chart dial captures the mesmerizing, slow progression of the stars and the moon in the Northern Hemisphere, bringing cosmic mechanics to your wrist.' },
    detailDesc2: { type: String, default: 'This 3K Factory Swiss clone execution features a multi-layered dial disk, sapphire dial apertures, and the micro-rotor Calibre 240 LU CL C movement. Fine-tuned and pressure tested by our workshop for seamless mechanical sweeps and identical weight parameters.' },
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
    lumeImage: { type: String, default: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2024%2F10%2FIMG_0394-300x300.webp' },

    // HERITAGE SECTION (Maison Atelier)
    heritageHeading1: { type: String, default: 'T24' },
    heritageHeading2: { type: String, default: 'ATELIER' },
    heritageDesc1: { type: String, default: 'At T24 Watches, we stand at the intersection of legendary horology design and accessibility. Our state-of-the-art custom watchmaking laboratory is dedicated to the micro-engineering and meticulous hand-assembly of premium 1:1 luxury replica watches. Every Swiss clone watch that leaves our workspace undergoes rigorous multi-point testing, guaranteeing weight distribution and sweeps that are indistinguishable from authentic luxury watches.' },
    heritageDesc2: { type: String, default: 'Our atelier brings together skilled watch artisans who specialize in the tuning of clone movements (such as the Clean Factory Caliber 4130 and VSF VS3235). By disassembling, lubricating, and recalibrating each mechanical movement, we ensure that our first-copy watches operate with the exact same fluid sweep, tick rate, and long-term durability as genuine Swiss timepieces.' },
    heritageDesc3: { type: String, default: 'From our custom Daytona configurations to complex NTPT carbon fiber casing, we push the boundaries of replica horology. We use only premium materials like 904L anti-corrosive Oystersteel, white gold electroplated fluted bezels, and double-sided anti-reflective sapphire crystals. We are proud to deliver the ultimate watch collecting experience directly to your doorstep in Dubai and worldwide.' },
    heritageImage: { type: String, default: '/heritage-watchmaker.jpg' },
    heritageCaptionLabel: { type: String, default: 'FROM THE EYES OF THE ARTISAN' },
    heritageCaptionText: { type: String, default: 'Every custom T24 Swiss clone undergoes 100+ hours of calibration and pressure testing to ensure flawless precision' },

    // TESTIMONIALS SECTION
    testimonials: {
      type: [testimonialSchema],
      default: [
        {
          id: 1,
          name: 'Faisal Al-Mansoori',
          location: 'Dubai Marina, UAE',
          role: 'Watch Collector',
          watchBought: 'Rolex Daytona Panda (Clean Factory)',
          rating: 5,
          quote: 'Absolutely mind-blowing. I own a genuine Datejust, but I wanted a Daytona for daily wear without the risk. The weight, bezel luster, and mechanical chronograph sweep are identical. Hand-delivered in Dubai within 4 hours!',
        },
        {
          id: 2,
          name: 'Marcus Sterling',
          location: 'London, UK',
          role: 'Finance Director',
          watchBought: 'Patek Philippe Nautilus 5711 (3KF)',
          rating: 5,
          quote: 'I was skeptical about the 8.3mm thickness, but 3K Factory nailed it. It fits exactly like my friend\'s authentic 5711. The blue-grey gradient dial shifts beautifully in direct light. Direct WhatsApp ordering was fast and smooth.',
        },
        {
          id: 3,
          name: 'Sarah Jenkins',
          location: 'Los Angeles, USA',
          role: 'Creative Director',
          watchBought: 'Rolex Datejust 41 Wimbledon (Clean Factory)',
          rating: 5,
          quote: 'The Wimbledon slate Roman dial dial is a masterpiece of precision. The fluted bezel catches light like real gold. The Clean Factory bezel luster is superb. Incredible premium customer service from their Dubai desk!',
        },
        {
          id: 4,
          name: 'Khalid Bin-Fahd',
          location: 'Riyadh, Saudi Arabia',
          role: 'Business Owner',
          watchBought: 'Audemars Piguet Royal Oak 15500 (ZF)',
          rating: 5,
          quote: 'Unbelievable craftsmanship on the brushed stainless steel bracelet. The links slide smoothly without any friction, catching light beautifully. Fast courier delivery to Riyadh. Recommended 100%!',
        }
      ]
    },

    // NOCTURNE SECTION (Richard Mille)
    nocturneHeading1: { type: String, default: 'RICHARD' },
    nocturneHeading2: { type: String, default: 'MILLE' },
    nocturneCopy: { type: String, default: 'An exact 1:1 replica of the RM 68-01 Cyril Kongo Tourbillon, blending haute horlogerie with street art aesthetics.' },
    nocturneBuildSpec: { type: String, default: 'KV FACTORY BUILD SPEC' },
    nocturneImage: { type: String, default: 'https://images.weserv.nl/?url=https%3A%2F%2Fticker24watches.com%2Fwp-content%2Fuploads%2F2026%2F04%2FIMG_3434-300x300.webp' },

    // FOOTER SECTION
    footerHeading: { type: String, default: 'CONTACT US' },
    footerWhatsAppNumber: { type: String, default: '971501234567' },
    footerWhatsAppMessage: { type: String, default: 'Hi T24 Watches! I\'m visiting your website and would like to inquire about your premium 1:1 Swiss Clone watch collection.' },
    footerLinks: {
      type: [footerGroupSchema],
      default: [
        {
          title: 'COLLECTIONS',
          links: ['Rolex 1:1 Clones', 'Patek Philippe Clones', 'Audemars Piguet Clones', 'Richard Mille Clones', 'Vacheron Constantin'],
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
          title: 'T24 REPLICA ASSURANCE',
          links: ['1:1 Weight Guarantee', 'AAA+ Precision Sweeping', 'Indistinguishable Engravings', 'Dual Waterproof Seals'],
        }
      ]
    },
    footerCopyright: { type: String, default: '© 2026 T24 Watches Dubai. All rights reserved. 1:1 Swiss Clone replica timepieces.' }
  },
  {
    timestamps: true,
  }
);

export const Homepage = mongoose.model('Homepage', homepageSchema);
export default Homepage;
