import * as authApi from '../api/authApi';

export const authService = {
  login: async (email, password) => {
    const response = await authApi.loginUser({ email, password });
    return response.data;
  },
  register: async (data) => {
    const response = await authApi.registerUser(data);
    return response.data;
  },
  verifyOtp: async (email, code) => {
    const response = await authApi.verifyOtp({ email, code });
    return response.data;
  },
  resendOtp: async (email) => {
    const response = await authApi.resendOtp({ email });
    return response.data;
  },
  logout: async () => {
    const response = await authApi.logoutUser();
    return response.data;
  },
  getMe: async () => {
    const response = await authApi.getMe();
    return response.data;
  }
};

export default authService;
