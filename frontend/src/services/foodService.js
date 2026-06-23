import * as foodApi from '../api/foodApi';

export const foodService = {
  createFood: async (canteenId, data) => {
    const response = await foodApi.createFood(canteenId, data);
    return response.data;
  },

  getFoodsByCanteen: async (canteenId) => {
    const response = await foodApi.getFoodsByCanteen(canteenId);
    return response.data;
  },

  getAllFoods: async (params) => {
    const response = await foodApi.getAllFoods(params);
    return response.data;
  },

  getFoodDetails: async (id) => {
    const response = await foodApi.getFoodDetails(id);
    return response.data;
  },

  updateFood: async (id, data) => {
    const response = await foodApi.updateFood(id, data);
    return response.data;
  },

  toggleAvailability: async (id) => {
    const response = await foodApi.toggleAvailability(id);
    return response.data;
  },

  uploadFoodImage: async (id, file) => {
    const response = await foodApi.uploadFoodImage(id, file);
    return response.data;
  },

  deleteFood: async (id) => {
    const response = await foodApi.deleteFood(id);
    return response.data;
  },

  getCategories: async () => {
    const response = await foodApi.getCategories();
    return response.data;
  },
};

export default foodService;
