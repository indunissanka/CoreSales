const express         = require('express');
const router          = express.Router();
const auth            = require('../middleware/auth');
const Contact         = require('../models/Contact');
const Product         = require('../models/Product');
const Order           = require('../models/Order');
const ProformaInvoice = require('../models/ProformaInvoice');
const LetterOfCredit  = require('../models/LetterOfCredit');
const Sample          = require('../models/Sample');
const Forecast        = require('../models/Forecast');
const Meeting         = require('../models/Meeting');
const Report          = require('../models/Report');
const Settings        = require('../models/Settings');

router.use(auth);

// GET /api/backup/export — download full backup as JSON
router.get('/export', async (req, res) => {
  try {
    const uid = req.userId;
    const [contacts, products, orders, proformaInvoices, lettersOfCredit,
           samples, forecasts, meetings, reports, settings] = await Promise.all([
      Contact.find({ createdBy: uid }).lean(),
      Product.find({ createdBy: uid }).lean(),
      Order.find({ createdBy: uid }).lean(),
      ProformaInvoice.find({ createdBy: uid }).lean(),
      LetterOfCredit.find({ createdBy: uid }).lean(),
      Sample.find({ createdBy: uid }).lean(),
      Forecast.find({ createdBy: uid }).lean(),
      Meeting.find({ createdBy: uid }).lean(),
      Report.find({ createdBy: uid }).lean(),
      Settings.findOne({ user: uid }).lean(),
    ]);

    const payload = {
      exportedAt: new Date().toISOString(),
      userId: uid,
      contacts, products, orders, proformaInvoices, lettersOfCredit,
      samples, forecasts, meetings, reports,
      settings: settings ? [settings] : [],
    };

    const date = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="coresales-backup-${date}.json"`);
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/backup/import — restore from backup JSON
router.post('/import', async (req, res) => {
  try {
    const uid = req.userId;
    const b   = req.body;

    const upsert = (Model, docs, extraFilter = {}) => {
      if (!docs || !docs.length) return Promise.resolve({ upsertedCount: 0, modifiedCount: 0 });
      return Model.bulkWrite(
        docs.map(doc => {
          const { _id, ...fields } = doc;
          return {
            updateOne: {
              filter: { _id, ...extraFilter },
              update: { $set: { ...fields, ...extraFilter } },
              upsert: true,
            },
          };
        })
      );
    };

    const [rc, rp, ro, rpi, rlc, rs, rf, rm, rr] = await Promise.all([
      upsert(Contact,         b.contacts         || [], { createdBy: uid }),
      upsert(Product,         b.products         || [], { createdBy: uid }),
      upsert(Order,           b.orders           || [], { createdBy: uid }),
      upsert(ProformaInvoice, b.proformaInvoices || [], { createdBy: uid }),
      upsert(LetterOfCredit,  b.lettersOfCredit  || [], { createdBy: uid }),
      upsert(Sample,          b.samples          || [], { createdBy: uid }),
      upsert(Forecast,        b.forecasts        || [], { createdBy: uid }),
      upsert(Meeting,         b.meetings         || [], { createdBy: uid }),
      upsert(Report,          b.reports          || [], { createdBy: uid }),
    ]);

    // Settings is one record per user
    if (b.settings && b.settings.length) {
      const { _id: _sid, ...sFields } = b.settings[0];
      await Settings.findOneAndUpdate(
        { user: uid },
        { $set: { ...sFields, user: uid } },
        { upsert: true }
      );
    }

    const count = r => (r.upsertedCount || 0) + (r.modifiedCount || 0);
    res.json({
      contacts: count(rc), products: count(rp), orders: count(ro),
      proformaInvoices: count(rpi), lettersOfCredit: count(rlc),
      samples: count(rs), forecasts: count(rf), meetings: count(rm), reports: count(rr),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
