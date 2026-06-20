import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginUser as loginApi,
  registerUser as registerApi,
  verifyOtp as verifyOtpApi,
  resendOtp as resendOtpApi,
  logoutUser as logoutApi,
  getMe,
} from '../api/authApi';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await getMe();
        setUser(data.data.user);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem('accessToken', data.data.accessToken);
    setUser(data.data.user);
    setIsAuthenticated(true);
    return data.data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await registerApi(formData);
    return data;
  }, []);

  const verifyOtp = useCallback(async (email, code) => {
    const { data } = await verifyOtpApi({ email, code });
    return data;
  }, []);

  const resendOtp = useCallback(async (email) => {
    const { data } = await resendOtpApi({ email });
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Logout even if API fails
    } finally {
      localStorage.removeItem('accessToken');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [navigate]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    verifyOtp,
    resendOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
