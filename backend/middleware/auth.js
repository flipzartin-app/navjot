const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Verifies JWT and attaches user to req
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('User not found');
      }
      if (req.user.isBanned) {
        res.status(403);
        throw new Error('Account suspended');
      }
      return next();
    } catch (err) {
      res.status(401);
      throw new Error('Not authorized, token invalid or expired');
    }
  }

  res.status(401);
  throw new Error('Not authorized, no token provided');
});

// Attaches req.user if a valid token is present, but never blocks the request if absent/invalid.
// Used on public routes (like course details) that behave differently for logged-in users.
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      req.user = null; // invalid/expired token - just proceed as guest
    }
  }
  next();
});

module.exports = { protect, optionalAuth };
