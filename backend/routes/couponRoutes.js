const express = require('express');
const router = express.Router();
const { validateCoupon, getActiveCoupons } = require('../controllers/couponController');
const { protect } = require('../middleware/auth');

router.get('/active', protect, getActiveCoupons);
router.post('/validate', protect, validateCoupon);

module.exports = router;
