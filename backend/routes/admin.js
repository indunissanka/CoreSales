const express        = require('express');
const bcrypt         = require('bcryptjs');
const crypto         = require('crypto');
const router         = express.Router();
const adminAuth      = require('../middleware/adminAuth');
const User           = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const ApiKey         = require('../models/ApiKey');

router.use(adminAuth);

// GET /api/admin/system — get system settings (registrationOpen)
router.get('/system', async (req, res) => {
  try {
    const ss = await SystemSettings.get();
    res.json({ registrationOpen: ss.registrationOpen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/system — update system settings
router.put('/system', async (req, res) => {
  try {
    const ss = await SystemSettings.get();
    if (typeof req.body.registrationOpen === 'boolean')
      ss.registrationOpen = req.body.registrationOpen;
    await ss.save();
    res.json({ registrationOpen: ss.registrationOpen });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/users — create user manually
router.post('/users', async (req, res) => {
  try {
    const { username, password, name, area, role } = req.body;
    if (!username || !password || !name)
      return res.status(400).json({ error: 'username, password and name are required' });
    if (await User.findOne({ username: username.toLowerCase() }))
      return res.status(400).json({ error: 'Username already taken' });
    const user = await User.create({ username, password, name, area, role: role || 'user' });
    res.status(201).json({ id: user._id, username: user.username, name: user.name, area: user.area, role: user.role, isActive: user.isActive, createdAt: user.createdAt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admin/users/:id — update user (role, isActive)
router.put('/users/:id', async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.isActive === 'boolean') update.isActive = req.body.isActive;
    if (req.body.role) update.role = req.body.role;
    if (req.body.password) update.password = await bcrypt.hash(req.body.password, 10);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, select: '-password' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id — delete user (cannot delete self)
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === String(req.userId))
      return res.status(400).json({ error: 'Cannot delete your own account' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/api-keys — list all API keys (key masked)
router.get('/api-keys', async (req, res) => {
  try {
    const keys = await ApiKey.find({}).sort({ createdAt: -1 });
    res.json(keys.map(k => ({
      _id: k._id,
      label: k.label,
      keyPreview: k.key.slice(0, 8) + '…',
      isActive: k.isActive,
      createdAt: k.createdAt
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/api-keys — generate a new API key
router.post('/api-keys', async (req, res) => {
  try {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: 'label is required' });
    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = await ApiKey.create({ label, key, createdBy: req.userId });
    res.status(201).json({ _id: apiKey._id, label: apiKey.label, key, createdAt: apiKey.createdAt });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admin/api-keys/:id — revoke an API key
router.delete('/api-keys/:id', async (req, res) => {
  try {
    const apiKey = await ApiKey.findByIdAndDelete(req.params.id);
    if (!apiKey) return res.status(404).json({ error: 'API key not found' });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
