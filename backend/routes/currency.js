const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Rates relative to 1 USD — update manually until Phase 2 live fetch
const RATES = { USD: 1, CNY: 7.24, TWD: 32.5 };

router.use(auth);

router.get('/rates', (req, res) => {
  res.json({ base: 'USD', rates: RATES, updatedAt: '2026-04-29' });
});

router.post('/convert', (req, res) => {
  const { amount, from, to } = req.body;
  if (!RATES[from] || !RATES[to]) return res.status(400).json({ error: 'Unsupported currency' });
  const result = (amount / RATES[from]) * RATES[to];
  res.json({ amount, from, to, result: Math.round(result * 10000) / 10000 });
});

module.exports = router;
