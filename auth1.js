const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret');
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'secret');
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

module.exports = router;