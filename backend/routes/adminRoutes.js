const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleBanUser,
  getPendingCourses,
  approveCourse,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin')); // every route below requires admin

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);

module.exports = router;
