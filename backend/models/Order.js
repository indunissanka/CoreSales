const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:   { type: Number, required: true },
  unit:       { type: String, enum: ['kg', 'ton'], default: 'kg' },
  unitPrice:  { type: Number, required: true },
  drumsPrice: { type: Number, default: 0 },
  bankCharge: { type: Number, default: 0 },
  shipping:   { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  unitTotal:  Number,
  lineTotal:  Number,
});

const shippingScheduleSchema = new mongoose.Schema({
  productionDate:  Date,
  bookingDate:     Date,
  cargoClosingDate:Date,
  etd:             Date,
  eta:             Date,
  deliveryDate:    Date,
  carrier:         String,
  trackingNumber:  String,
  tags:            [String],
  shipmentNotes:   String,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNo:           { type: String, unique: true },
  quotationNo:       { type: String },
  exchangeRate:      { type: Number },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contact:           { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  status:            {
    type: String,
    enum: ['Enquiry', 'Quotation Sent', 'PI Issued', 'LC Opened', 'Shipped', 'Delivered', 'Cancelled', 'Rejected'],
    default: 'Enquiry',
  },
  items:             [orderItemSchema],
  incoterm:          { type: String, enum: ['FOB', 'CIF', 'CFR', 'EXW'], default: 'FOB' },
  portOfLoading:     String,
  portOfDestination: String,
  currency:          { type: String, enum: ['USD', 'CNY', 'TWD'], default: 'USD' },
  totalAmount:       Number,
  subtotalAmount:    Number,
  inspectionCharges: { type: Number, default: 0 },
  taxRate:           { type: Number, default: 0 },
  bankChargeMethod:  String,
  orderTerms:        String,
  paymentTerms:      [String],
  notes:             String,
  shippingSchedule:  shippingScheduleSchema,
  proformaInvoice:   { type: mongoose.Schema.Types.ObjectId, ref: 'ProformaInvoice' },
  letterOfCredit:    { type: mongoose.Schema.Types.ObjectId, ref: 'LetterOfCredit' },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
