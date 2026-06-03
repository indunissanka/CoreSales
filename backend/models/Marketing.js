const mongoose = require('mongoose');

const marketingSchema = new mongoose.Schema({
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName:   { type: String, required: true, trim: true },
  contactPerson: { type: String, required: true, trim: true },
  email:         { type: String, required: true, trim: true, lowercase: true },
  phone:         { type: String, default: '' },
  notes:         { type: String, default: '' },
}, { timestamps: true });

marketingSchema.index({ createdBy: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Marketing', marketingSchema);
