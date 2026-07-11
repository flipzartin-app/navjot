const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Course = require('../models/Course');
const User = require('../models/User');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

const computeCartTotal = async (courseIds) => {
  const courses = await Course.find({ _id: { $in: courseIds } });
  if (courses.length !== courseIds.length) {
    throw new Error('One or more courses in cart no longer exist');
  }
  const items = courses.map((c) => ({ course: c._id, price: c.discountPrice > 0 ? c.discountPrice : c.price }));
  const total = items.reduce((sum, i) => sum + i.price, 0);
  return { items, total, courses };
};

// @desc Create a Stripe Checkout session
// @route POST /api/payments/stripe/checkout
const createStripeCheckout = asyncHandler(async (req, res) => {
  const { courseIds } = req.body;
  if (!courseIds || !courseIds.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const { items, total, courses } = await computeCartTotal(courseIds);

  const order = await Order.create({
    user: req.user._id,
    courses: items,
    totalAmount: total,
    paymentProvider: 'stripe',
    status: 'pending',
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: courses.map((c) => ({
      price_data: {
        currency: 'usd',
        product_data: { name: c.title },
        unit_amount: Math.round((c.discountPrice > 0 ? c.discountPrice : c.price) * 100),
      },
      quantity: 1,
    })),
    success_url: `${process.env.CLIENT_URL}/checkout/success?order=${order._id}`,
    cancel_url: `${process.env.CLIENT_URL}/checkout?canceled=1`,
    metadata: { orderId: order._id.toString(), userId: req.user._id.toString() },
  });

  order.orderRef = session.id;
  await order.save();

  res.json({ url: session.url, orderId: order._id });
});

// @desc Stripe webhook - confirms payment and enrolls user
// @route POST /api/payments/stripe/webhook
// NOTE: this route must receive the RAW body (configured in server.js), not JSON-parsed
const stripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const order = await Order.findById(session.metadata.orderId);
    if (order && order.status !== 'paid') {
      order.status = 'paid';
      order.paymentId = session.payment_intent;
      await order.save();
      await enrollUserInOrderCourses(order);
    }
  }

  res.json({ received: true });
});

// @desc Create a Razorpay order
// @route POST /api/payments/razorpay/order
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { courseIds } = req.body;
  if (!courseIds || !courseIds.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const { items, total } = await computeCartTotal(courseIds);

  const order = await Order.create({
    user: req.user._id,
    courses: items,
    totalAmount: total,
    currency: 'inr',
    paymentProvider: 'razorpay',
    status: 'pending',
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(total * 100), // paise
    currency: 'INR',
    receipt: order._id.toString(),
  });

  order.orderRef = razorpayOrder.id;
  await order.save();

  res.json({
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    orderId: order._id,
  });
});

// @desc Verify Razorpay payment signature (called by frontend after checkout success)
// @route POST /api/payments/razorpay/verify
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    res.status(400);
    throw new Error('Payment verification failed - signature mismatch');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (order.status !== 'paid') {
    order.status = 'paid';
    order.paymentId = razorpay_payment_id;
    await order.save();
    await enrollUserInOrderCourses(order);
  }

  res.json({ message: 'Payment verified, enrollment complete', order });
});

// Shared helper: enroll user in all courses from a paid order
async function enrollUserInOrderCourses(order) {
  const user = await User.findById(order.user);
  order.courses.forEach(({ course }) => {
    const already = user.enrolledCourses.some((e) => e.course.toString() === course.toString());
    if (!already) user.enrolledCourses.push({ course });
  });
  await user.save();
  await Course.updateMany(
    { _id: { $in: order.courses.map((c) => c.course) } },
    { $inc: { studentsCount: 1 } }
  );
}

// @desc Get order status (used for Stripe success page polling, since webhook is async)
// @route GET /api/payments/order/:id
const getOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.user.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error('Order not found');
  }
  res.json(order);
});

module.exports = {
  createStripeCheckout,
  stripeWebhook,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getOrderStatus,
};
