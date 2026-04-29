const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const router = express.Router();
const SECRET = () => process.env.JWT_SECRET || 'secret';

router.post('/register', async (req, res) => {
  try {
    const { username, password, name, area } = req.body;
    if (!username || !password || !name)
      return res.status(400).json({ error: 'username, password and name are required' });

    if (await User.findOne({ username: username.toLowerCase() }))
      return res.status(400).json({ error: 'Username already taken' });

    const user  = await User.create({ username, password, name, area });
    const token = jwt.sign({ userId: user._id }, SECRET(), { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, username: user.username, name: user.name, area: user.area } });
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

    const token = jwt.sign({ userId: user._id }, SECRET(), { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, name: user.name, area: user.area } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
