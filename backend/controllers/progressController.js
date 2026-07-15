const asyncHandler = require('express-async-handler');
const Progress = require('../models/Progress');
const Course = require('../models/Course');

// @desc Mark a lesson complete / update progress
// @route POST /api/progress/:courseId/lesson/:lessonId
const markLessonComplete = asyncHandler(async (req, res) => {
  const { courseId, lessonId } = req.params;

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0) || 1;

  let progress = await Progress.findOne({ user: req.user._id, course: courseId });
  if (!progress) {
    progress = await Progress.create({ user: req.user._id, course: courseId, completedLessons: [] });
  }

  if (!progress.completedLessons.includes(lessonId)) {
    progress.completedLessons.push(lessonId);
  }
  progress.percentComplete = Math.min(100, Math.round((progress.completedLessons.length / totalLessons) * 100));
  progress.lastAccessedAt = new Date();
  await progress.save();

  res.json(progress);
});

// @desc Get progress for a course
// @route GET /api/progress/:courseId
const getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOne({ user: req.user._id, course: req.params.courseId });
  res.json(progress || { completedLessons: [], percentComplete: 0 });
});

module.exports = { markLessonComplete, getProgress };
