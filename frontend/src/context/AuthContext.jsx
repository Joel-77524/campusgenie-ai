import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Initialize from localStorage ─────────────────────────────────────────
  useEffect(() => {
    const storedToken = localStorage.getItem('ait_token');
    const storedUser = localStorage.getItem('ait_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('ait_token');
        localStorage.removeItem('ait_user');
      }
    }
    setLoading(false);
  }, []);

  // ─── Verify token still valid on mount ────────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;
      try {
        const res = await api.get('/auth/me');
        setUser(res.data.user);
        localStorage.setItem('ait_user', JSON.stringify(res.data.user));
      } catch {
        logout();
      }
    };
    if (token) verifyToken();
  }, []); // only on mount

  const persist = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('ait_token', authToken);
    localStorage.setItem('ait_user', JSON.stringify(userData));
  };

  // ─── Register ──────────────────────────────────────────────────────────────
  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    persist(res.data.user, res.data.token);
    return res.data;
  }, []);

  // ─── Login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    persist(res.data.user, res.data.token);
    return res.data;
  }, []);

  // ─── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ait_token');
    localStorage.removeItem('ait_user');
  }, []);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{ user, token, loading, isAuthenticated, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
