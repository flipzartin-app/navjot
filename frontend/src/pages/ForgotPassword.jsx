import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong - try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Forgot Password - EduStream</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password</h1>
          {sent ? (
            <>
              <p className="text-sm text-gray-500 text-center mt-4">
                If an account with that email exists, we've sent a password reset link. Check your inbox
                (and spam folder) - the link expires in 1 hour.
              </p>
              <Link to="/login" className="btn-secondary w-full text-center block mt-6">Back to Login</Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500 text-center mb-6">Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
              <p className="text-sm text-center mt-6 text-gray-500">
                <Link to="/login" className="text-primary-600 font-medium">Back to Login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
