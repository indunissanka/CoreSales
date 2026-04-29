const mongoose = require('mongoose');

const letterOfCreditSchema = new mongoose.Schema({
  lcNumber:          String,
  order:             { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  proformaInvoice:   { type: mongoose.Schema.Types.ObjectId, ref: 'ProformaInvoice', required: true },
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:            {
    type: String,
    enum: ['Pending', 'Opened', 'Discrepancy Found', 'Settled', 'Cancelled'],
    default: 'Pending',
  },
  piDate:            { type: Date, required: true },
  openedDate:        Date,
  expiryDate:        Date,
  amount:            Number,
  currency:          String,
  issuingBank:       String,
  discrepancyNotes:  String,
  alertSent:         { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LetterOfCredit', letterOfCreditSchema);
