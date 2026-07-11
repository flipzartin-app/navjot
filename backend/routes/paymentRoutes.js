const express = require('express');
const router = express.Router();
const {
  createStripeCheckout,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getOrderStatus,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/stripe/checkout', protect, createStripeCheckout);
// NOTE: raw body parsing for this route is configured in server.js BEFORE express.json()
router.post('/stripe/webhook', stripeWebhook);

router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

router.get('/order/:id', protect, getOrderStatus);

module.exports = router;
