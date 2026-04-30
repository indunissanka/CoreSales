const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName:   { type: String, default: '' },
  companySlogan: { type: String, default: '' },
  sellerAddress: { type: String, default: '' },
  bankDetails:   { type: String, default: '' },
  logoBase64:    { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
