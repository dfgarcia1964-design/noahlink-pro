const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { verifyToken, getCurrentUser, JWT_SECRET } = require('../middleware/auth');

// ==================== REGISTRO ====================

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validación
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Verificar si usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Crear nuevo usuario
    const newUser = new User({
      email,
      password,
      firstName: firstName || '',
      lastName: lastName || '',
      emailVerified: false
    });

    await newUser.save();

    // Generar token
    const token = newUser.generateToken(JWT_SECRET);

    // Retornar usuario (sin password)
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== LOGIN ====================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    // Buscar usuario (incluir password para comparar)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Comparar contraseña
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Actualizar lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Generar token
    const token = user.generateToken(JWT_SECRET);

    // Retornar usuario (sin password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== OBTENER USUARIO ACTUAL ====================

router.get('/me', verifyToken, getCurrentUser, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// ==================== ACTUALIZAR PERFIL ====================

router.put('/profile', verifyToken, getCurrentUser, async (req, res) => {
  try {
    const { firstName, lastName, profilePicture } = req.body;

    if (firstName) req.user.firstName = firstName;
    if (lastName) req.user.lastName = lastName;
    if (profilePicture !== undefined) req.user.profilePicture = profilePicture;

    req.user.updatedAt = new Date();
    await req.user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== CAMBIAR CONTRASEÑA ====================

router.post('/change-password', verifyToken, getCurrentUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current and new password required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters'
      });
    }

    // Comparar contraseña actual
    const user = await User.findById(req.userId).select('+password');
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Cambiar contraseña
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ==================== LOGOUT ====================

router.post('/logout', verifyToken, (req, res) => {
  // En implementación real, se guardaría el token en una blacklist
  // Por ahora, solo confirmamos que el logout fue exitoso
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// ==================== VERIFICAR TOKEN ====================

router.post('/verify-token', (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token required'
      });
    }

    const decoded = require('jsonwebtoken').verify(token, JWT_SECRET);

    res.json({
      success: true,
      message: 'Token is valid',
      decoded
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired'
      });
    }

    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
});

module.exports = router;
