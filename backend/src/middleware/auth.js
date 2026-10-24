// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { AppError } = require('./errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_codearena';

/**
 * Authentication middleware
 * Verifies JWT token from Authorization: Bearer <token>
 * Attaches verified user to req.user with req.user.id
 */
async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Missing or malformed Bearer token.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtErr) {
      throw new AppError('Invalid or expired authentication token.', 401);
    }

    if (!decoded || !decoded.id) {
      throw new AppError('Invalid token payload.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  authenticate,
  JWT_SECRET,
};
