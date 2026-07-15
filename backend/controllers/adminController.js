const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Course = require('../models/Course');
const Order = require('../models/Order');

// @desc Admin dashboard stats
// @route GET /api/admin/stats
const getStats = asyncHandler(async (req, res) => {
  const [userCount, instructorCount, courseCount, pendingApprovalCount, revenueAgg] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'instructor' }),
    Course.countDocuments(),
    Course.countDocuments({ isPublished: true, isApproved: false }),
    Order.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);

  res.json({
    userCount,
    instructorCount,
    courseCount,
    pendingApprovalCount,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
});

// @desc List all users
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc Ban / unban a user
// @route PUT /api/admin/users/:id/ban
const toggleBanUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.isBanned = !user.isBanned;
  await user.save();
  res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, user });
});

// @desc Directly set a new password for a user (works with zero email setup - admin authority only)
// @route PUT /api/admin/users/:id/reset-password
const resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.password = newPassword; // pre-save hook hashes it
  await user.save();

  res.json({ message: `Password reset for ${user.email} - share the new password with them directly` });
});

// @desc List courses pending admin approval
// @route GET /api/admin/courses/pending
const getPendingCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ isPublished: true, isApproved: false }).populate('instructor', 'name email');
  res.json(courses);
});

// @desc Approve a course for public listing
// @route PUT /api/admin/courses/:id/approve
const approveCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  course.isApproved = true;
  await course.save();
  res.json({ message: 'Course approved', course });
});

module.exports = { getStats, getAllUsers, toggleBanUser, resetUserPassword, getPendingCourses, approveCourse };
