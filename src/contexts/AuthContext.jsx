// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Initialize axios with token interceptor
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Response interceptor to handle token expiration
    axios.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
                headers: { 'Authorization': `Bearer ${refreshToken}` }
              });
              
              const newAccessToken = response.data.access_token;
              localStorage.setItem('access_token', newAccessToken);
              axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              
              return axios(originalRequest);
            }
          } catch (refreshError) {
            logout();
            window.location.href = '/login';
          }
        }
        
        return Promise.reject(error);
      }
    );
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const storedUser = localStorage.getItem('policy_user');
      
      if (token && storedUser) {
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify token by getting user profile
        const response = await axios.get(`${API_URL}/auth/profile`);
        
        if (response.status === 200) {
          const userData = response.data;
          setUser(userData);
          setIsAuthenticated(true);
          
          // Update stored user data
          const updatedUser = {
            ...JSON.parse(storedUser),
            ...userData,
            loginTime: new Date().toISOString()
          };
          localStorage.setItem('policy_user', JSON.stringify(updatedUser));
        } else {
          logout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.status === 200) {
        const { tokens, user: userData } = response.data;
        
        // Store tokens
        localStorage.setItem('access_token', tokens.access_token);
        localStorage.setItem('refresh_token', tokens.refresh_token);
        
        // Store user data
        const userWithSession = {
          ...userData,
          loginTime: new Date().toISOString(),
          sessionId: Math.random().toString(36).substring(7)
        };
        localStorage.setItem('policy_user', JSON.stringify(userWithSession));
        
        // Set axios header
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokens.access_token}`;
        
        setUser(userWithSession);
        setIsAuthenticated(true);
        
        return { success: true, user: userWithSession };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('policy_user');
    localStorage.removeItem('isAuthenticated');
    
    // Clear axios header
    delete axios.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        hasPermission,
        checkAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};