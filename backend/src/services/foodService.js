const Food = require('../models/Food');
const FoodCategory = require('../models/FoodCategory');
const Canteen = require('../models/Canteen');
const { AppError } = require('../middlewares/errorHandler');
const { getFileUrl, deleteFile } = require('../utils/storage');

/**
 * @desc Create a food item
 */
const createFood = async (canteenId, data) => {
  const canteen = await Canteen.findById(canteenId);
  if (!canteen) throw new AppError('Canteen not found', 404);

  const category = await FoodCategory.findById(data.categoryId);
  if (!category) throw new AppError('Food category not found', 404);

  const foodId = await Food.create({
    canteenId,
    categoryId: data.categoryId,
    name: data.name,
    description: data.description,
    price: data.price,
    quantity: data.quantity || 0,
    imageUrl: null,
    zohoItemId: data.zohoItemId || null,
  });

  return await Food.findById(foodId);
};

/**
 * @desc Get food by ID
 */
const getFood = async (id) => {
  const food = await Food.findById(id);
  if (!food) throw new AppError('Food item not found', 404);
  return food;
};

/**
 * @desc Get foods by canteen with filters
 */
const getFoodsByCanteen = async (canteenId, filters) => {
  return await Food.findByCanteenId(canteenId, filters);
};

/**
 * @desc Browse all available foods (public)
 */
const getAllFoods = async (filters) => {
  return await Food.findAll(filters);
};

/**
 * @desc Update food item
 */
const updateFood = async (id, data) => {
  const food = await Food.findById(id);
  if (!food) throw new AppError('Food item not found', 404);

  if (data.categoryId) {
    const category = await FoodCategory.findById(data.categoryId);
    if (!category) throw new AppError('Food category not found', 404);
  }

  await Food.update(id, data);
  return await Food.findById(id);
};

/**
 * @desc Toggle food availability
 */
const toggleAvailability = async (id) => {
  const food = await Food.findById(id);
  if (!food) throw new AppError('Food item not found', 404);

  const newStatus = food.status === 'available' ? 'unavailable' : 'available';
  await Food.updateStatus(id, newStatus);
  return await Food.findById(id);
};

/**
 * @desc Upload food image
 */
const uploadFoodImage = async (id, file) => {
  if (!file) throw new AppError('No image file provided', 400);

  const food = await Food.findById(id);
  if (!food) throw new AppError('Food item not found', 404);

  if (food.image_url) deleteFile(food.image_url);

  const imageUrl = getFileUrl(file, 'foods');
  await Food.update(id, { imageUrl });
  return await Food.findById(id);
};

/**
 * @desc Soft-delete food item
 */
const deleteFood = async (id) => {
  const food = await Food.findById(id);
  if (!food) throw new AppError('Food item not found', 404);
  await Food.softDelete(id);
};

module.exports = {
  createFood,
  getFood,
  getFoodsByCanteen,
  getAllFoods,
  updateFood,
  toggleAvailability,
  uploadFoodImage,
  deleteFood,
};
