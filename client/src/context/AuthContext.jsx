import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user credentials and token exist in storage on application load
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token and fetch profile from backend
          const response = await api.get('/auth/me');
          setUser(response.data.data.user);
        } catch (error) {
          console.error('Session restoration failed:', error.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkLoggedIn();
  }, []);

  /**
   * Submits user credentials to authenticate and store session
   */
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      return { success: false, error: errMsg };
    }
  };

  /**
   * Submits registration details to create a new user profile
   */
  const register = async (username, email, password) => {
    try {
      const response = await api.post('/auth/register', { username, email, password });
      const { user: userData, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.message || 
                     error.response?.data?.errors?.[0]?.message || 
                     'Registration failed';
      return { success: false, error: errMsg };
    }
  };

  /**
   * Wipes session data and logs the user out
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the Auth Context easily in any component
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
