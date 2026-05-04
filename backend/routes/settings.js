const express  = require('express');
const router   = express.Router();
const auth     = require('../middleware/auth');
const Settings = require('../models/Settings');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const s = await Settings.findOne({ user: req.userId }) || {};
    res.json(s);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const allowed = ['companyName', 'companySlogan', 'sellerAddress', 'bankDetails', 'logoBase64',
                     'orderNoPrefix', 'quotationNoPrefix', 'defaultUnit'];
    const update  = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
    const s = await Settings.findOneAndUpdate(
      { user: req.userId },
      { $set: update },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(s);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
