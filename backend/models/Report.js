const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  itemNo:   { type: Number },
  client:   { type: String, default: '' },
  date:     { type: Date },
  purpose: {
    new:          { type: Boolean, default: false },
    followUp:     { type: Boolean, default: false },
    illustration: { type: Boolean, default: false },
    after:        { type: Boolean, default: false },
    decision:     { type: String, enum: ['', 'Decided', 'Undecided'], default: '' },
    orders:       { type: Boolean, default: false }
  },
  result: {
    develop:  { type: Boolean, default: false },
    newClient:{ type: Boolean, default: false },
    original: { type: Boolean, default: false }
  },
  category:  { type: String, default: '' },
  guestName: { type: String, default: '' },
  content:   { type: String, default: '' }
});

const reportSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekStart:      { type: Date, required: true },
  weekEnd:        { type: Date, required: true },
  area:           { type: String, default: '' },
  formFiller:     { type: String, default: '' },
  entries:        [entrySchema],
  suggestions:    { type: String, default: '' },
  weeklyResults:  { type: String, default: '' },
  monthlyResults: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
