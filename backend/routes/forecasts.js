const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Forecast = require('../models/Forecast');

router.use(auth);

router.get('/summary', async (req, res) => {
  try {
    const { year } = req.query;
    const match = { createdBy: require('mongoose').Types.ObjectId.createFromHexString(req.userId) };
    if (year) match.year = Number(year);
    const summary = await Forecast.aggregate([
      { $match: match },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: '$productInfo' },
      { $group: {
        _id: { product: '$product', productName: '$productInfo.name', year: '$year', quarter: '$quarter' },
        forecastQty: { $sum: '$forecastQty' },
        actualQty:   { $sum: '$actualQty' },
      }},
      { $sort: { '_id.year': 1, '_id.quarter': 1 } },
    ]);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { year, quarter } = req.query;
    const filter = { createdBy: req.userId };
    if (year) filter.year = Number(year);
    if (quarter) filter.quarter = Number(quarter);
    const forecasts = await Forecast.find(filter)
      .populate('product', 'name sku unitOfMeasure')
      .sort({ year: 1, quarter: 1 });
    res.json(forecasts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const forecast = await Forecast.findById(req.params.id).populate('product');
    if (!forecast) return res.status(404).json({ error: 'Not found' });
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const forecast = new Forecast({ ...req.body, createdBy: req.userId });
    await forecast.save();
    res.status(201).json(forecast);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const forecast = await Forecast.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!forecast) return res.status(404).json({ error: 'Not found' });
    res.json(forecast);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Forecast.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
