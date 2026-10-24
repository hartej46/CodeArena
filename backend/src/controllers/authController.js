// backend/src/controllers/authController.js
const { z } = require('zod');
const authService = require('../services/authService');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const googleAuthSchema = z.object({
  credential: z.string().optional(),
  accessToken: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  googleId: z.string().optional(),
});

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const input = registerSchema.parse(req.body);
    const result = await authService.registerUser(input);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const input = loginSchema.parse(req.body);
    const result = await authService.loginUser(input);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/google
 */
async function googleAuth(req, res, next) {
  try {
    const input = googleAuthSchema.parse(req.body);
    const result = await authService.handleGoogleAuth(input);
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/me
 */
async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/demo
 */
async function demoLogin(req, res, next) {
  try {
    const result = await authService.loginDemoUser();
    res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  googleAuth,
  me,
  demoLogin,
};
