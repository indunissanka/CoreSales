const mongoose = require('mongoose');

// Singleton document — always use SystemSettings.get() / SystemSettings.set()
const systemSettingsSchema = new mongoose.Schema({
  registrationOpen: { type: Boolean, default: true },
  contactRoles: { type: [String], default: ['Purchasing Manager', 'Lab Technician', 'Director', 'Manager', 'CEO', 'Agent', 'Distributor', 'Other'] },
}, { timestamps: true });

systemSettingsSchema.statics.get = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);
