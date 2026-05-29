const jwt    = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey');

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.userId = decoded.userId;
      return next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  }

  const apiKeyValue = req.headers['x-api-key'];
  if (apiKeyValue) {
    try {
      const apiKey = await ApiKey.findOne({ key: apiKeyValue, isActive: true });
      if (!apiKey) return res.status(401).json({ error: 'Invalid or revoked API key' });
      req.userId = apiKey.createdBy;
      return next();
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.status(401).json({ error: 'Authentication required' });
};
