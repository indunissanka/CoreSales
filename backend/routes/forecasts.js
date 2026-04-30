const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Forecast = require('../models/Forecast');
const Order = require('../models/Order');

router.use(auth);

// Returns actual qty sold per product per quarter from real orders
async function getActualsMap(userId, year) {
  const startOfYear = new Date(year, 0, 1);
  const endOfYear   = new Date(year + 1, 0, 1);
  const orders = await Order.find({
    createdBy: userId,
    status: { $nin: ['Cancelled', 'Rejected'] },
    createdAt: { $gte: startOfYear, $lt: endOfYear },
  }).populate('items.product', '_id');

  // map: productId_quarter -> total qty
  const map = {};
  for (const o of orders) {
    const month   = new Date(o.createdAt).getMonth(); // 0-11
    const quarter = Math.floor(month / 3) + 1;        // 1-4
    for (const item of (o.items || [])) {
      const pid = String(item.product?._id || item.product);
      const key = `${pid}_${quarter}`;
      map[key] = (map[key] || 0) + (item.quantity || 0);
    }
  }
  return map;
}

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
    const yr = year ? Number(year) : new Date().getFullYear();
    filter.year = yr;
    if (quarter) filter.quarter = Number(quarter);
    const forecasts = await Forecast.find(filter)
      .populate('product', 'name sku unitOfMeasure')
      .sort({ year: 1, quarter: 1 });

    const actuals = await getActualsMap(req.userId, yr);
    const result = forecasts.map(f => {
      const pid = String(f.product?._id || f.product);
      const key = `${pid}_${f.quarter}`;
      const obj = f.toObject();
      obj.actualQty = actuals[key] || 0;
      return obj;
    });
    res.json(result);
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
