import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
<<<<<<< HEAD
import GoogleSignInButton from '../components/GoogleSignInButton';
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
<<<<<<< HEAD
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

=======
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Welcome back!');
<<<<<<< HEAD
      redirectAfterAuth(user);
=======
      const redirectTo = location.state?.from?.pathname ||
        (user.role === 'admin' ? '/admin' : user.role === 'instructor' ? '/instructor' : '/dashboard');
      navigate(redirectTo, { replace: true });
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
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
<<<<<<< HEAD
              <div className="text-right mt-1">
                <Link to="/forgot-password" className="text-xs text-primary-600 font-medium">Forgot password?</Link>
              </div>
=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
<<<<<<< HEAD

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
          </div>

          <GoogleSignInButton onSuccess={handleGoogleSuccess} />

=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
          <p className="text-sm text-center mt-6 text-gray-500">
            Don't have an account? <Link to="/register" className="text-primary-600 font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
