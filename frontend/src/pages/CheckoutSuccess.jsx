import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useCart } from '../context/CartContext';

// Stripe redirects here after payment. The webhook enrolls the user asynchronously,
// so we poll the order status briefly until it flips to 'paid'.
const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order');
  const [status, setStatus] = useState('checking');
  const { clearCart } = useCart();

  useEffect(() => {
    if (!orderId) return;
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const { data } = await api.get(`/payments/order/${orderId}`);
        if (data.status === 'paid') {
          setStatus('paid');
          clearCart();
          clearInterval(interval);
        } else if (attempts >= 10) {
          setStatus('pending');
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
        setStatus('error');
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [orderId, clearCart]);

  return (
    <>
      <Helmet><title>Payment Status - EduStream</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        {status === 'checking' && <p>Confirming your payment...</p>}
        {status === 'paid' && (
          <>
            <h1 className="text-2xl font-bold mb-2 text-green-600">Payment Successful!</h1>
            <p className="text-gray-500 mb-6">You're now enrolled. Happy learning.</p>
            <Link to="/my-courses" className="btn-primary">Go to My Courses</Link>
          </>
        )}
        {status === 'pending' && (
          <>
            <h1 className="text-xl font-bold mb-2">Still processing...</h1>
            <p className="text-gray-500">Your payment is being confirmed. Check "My Courses" in a minute.</p>
          </>
        )}
        {status === 'error' && <p className="text-red-500">Couldn't verify order status.</p>}
      </div>
    </>
  );
};

export default CheckoutSuccess;
