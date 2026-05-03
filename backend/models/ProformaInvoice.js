const mongoose = require('mongoose');

const piLineItemSchema = new mongoose.Schema({
  productName: String,
  sku:         String,
  quantity:    Number,
  unit:        String,
  unitPrice:   Number,
  lineTotal:   Number,
});

const proformaInvoiceSchema = new mongoose.Schema({
  piNumber:          { type: String, unique: true },
  order:             { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  issuedBy:          { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issuedDate:        { type: Date, default: Date.now },
  validUntil:        Date,
  incoterm:          String,
  portOfLoading:     String,
  portOfDestination: String,
  currency:          String,
  items:             [piLineItemSchema],
  bankDetails:       String,
  sellerInfo:        String,
  buyerInfo:         String,
  specialTerms:      String,
  paymentTerms:      [String],
  orderNo:           String,
  quotationNo:       String,
  totalAmount:       Number,
  status:            { type: String, enum: ['Draft', 'Issued', 'Superseded'], default: 'Draft' },
}, { timestamps: true });

module.exports = mongoose.model('ProformaInvoice', proformaInvoiceSchema);
