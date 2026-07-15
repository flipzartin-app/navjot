import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectAfterAuth = (user) => {
    const redirectTo = location.state?.from?.pathname ||
      (user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard');
    navigate(redirectTo, { replace: true });
  };

  const handleGoogleSuccess = async (idToken) => {
    try {
      const user = await googleLogin(idToken);
      toast.success('Welcome!');
      redirectAfterAuth(user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google sign-in failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
      redirectAfterAuth(user);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Login - EduStream</title></Helmet>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="card p-8">
          <h1 className="text-2xl font-bold mb-6 text-center">Welcome Back</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Password</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-primary-600 font-medium">Forgot password?</Link>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <GoogleSignInButton onSuccess={handleGoogleSuccess} />

          <p className="text-sm text-center mt-6 text-gray-500">
            Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
