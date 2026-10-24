// backend/src/services/authService.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/errorHandler');
const { JWT_SECRET } = require('../middleware/auth');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

/**
 * Register a new user
 */
async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  return { token, user };
}

/**
 * Authenticate existing user
 */
async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.passwordHash) {
    throw new AppError('Invalid email or password.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

/**
 * Get current user profile
 */
async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
}

/**
 * Handle Google Sign-In / Sign-Up
 */
async function handleGoogleAuth({ credential, accessToken, email, name, avatar, googleId }) {
  let userEmail = email;
  let userName = name;
  let userAvatar = avatar;
  let userGoogleId = googleId;

  // 1. If Google ID Token (credential) is provided, verify with Google
  if (credential) {
    try {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
      );
      if (response.ok) {
        const payload = await response.json();
        userEmail = payload.email || userEmail;
        userName = payload.name || payload.given_name || userName;
        userAvatar = payload.picture || userAvatar;
        userGoogleId = payload.sub || userGoogleId;
      } else {
        // Fallback: If JWT format, attempt base64 decode (helpful for dev/mock tokens)
        try {
          const parts = credential.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
            userEmail = payload.email || userEmail;
            userName = payload.name || userName;
            userAvatar = payload.picture || userAvatar;
            userGoogleId = payload.sub || userGoogleId;
          }
        } catch (_) {}
      }
    } catch (err) {
      console.warn('Google tokeninfo fetch error:', err.message);
    }
  }

  // 2. If Access Token is provided, fetch userinfo from Google
  if (accessToken && !userEmail) {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (response.ok) {
        const payload = await response.json();
        userEmail = payload.email || userEmail;
        userName = payload.name || payload.given_name || userName;
        userAvatar = payload.picture || userAvatar;
        userGoogleId = payload.sub || userGoogleId;
      }
    } catch (err) {
      console.warn('Google userinfo fetch error:', err.message);
    }
  }

  if (!userEmail) {
    throw new AppError('Unable to authenticate with Google: Email not provided or verified.', 400);
  }

  const normalizedEmail = userEmail.trim().toLowerCase();
  const finalName = (userName && userName.trim()) || normalizedEmail.split('@')[0];

  let user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
    },
  });

  let isNewUser = false;

  if (!user) {
    isNewUser = true;
    user = await prisma.user.create({
      data: {
        name: finalName,
        email: normalizedEmail,
        passwordHash: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

  return {
    token,
    user: {
      ...user,
      avatar: userAvatar || null,
    },
    isNewUser,
  };
}

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  handleGoogleAuth,
};
