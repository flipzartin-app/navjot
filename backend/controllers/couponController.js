const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');
const { computeCartTotal } = require('../utils/cartUtils');

// Core validation logic - shared between the "preview discount at checkout" endpoint below
// and the actual payment controllers, so a coupon can never be applied differently at charge
// time than what the user saw. Throws a plain Error with a user-facing message on failure.
const validateCouponForCart = async (code, cartTotal) => {
  if (!code) return null;

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (!coupon) throw new Error('Invalid coupon code');
  if (!coupon.isActive) throw new Error('This coupon is no longer active');
  if (coupon.expiresAt && coupon.expiresAt < new Date()) throw new Error('This coupon has expired');
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    throw new Error('This coupon has reached its usage limit');
  }
  if (cartTotal < coupon.minPurchaseAmount) {
    throw new Error(`This coupon requires a minimum purchase of ₹${coupon.minPurchaseAmount}`);
  }

  let discount = coupon.discountType === 'percentage' ? (cartTotal * coupon.discountValue) / 100 : coupon.discountValue;
  discount = Math.min(discount, cartTotal); // never discount below ₹0
  discount = Math.round(discount * 100) / 100;

  return { coupon, discount, finalTotal: Math.round((cartTotal - discount) * 100) / 100 };
};

// @desc Preview a coupon's discount against the current cart (does not consume a use)
// @route POST /api/coupons/validate
const validateCoupon = asyncHandler(async (req, res) => {
  const { code, courseIds } = req.body;
  if (!courseIds || !courseIds.length) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const { total } = await computeCartTotal(courseIds);

  try {
    const result = await validateCouponForCart(code, total);
    res.json({
      valid: true,
      code: result.coupon.code,
      discount: result.discount,
      finalTotal: result.finalTotal,
      originalTotal: total,
    });
  } catch (err) {
    res.status(400);
    throw err;
  }
});

// @desc List currently valid coupons (active, not expired, not maxed out) for display at checkout
// @route GET /api/coupons/active
const getActiveCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
  }).select('code discountType discountValue minPurchaseAmount maxUses usedCount');

  // Filter out maxed-out coupons in code, since "not yet reached max uses" needs a field comparison
  // Mongoose can't easily express in a single query ($expr works but this is clearer and coupons lists are small).
  const available = coupons.filter((c) => c.maxUses === null || c.usedCount < c.maxUses);

  res.json(available.map((c) => ({
    code: c.code,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minPurchaseAmount: c.minPurchaseAmount,
  })));
});

// @desc Create a coupon (admin only)
// @route POST /api/admin/coupons
const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountType, discountValue, maxUses, minPurchaseAmount, expiresAt } = req.body;

  if (!code || !discountType || discountValue === undefined) {
    res.status(400);
    throw new Error('Code, discount type, and discount value are required');
  }
  if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
    res.status(400);
    throw new Error('Percentage discount must be between 1 and 100');
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existing) {
    res.status(400);
    throw new Error('A coupon with this code already exists');
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType,
    discountValue,
    maxUses: maxUses || null,
    minPurchaseAmount: minPurchaseAmount || 0,
    expiresAt: expiresAt || null,
    createdBy: req.user._id,
  });

  res.status(201).json(coupon);
});

// @desc List all coupons (admin only)
// @route GET /api/admin/coupons
const getAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc Toggle a coupon active/inactive (admin only)
// @route PUT /api/admin/coupons/:id/toggle
const toggleCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  coupon.isActive = !coupon.isActive;
  await coupon.save();
  res.json(coupon);
});

// @desc Delete a coupon (admin only)
// @route DELETE /api/admin/coupons/:id
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }
  await coupon.deleteOne();
  res.json({ message: 'Coupon deleted' });
});

module.exports = {
  validateCoupon,
  validateCouponForCart,
  getActiveCoupons,
  createCoupon,
  getAllCoupons,
  toggleCoupon,
  deleteCoupon,
};
