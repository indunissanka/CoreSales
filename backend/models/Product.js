const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name:             { type: String, required: true },
  sku:              { type: String, unique: true, sparse: true },
  category:         String,
  grade:            String,
  casNumber:        String,
  packagingTypes:   [String],
  unitOfMeasure:    { type: String, enum: ['kg', 'ton', 'L'], default: 'kg' },
  basePrice:        Number,
  priceLastUpdated: Date,
  priceLinkNote:    String,
  technicalNotes:   String,
  isActive:         { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
