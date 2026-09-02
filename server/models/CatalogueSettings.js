import mongoose from 'mongoose';

export const DEFAULT_MASTER_BRANDS = [
  {
    name: 'Richard Mille',
    models: ['RM 11-03', 'RM 35-02', 'RM 67-02', 'RM 21-02', 'RM 55'],
    isActive: true,
  },
  {
    name: 'Audemars Piguet',
    models: ['Royal Oak', 'Royal Oak Offshore', 'Concept'],
    isActive: true,
  },
  {
    name: 'Patek Philippe',
    models: ['Nautilus', 'Aquanaut', 'Complications', 'Twenty-4', 'Gondolo', 'Calatrava'],
    isActive: true,
  },
  {
    name: 'Rolex',
    models: ['Daytona', 'Submariner', 'Datejust', 'GMT-Master', 'Day-Date', 'Yacht-Master', 'Sea-Dweller', 'Sky-Dweller', 'Milgauss', 'Cellini'],
    isActive: true,
  },
  {
    name: 'Hublot',
    models: ['Big Bang', 'Classic Fusion', 'Spirit of Big Bang'],
    isActive: true,
  },
  {
    name: 'Vacheron Constantin',
    models: ['Patrimony', 'Overseas', 'Historiques', 'Traditionnelle'],
    isActive: true,
  },
  {
    name: 'Omega',
    models: ['Speedmaster', 'Seamaster', 'Constellation', 'De Ville'],
    isActive: true,
  },
  {
    name: 'Cartier',
    models: ['Santos', 'Tank', 'Baignoire', 'Panthère', 'Ballon Bleu'],
    isActive: true,
  },
  {
    name: 'Panerai',
    models: ['Luminor', 'Radiomir', 'Submersible'],
    isActive: true,
  },
  {
    name: 'IWC',
    models: ['Portugieser', 'Pilot', 'Portofino', 'Ingenieur'],
    isActive: true,
  },
  {
    name: 'Breitling',
    models: ['Navitimer', 'Chronomat', 'Superocean', 'Premier'],
    isActive: true,
  },
  {
    name: 'Roger Dubuis',
    models: ['Excalibur', 'Knights of the Round Table', 'Velvet'],
    isActive: true,
  },
];

const masterBrandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    models: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { _id: false }
);

const catalogueSettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'master-brands',
    },
    brands: {
      type: [masterBrandSchema],
      default: () => DEFAULT_MASTER_BRANDS.map((brand) => ({
        ...brand,
        models: [...brand.models],
      })),
    },
  },
  { timestamps: true }
);

const CatalogueSettings = mongoose.model('CatalogueSettings', catalogueSettingsSchema);

export default CatalogueSettings;
