const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc Register new user
// @route POST /api/auth/register
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email');
  }

  // Only allow 'student' or 'instructor' at signup; 'admin' must be set manually in DB
  const safeRole = ['student', 'instructor'].includes(role) ? role : 'student';

  const user = await User.create({ name, email, password, role: safeRole });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    hasPassword: true, // normal registration always sets a password
    token: generateToken(user._id, user.role),
  });
});

// @desc Login user
// @route POST /api/auth/login
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error('This account has been suspended');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    hasPassword: !!user.password,
    token: generateToken(user._id, user.role),
  });
});

// @desc Get logged-in user's profile
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  // req.user (from the auth middleware) never includes the password field at all, so there's
  // no way to tell from it whether the account has one - do a fresh lookup just for that check.
  const fullUser = await User.findById(req.user._id).select('+password');
  res.json({
    ...req.user.toObject(),
    hasPassword: !!fullUser.password,
  });
});

// @desc Request a password reset email
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way whether or not the account exists - this stops someone from
  // using this endpoint to check which emails are registered on the platform.
  const genericResponse = { message: 'If an account with that email exists, a reset link has been sent.' };

  if (!user) {
    res.json(genericResponse);
    return;
  }

  if (user.googleId && !user.password) {
    // Nothing useful to reset for a Google-only account - still respond generically,
    // but don't send an email that would confuse them.
    res.json(genericResponse);
    return;
  }

  // Store only a hash of the token in the DB - if the database ever leaks, the leaked hashes
  // are useless without the raw token, which only ever exists in the emailed link.
  const rawToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your EduStream password',
      html: `
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  } catch (err) {
    // Roll back the token so a failed email doesn't leave a valid unusable reset request hanging
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    console.error('Failed to send password reset email:', err.message);
    res.status(500);
    throw new Error('Could not send reset email - check the server\'s SMTP configuration');
  }

  res.json(genericResponse);
});

// @desc Reset password using the token from the emailed link
// @route POST /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('This reset link is invalid or has expired - request a new one');
  }

  user.password = password; // pre-save hook hashes it
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful - you can now log in with your new password' });
});

// @desc Sign in (or sign up, if first time) with a Google ID token
// @route POST /api/auth/google
const googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    res.status(400);
    throw new Error('Missing Google ID token');
  }

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    res.status(401);
    throw new Error('Invalid Google sign-in - please try again');
  }

  const { sub: googleId, email, name, picture } = payload;

  let user = await User.findOne({ googleId }).select('+password');

  if (!user) {
    // Not found by googleId - check if this email already has a password-based account,
    // and link Google sign-in to it rather than creating a duplicate account.
    user = await User.findOne({ email }).select('+password');
    if (user) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture || '';
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || '',
        role: 'student', // Google sign-up always creates a student account; role changes go through an admin
      });
    }
  }

  if (user.isBanned) {
    res.status(403);
    throw new Error('This account has been suspended');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    hasPassword: !!user.password,
    token: generateToken(user._id, user.role),
  });
});

module.exports = { registerUser, loginUser, getMe, forgotPassword, resetPassword, googleAuth };
