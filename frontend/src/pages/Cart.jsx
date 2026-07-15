import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, removeFromCart, total } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <>
      <Helmet><title>Cart - EduStream</title></Helmet>
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-8">Your Cart</h1>
        {cart.length === 0 ? (
          <p className="text-gray-500">Your cart is empty. <Link to="/courses" className="text-primary-600 font-medium">Browse courses</Link></p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              {cart.map((course) => {
                const finalPrice = course.discountPrice > 0 ? course.discountPrice : course.price;
                return (
                  <div key={course._id} className="card p-4 flex gap-4 items-center">
                    <div className="w-28 aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shrink-0">
                      {course.thumbnail && <img src={course.thumbnail} className="w-full h-full object-cover" alt={course.title} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium line-clamp-1">{course.title}</p>
                      <p className="text-sm text-gray-500">{course.instructor?.name}</p>
                    </div>
                    <span className="font-bold">₹{finalPrice}</span>
                    <button onClick={() => removeFromCart(course._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                      <FiTrash2 />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="card p-6 h-fit">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span className="font-medium">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button onClick={handleCheckout} className="btn-primary w-full mt-6">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;
