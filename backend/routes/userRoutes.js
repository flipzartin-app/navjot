const express = require('express');
const router = express.Router();
const { updateProfile, getMyCourses } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.put('/profile', protect, updateProfile);
router.get('/my-courses', protect, getMyCourses);

module.exports = router;
