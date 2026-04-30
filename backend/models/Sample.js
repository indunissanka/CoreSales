const mongoose = require('mongoose');

const sampleItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 0.1 },
}, { _id: false });

const sampleSchema = new mongoose.Schema({
  company:          { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  receivingAddress: { type: String, default: '' },
  telephone:        { type: String, default: '' },
  products:         [sampleItemSchema],
  waybillNumber:    { type: String, default: '' },
  relatedDocument:  { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  courier:          { type: String, enum: ['FedEx', 'DHL', 'UPS', 'TNT', 'SF Express', 'Other'], default: 'FedEx' },
  status:           { type: String, enum: ['Pending', 'Dispatched', 'Delivered', 'Returned', 'Cancelled'], default: 'Pending' },
  notes:            { type: String, default: '' },
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Sample', sampleSchema);
