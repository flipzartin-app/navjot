import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

<<<<<<< HEAD
  const googleLogin = async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken });
    localStorage.setItem('token', data.token);
    setUser(data);
    return data;
  };

=======
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
<<<<<<< HEAD
    <AuthContext.Provider value={{ user, setUser, login, register, googleLogin, logout, loading, isAuthenticated: !!user }}>
=======
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, isAuthenticated: !!user }}>
>>>>>>> c0a128aeb558892a02210138ef7def36a76fab87
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
