const express = require('express');
const router = express.Router();
const { markLessonComplete, getProgress } = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/:courseId', protect, getProgress);
router.post('/:courseId/lesson/:lessonId', protect, markLessonComplete);

module.exports = router;
