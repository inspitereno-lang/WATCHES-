import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      default: 'THE ART OF 1:1 SWISS CLONES',
    },
    subtitleLabel: {
      type: String,
      required: true,
      default: 'T24 WATCHES DUBAI:',
    },
    subtitleDesc: {
      type: String,
      required: true,
      default: 'Indistinguishable Swiss movements & 904L Oystersteel',
    },
    bodyDescription: {
      type: String,
      required: true,
      default: 'Indulge in absolute luxury. Our hand-curated 1:1 Swiss Clone replica watches are visually and mechanically identical to the originals, engineered for those who demand uncompromising perfection.',
    },
    ctaLabel: {
      type: String,
      required: true,
      default: 'SHOP 1:1 CLONE WATCHES',
    },
    ctaTarget: {
      type: String,
      required: true,
      default: '#store',
    },
    watchImageUrl: {
      type: String,
      required: true,
      default: 'https://res.cloudinary.com/dwqxzzqpn/image/upload/v1781171809/t24_watches_defaults/eehkzalmujmziwekwq9a.png',
    },
    watchLabelLine1: { type: String, default: 'AETERNA' },
    watchLabelLine2: { type: String, default: 'NOCTURNE' },
    watchLabelLine3: { type: String, default: 'ROSE GOLD' },
    watchLabelLine4: { type: String, default: 'CHRONOGRAPH' },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

export const Hero = mongoose.model('Hero', heroSchema);
export default Hero;
