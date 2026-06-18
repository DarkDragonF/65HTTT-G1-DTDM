import axiosInstance from './axiosInstance';

export const createCanteen = (data) => {
  return axiosInstance.post('/canteens', data);
};

export const getMyCanteens = () => {
  return axiosInstance.get('/canteens/my');
};

export const getCanteenDetails = (id) => {
  return axiosInstance.get(`/canteens/${id}`);
};

export const getAllCanteens = (params) => {
  return axiosInstance.get('/canteens', { params });
};

export const updateCanteen = (id, data) => {
  return axiosInstance.put(`/canteens/${id}`, data);
};

export const uploadLogo = (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return axiosInstance.post(`/canteens/${id}/logo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteCanteen = (id) => {
  return axiosInstance.delete(`/canteens/${id}`);
};

export const updateCanteenStatus = (id, status) => {
  return axiosInstance.patch(`/canteens/${id}/status`, { status });
};
