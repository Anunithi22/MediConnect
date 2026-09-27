import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('mediconnect_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('mediconnect_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate session on app initialization
  const refreshUser = useCallback(async () => {
    const existingToken = localStorage.getItem('mediconnect_token');
    if (!existingToken) {
      setCurrentUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getCurrentUser();
      if (res?.success && res?.user) {
        setCurrentUser(res.user);
        setToken(existingToken);
        localStorage.setItem('mediconnect_user', JSON.stringify(res.user));
      } else {
        throw new Error('Invalid user payload');
      }
    } catch (error) {
      console.warn('Session verification failed, logging out:', error.message);
      localStorage.removeItem('mediconnect_token');
      localStorage.removeItem('mediconnect_user');
      setCurrentUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      if (data?.success && data?.token) {
        localStorage.setItem('mediconnect_token', data.token);
        localStorage.setItem('mediconnect_user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
        toast.success(`Welcome back, ${data.user.fullName}!`);
        return { success: true, user: data.user };
      }
      throw new Error(data?.message || 'Login failed.');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please check credentials.');
      return { success: false, error: error.message };
    }
  };

  // Patient Registration handler
  const registerPatient = async (patientData) => {
    try {
      const data = await authService.registerPatient(patientData);
      if (data?.success && data?.token) {
        localStorage.setItem('mediconnect_token', data.token);
        localStorage.setItem('mediconnect_user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
        toast.success(`Registration successful! Welcome to MediConnect, ${data.user.fullName}.`);
        return { success: true, user: data.user };
      }
      throw new Error(data?.message || 'Registration failed.');
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
      return { success: false, error: error.message };
    }
  };

  // Doctor Registration handler
  const registerDoctor = async (doctorData) => {
    try {
      const data = await authService.registerDoctor(doctorData);
      if (data?.success && data?.token) {
        localStorage.setItem('mediconnect_token', data.token);
        localStorage.setItem('mediconnect_user', JSON.stringify(data.user));
        setToken(data.token);
        setCurrentUser(data.user);
        toast.success('Registration submitted! Account is awaiting admin approval.');
        return { success: true, user: data.user };
      }
      throw new Error(data?.message || 'Doctor registration failed.');
    } catch (error) {
      toast.error(error.message || 'Doctor registration failed.');
      return { success: false, error: error.message };
    }
  };

  // Logout handler
  const logout = async () => {
    await authService.logout();
    setToken(null);
    setCurrentUser(null);
    toast.success('You have been logged out.');
  };

  const value = {
    currentUser,
    token,
    isAuthenticated: !!token && !!currentUser,
    loading,
    login,
    logout,
    registerPatient,
    registerDoctor,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
