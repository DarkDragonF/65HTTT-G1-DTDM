import axiosInstance from './axiosInstance';

export const createFood = (canteenId, data) => {
  return axiosInstance.post(`/foods/canteen/${canteenId}`, data);
};

export const getFoodsByCanteen = (canteenId) => {
  return axiosInstance.get(`/foods/canteen/${canteenId}`);
};

export const getAllFoods = (params) => {
  return axiosInstance.get('/foods', { params });
};

export const getFoodDetails = (id) => {
  return axiosInstance.get(`/foods/${id}`);
};

export const updateFood = (id, data) => {
  return axiosInstance.put(`/foods/${id}`, data);
};

export const toggleAvailability = (id) => {
  return axiosInstance.patch(`/foods/${id}/availability`);
};

export const uploadFoodImage = (id, file) => {
  const formData = new FormData();
  formData.append('image', file);
  return axiosInstance.post(`/foods/${id}/image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteFood = (id) => {
  return axiosInstance.delete(`/foods/${id}`);
};

export const getCategories = () => {
  return axiosInstance.get('/categories');
};
