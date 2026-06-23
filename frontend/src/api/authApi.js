import axiosInstance from './axiosInstance';

export const registerUser = (data) => {
  return axiosInstance.post('/auth/register', data);
};

export const verifyOtp = (data) => {
  return axiosInstance.post('/auth/verify-otp', data);
};

export const resendOtp = (data) => {
  return axiosInstance.post('/auth/resend-otp', data);
};

export const loginUser = (data) => {
  return axiosInstance.post('/auth/login', data);
};

export const refreshToken = () => {
  return axiosInstance.post('/auth/refresh');
};

export const logoutUser = () => {
  return axiosInstance.post('/auth/logout');
};

export const getMe = () => {
  return axiosInstance.get('/auth/me');
};
