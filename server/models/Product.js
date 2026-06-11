import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
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
    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    factory: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    priceUSD: {
      type: String,
      required: true,
    },
    priceAED: {
      type: String,
      required: true,
    },
    url: {
      type: String,
    },
    image: {
      type: String,
      required: true,
    },
    movement: {
      type: String,
      required: true,
    },
    casing: {
      type: String,
      required: true,
    },
    bezel: {
      type: String,
      required: true,
    },
    glass: {
      type: String,
      required: true,
    },
    waterResistance: {
      type: String,
      required: true,
      default: '50m waterproof vacuum tested',
    },
    description: {
      type: String,
      required: true,
    },
    features: {
      type: [String],
      default: [],
    },
    inStock: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ name: 'text', factory: 'text', brand: 'text' });

export const Product = mongoose.model('Product', productSchema);
export default Product;
