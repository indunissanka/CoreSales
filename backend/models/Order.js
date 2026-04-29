const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:  { type: Number, required: true },
  unit:      { type: String, enum: ['kg', 'ton'], default: 'ton' },
  unitPrice: { type: Number, required: true },
  lineTotal: Number,
});

const orderSchema = new mongoose.Schema({
  orderNo:           { type: String, unique: true },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contact:           { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  status:            {
    type: String,
    enum: ['Enquiry', 'Quotation Sent', 'PI Issued', 'LC Opened', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Enquiry',
  },
  items:             [orderItemSchema],
  incoterm:          { type: String, enum: ['FOB', 'CIF', 'CFR', 'EXW'], default: 'FOB' },
  portOfLoading:     String,
  portOfDestination: String,
  currency:          { type: String, enum: ['USD', 'CNY', 'TWD'], default: 'USD' },
  totalAmount:       Number,
  notes:             String,
  proformaInvoice:   { type: mongoose.Schema.Types.ObjectId, ref: 'ProformaInvoice' },
  letterOfCredit:    { type: mongoose.Schema.Types.ObjectId, ref: 'LetterOfCredit' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
