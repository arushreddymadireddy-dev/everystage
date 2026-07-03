const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { signAccessToken, signRefreshToken, hashToken } = require('../utils/tokens');

const REFRESH_COOKIE = 'everystage_rt';
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };
}

function checkValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: errors.array()[0].msg });
    return false;
  }
  return true;
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { fullName, email, password, role, program, graduationYear } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      passwordHash: password, // hashed by the pre('save') hook
      role,
      program,
      graduationYear,
    });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    if (!checkValidation(req, res)) return;

    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+passwordHash +failedLoginAttempts +lockUntil'
    );

    // Same generic error whether the email doesn't exist or the password is wrong —
    // avoids leaking which emails are registered.
    const genericError = () => res.status(401).json({ error: 'Incorrect email or password' });

    if (!user) return genericError();

    if (user.isLocked()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(423).json({ error: `Account temporarily locked. Try again in ${minutesLeft} min.` });
    }

    const valid = await user.comparePassword(password);

    if (!valid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        user.failedLoginAttempts = 0;
      }
      await user.save();
      return genericError();
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions());
    res.json({ user, accessToken });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/refresh — issues a new access token from the httpOnly refresh cookie
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (!token) return res.status(401).json({ error: 'No refresh token' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.sub).select('+refreshTokenHash');

    if (!user || user.refreshTokenHash !== hashToken(token)) {
      return res.status(401).json({ error: 'Refresh token invalid' });
    }

    const accessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save();

    res.cookie(REFRESH_COOKIE, newRefreshToken, refreshCookieOptions());
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'Session expired, please sign in again' });
  }
}

// POST /api/auth/logout
async function logout(req, res, next) {
  try {
    const token = req.cookies?.[REFRESH_COOKIE];
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        await User.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: 1 } });
      } catch (_) {
        // token already invalid — nothing to clean up
      }
    }
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { register, login, refresh, logout, me };
