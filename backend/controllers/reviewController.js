const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Course = require('../models/Course');

const recalculateRating = async (courseId) => {
  const stats = await Review.aggregate([
    { $match: { course: courseId } },
    { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Course.findByIdAndUpdate(courseId, { ratingAverage: avg.toFixed(1), ratingCount: count });
};

// @desc Add or update a review for a course (any logged-in user, no purchase required)
// @route POST /api/reviews/:courseId
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findOneAndUpdate(
    { course: req.params.courseId, user: req.user._id },
    { rating, comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recalculateRating(req.params.courseId);
  res.status(201).json(review);
});

// @desc Get reviews for a course
// @route GET /api/reviews/:courseId
const getCourseReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ course: req.params.courseId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

module.exports = { addReview, getCourseReviews };
