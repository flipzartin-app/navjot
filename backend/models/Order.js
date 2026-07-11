const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    paymentProvider: { type: String, enum: ['stripe', 'razorpay'], required: true },
    paymentId: { type: String }, // stripe payment_intent id or razorpay payment id
    orderRef: { type: String }, // razorpay order id / stripe session id
    status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
