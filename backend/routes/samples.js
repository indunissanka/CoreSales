const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const Sample  = require('../models/Sample');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const filter = { createdBy: req.userId };
    if (req.query.status) filter.status = req.query.status;
    const samples = await Sample.find(filter)
      .populate('company', 'company name')
      .populate('products.product', 'name sku')
      .populate('relatedDocument', 'orderNo')
      .sort({ createdAt: -1 });
    res.json(samples);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const sample = await Sample.findOne({ _id: req.params.id, createdBy: req.userId })
      .populate('company', 'company name')
      .populate('products.product', 'name sku')
      .populate('relatedDocument', 'orderNo');
    if (!sample) return res.status(404).json({ error: 'Not found' });
    res.json(sample);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const sample = new Sample({ ...req.body, createdBy: req.userId });
    await sample.save();
    res.status(201).json(sample);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const sample = await Sample.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'company name')
     .populate('products.product', 'name sku')
     .populate('relatedDocument', 'orderNo');
    if (!sample) return res.status(404).json({ error: 'Not found' });
    res.json(sample);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const sample = await Sample.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!sample) return res.status(404).json({ error: 'Not found' });
    res.json({ deleted: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
