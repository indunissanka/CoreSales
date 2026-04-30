const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  contact:   { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  order:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  date:      { type: Date, required: true },
  duration:  { type: Number, default: 60 },
  location:  String,
  type:      { type: String, enum: ['Call', 'Meeting', 'Site Visit', 'Video Call', 'Other'], default: 'Meeting' },
  notes:     String,
  status:    { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);
