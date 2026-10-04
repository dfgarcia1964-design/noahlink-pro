import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { verifyToken, verifyRefreshToken } from '../middleware/auth.js';

const router = express.Router();

const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

  const refreshToken = jwt.sign(
    { userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '30d' }
  );

  return { accessToken, refreshToken };
};

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({
      email: email.toLowerCase(),
      passwordHash: password,
      firstName,
      lastName
    });

    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.email);

    res.status(201).json({
      message: 'User registered successfully',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.email);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
});

router.post('/refresh', verifyRefreshToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.email);

    res.json({
      accessToken,
      refreshToken
    });
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('devices');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, avatar, preferences } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (avatar) user.avatar = avatar;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    user.updatedAt = new Date();
    await user.save();

    res.json({ message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout successful' });
});

export default router;
