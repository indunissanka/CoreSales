const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const SECRET = () => process.env.JWT_SECRET || 'secret';

module.exports = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, SECRET());
    const user = await User.findById(decoded.userId);
    if (!user || user.role !== 'admin')
      return res.status(403).json({ error: 'Admin access required' });
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
