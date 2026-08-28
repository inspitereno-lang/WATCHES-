import mongoose from 'mongoose';

const accessorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Straps', 'Boxes', 'Accessories'],
    default: 'Straps',
    index: true,
  },
  brandCompatibility: {
    type: String,
    default: 'Universal',
    trim: true,
  },
  priceAED: {
    type: String,
    required: true,
  },
  priceUSD: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  images: [{
    type: String,
  }],
  description: {
    type: String,
    default: '',
  },
  material: {
    type: String,
    default: '',
  },
  inStock: {
    type: Boolean,
    default: true,
  },
  isVisible: {
    type: Boolean,
    default: true,
    index: true,
  },
  nameAr: String,
  descriptionAr: String,
  categoryAr: String,
  materialAr: String,
}, {
  timestamps: true,
});

const Accessory = mongoose.model('Accessory', accessorySchema);

export default Accessory;
