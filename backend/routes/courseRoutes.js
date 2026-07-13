const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseBySlug,
  createCourse,
  updateCourse,
  deleteCourse,
  addSection,
  getMyInstructorCourses,
  getCategories,
  incrementLessonView,
} = require('../controllers/courseController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

// Public
router.get('/', getCourses);
router.get('/categories/list', getCategories);

// Instructor
router.get('/instructor/mine', protect, authorize('instructor', 'admin'), getMyInstructorCourses);
router.post('/', protect, authorize('instructor', 'admin'), createCourse);
router.put('/:id', protect, authorize('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteCourse);
router.post('/:id/sections', protect, authorize('instructor', 'admin'), addSection);

// Public (must be after /instructor/mine and /categories/list to avoid slug collision)
router.get('/:slug', optionalAuth, getCourseBySlug);
router.post('/:id/lessons/:lessonId/view', incrementLessonView);

module.exports = router;
