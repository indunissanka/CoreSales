const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product:     { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  year:        { type: Number, required: true },
  quarter:     { type: Number, enum: [1, 2, 3, 4], required: true },
  forecastQty: { type: Number, required: true },
  actualQty:   { type: Number, default: 0 },
  unit:        { type: String, enum: ['kg', 'ton'], default: 'ton' },
  notes:       String,
}, { timestamps: true });

module.exports = mongoose.model('Forecast', forecastSchema);
