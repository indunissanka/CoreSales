const express        = require('express');
const jwt            = require('jsonwebtoken');
const User           = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const auth           = require('../middleware/auth');

const router = express.Router();
const SECRET = () => process.env.JWT_SECRET || 'secret';

function makeToken(userId) {
  return jwt.sign({ userId }, SECRET(), { expiresIn: '7d' });
}
function userPayload(u) {
  return { id: u._id, username: u.username, name: u.name, area: u.area, role: u.role };
}

// Authenticated — returns current user with live role
router.get('/me', auth, async (req, res) => {
  try {
    const u = await User.findById(req.userId, '-password');
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json(userPayload(u));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public — login page uses this to decide whether to show the Register tab
router.get('/registration-status', async (req, res) => {
  try {
    const count = await User.countDocuments();
    if (count === 0) return res.json({ open: true, reason: 'first' });
    const ss = await SystemSettings.get();
    res.json({ open: ss.registrationOpen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password, name, area } = req.body;
    if (!username || !password || !name)
      return res.status(400).json({ error: 'username, password and name are required' });

    const count = await User.countDocuments();
    const isFirst = count === 0;

    if (!isFirst) {
      const ss = await SystemSettings.get();
      if (!ss.registrationOpen)
        return res.status(403).json({ error: 'Registration is currently closed. Contact your admin.' });
    }

    if (await User.findOne({ username: username.toLowerCase() }))
      return res.status(400).json({ error: 'Username already taken' });

    const role = isFirst ? 'admin' : 'user';
    const user = await User.create({ username, password, name, area, role });

    // After first user is created, initialise SystemSettings
    if (isFirst) await SystemSettings.get();

    const token = makeToken(user._id);
    res.status(201).json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Authenticated — user changes their own password
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'currentPassword and newPassword are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!(await user.comparePassword(currentPassword)))
      return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username: (username || '').toLowerCase() });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: 'Invalid username or password' });
    if (!user.isActive)
      return res.status(403).json({ error: 'Account is disabled. Contact your admin.' });

    const token = makeToken(user._id);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
