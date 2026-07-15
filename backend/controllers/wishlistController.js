const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');

const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('courses', '-sections');
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, courses: [] });
  res.json(wishlist);
});

const toggleWishlist = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, courses: [] });

  const exists = wishlist.courses.some((c) => c.toString() === courseId);
  if (exists) {
    wishlist.courses = wishlist.courses.filter((c) => c.toString() !== courseId);
  } else {
    wishlist.courses.push(courseId);
  }
  await wishlist.save();
  res.json({ wishlist, added: !exists });
});

module.exports = { getWishlist, toggleWishlist };
