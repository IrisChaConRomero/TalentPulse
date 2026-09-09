import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('talentpulse_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (token) {
      api.get('/auth/me/')
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    setAuthError(null);
    try {
      const res = await api.post('/auth/login/', { username, password });
      const newToken = res.data.token;
      const userData = res.data.user;

      localStorage.setItem('talentpulse_token', newToken);
      setToken(newToken);
      setUser(userData);
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al iniciar sesión';
      setAuthError(msg);
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout/');
    } catch (e) {
      // Ignorar errores al expirar sesión
    }
    localStorage.removeItem('talentpulse_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, authError, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
