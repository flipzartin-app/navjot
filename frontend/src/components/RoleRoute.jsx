import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Wraps routes that require a specific role (instructor, admin). Assumes already inside ProtectedRoute
// or handles both auth + role checks if used standalone.
const RoleRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return <div className="text-center py-20">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return children;
};

export default RoleRoute;
