const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  key: { type: String, required: true, unique: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);
