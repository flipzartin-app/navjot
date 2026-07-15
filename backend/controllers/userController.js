const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');

// @desc Update own profile
// @route PUT /api/users/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const { name, bio, avatar, currentPassword, password } = req.body;

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (avatar) user.avatar = avatar;

  if (password) {
    // If the account already has a password, require the current one before changing it -
    // stops a stolen/leaked JWT alone from being enough to silently take over the account.
    // Accounts with no password yet (Google-only sign-in) can set one for the first time freely.
    if (user.password) {
      if (!currentPassword) {
        res.status(400);
        throw new Error('Current password is required to set a new password');
      }
      const matches = await user.matchPassword(currentPassword);
      if (!matches) {
        res.status(401);
        throw new Error('Current password is incorrect');
      }
    }
    user.password = password; // pre-save hook will hash it
  }

  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar, bio: user.bio });
});

// @desc Get courses the logged-in user is enrolled in
// @route GET /api/users/my-courses
const getMyCourses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'enrolledCourses.course',
    select: '-sections',
    populate: { path: 'instructor', select: 'name' },
  });
  res.json(user.enrolledCourses);
});

module.exports = { updateProfile, getMyCourses };
