const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName:   { type: String, default: '' },
  companySlogan: { type: String, default: '' },
  sellerAddress: { type: String, default: '' },
  bankDetails:   { type: String, default: '' },
  logoBase64:        { type: String, default: '' },
  orderNoPrefix:     { type: String, default: 'TC-M' },
  quotationNoPrefix: { type: String, default: 'QT-M' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
