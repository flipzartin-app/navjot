const express = require('express');
const router = express.Router();
const {
  getStats,
  getAllUsers,
  toggleBanUser,
  getPendingCourses,
  approveCourse,
} = require('../controllers/adminController');
const { createCoupon, getAllCoupons, toggleCoupon, deleteCoupon } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect, authorize('admin')); // every route below requires admin

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBanUser);
router.get('/courses/pending', getPendingCourses);
router.put('/courses/:id/approve', approveCourse);

router.post('/coupons', createCoupon);
router.get('/coupons', getAllCoupons);
router.put('/coupons/:id/toggle', toggleCoupon);
router.delete('/coupons/:id', deleteCoupon);

module.exports = router;
