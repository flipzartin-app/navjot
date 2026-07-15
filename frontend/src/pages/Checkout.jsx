import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { FiCopy } from 'react-icons/fi';
import api from '../services/api';
import { useCart } from '../context/CartContext';

// Loads the Razorpay checkout.js script once, on demand
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const { cart, total, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, finalTotal }
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('canceled')) toast.error('Payment canceled');
  }, [searchParams]);

  useEffect(() => {
    api.get('/coupons/active').then((res) => setAvailableCoupons(res.data)).catch(() => {});
  }, []);

  const copyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCouponInput(code); // also pre-fill the input so the user just has to click Apply
    toast.success(`Copied "${code}" - click Apply to use it`);
  };

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const courseIds = cart.map((c) => c._id);
      const { data } = await api.post('/coupons/validate', { code: couponInput, courseIds });
      setAppliedCoupon(data);
      toast.success(`Coupon applied - ₹${data.discount} off`);
    } catch (err) {
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
  };

  const payWithStripe = async () => {
    setProcessing(true);
    try {
      const courseIds = cart.map((c) => c._id);
      const { data } = await api.post('/payments/stripe/checkout', {
        courseIds,
        couponCode: appliedCoupon?.code || undefined,
      });
      window.location.href = data.url; // redirect to Stripe Checkout
    } catch (err) {
      toast.error(err.response?.data?.message || 'Stripe checkout failed');
      setProcessing(false);
    }
  };

  const payWithRazorpay = async () => {
    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Razorpay SDK failed to load. Check your connection.');
        setProcessing(false);
        return;
      }
      const courseIds = cart.map((c) => c._id);
      const { data } = await api.post('/payments/razorpay/order', {
        courseIds,
        couponCode: appliedCoupon?.code || undefined,
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'EduStream',
        description: 'Course purchase',
        order_id: data.razorpayOrderId,
        handler: async (response) => {
          try {
            await api.post('/payments/razorpay/verify', { ...response, orderId: data.orderId });
            clearCart();
            toast.success('Payment successful! You are enrolled.');
            navigate('/my-courses');
          } catch {
            toast.error('Payment verification failed');
          }
        },
        modal: { ondismiss: () => setProcessing(false) },
        theme: { color: '#4f46e5' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Razorpay checkout failed');
      setProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Your cart is empty.</p>
        <Link to="/courses" className="text-primary-600 font-medium">Browse courses</Link>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Checkout - EduStream</title></Helmet>
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>
        <div className="card p-6 mb-6">
          <h2 className="font-semibold mb-3">Order Summary</h2>
          {cart.map((c) => (
            <div key={c._id} className="flex justify-between text-sm py-1.5">
              <span className="line-clamp-1">{c.title}</span>
              <span>₹{c.discountPrice > 0 ? c.discountPrice : c.price}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>

          {appliedCoupon ? (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between text-sm text-green-600">
                <span>Coupon ({appliedCoupon.code})</span>
                <span>-₹{appliedCoupon.discount}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-1">
                <span>You pay</span>
                <span>₹{appliedCoupon.finalTotal.toFixed(2)}</span>
              </div>
              <button onClick={removeCoupon} className="text-xs text-gray-400 hover:text-red-500 mt-2">Remove coupon</button>
            </div>
          ) : (
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex gap-2">
                <input
                  placeholder="Coupon code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="input-field font-mono flex-1"
                />
                <button onClick={applyCoupon} disabled={applyingCoupon} className="btn-secondary shrink-0">
                  {applyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {availableCoupons.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-400">Available offers:</p>
                  {availableCoupons.map((c) => (
                    <div key={c.code} className="flex items-center justify-between text-sm border border-dashed border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2">
                      <div>
                        <span className="font-mono font-medium">{c.code}</span>
                        <span className="text-gray-500 ml-2">
                          {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
                          {c.minPurchaseAmount > 0 && ` on orders over ₹${c.minPurchaseAmount}`}
                        </span>
                      </div>
                      <button
                        onClick={() => copyCoupon(c.code)}
                        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 shrink-0 ml-2"
                      >
                        <FiCopy size={14} /> Copy
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card p-6 space-y-3">
          <h2 className="font-semibold mb-2">Choose Payment Method</h2>
          <button onClick={payWithStripe} disabled={processing} className="btn-primary w-full">
            Pay with Stripe (Card)
          </button>
          <button onClick={payWithRazorpay} disabled={processing} className="btn-secondary w-full">
            Pay with Razorpay (UPI / Cards / Wallets)
          </button>
          <p className="text-xs text-gray-400 text-center pt-2">Test mode - use provider test cards, no real charges will occur.</p>
        </div>
      </div>
    </>
  );
};

export default Checkout;
