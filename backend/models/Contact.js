const mongoose = require('mongoose');

const commLogSchema = new mongoose.Schema({
  date:      { type: Date, default: Date.now },
  channel:   { type: String, enum: ['WhatsApp', 'Email', 'Phone', 'In-Person'], required: true },
  direction: { type: String, enum: ['Inbound', 'Outbound'], required: true },
  summary:   { type: String, required: true },
  by:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const contactSchema = new mongoose.Schema({
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company:     { type: String, required: true },
  name:        { type: String, required: true },
  role:        { type: String, enum: ['Purchasing Manager', 'Lab Technician', 'Director', 'Other'], default: 'Other' },
  email:       String,
  phone:       String,
  country:     { type: String, default: 'Bangladesh' },
  city:        String,
  notes:       String,
  commHistory: [commLogSchema],
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
