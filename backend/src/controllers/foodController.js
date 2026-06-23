const foodService = require('../services/foodService');

/** @route POST /api/foods/canteen/:canteenId */
const createFood = async (req, res, next) => {
  try {
    const food = await foodService.createFood(parseInt(req.params.canteenId), req.body);
    res.status(201).json({ success: true, message: 'Food item created successfully', data: { food } });
  } catch (error) { next(error); }
};

/** @route GET /api/foods/:id */
const getFood = async (req, res, next) => {
  try {
    const food = await foodService.getFood(req.params.id);
    res.status(200).json({ success: true, data: { food } });
  } catch (error) { next(error); }
};

/** @route GET /api/foods/canteen/:canteenId */
const getFoodsByCanteen = async (req, res, next) => {
  try {
    const result = await foodService.getFoodsByCanteen(parseInt(req.params.canteenId), req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** @route GET /api/foods */
const getAllFoods = async (req, res, next) => {
  try {
    const result = await foodService.getAllFoods(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** @route PUT /api/foods/:id */
const updateFood = async (req, res, next) => {
  try {
    const food = await foodService.updateFood(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Food item updated', data: { food } });
  } catch (error) { next(error); }
};

/** @route PATCH /api/foods/:id/availability */
const toggleAvailability = async (req, res, next) => {
  try {
    const food = await foodService.toggleAvailability(req.params.id);
    res.status(200).json({ success: true, message: `Food is now ${food.status}`, data: { food } });
  } catch (error) { next(error); }
};

/** @route POST /api/foods/:id/image */
const uploadFoodImage = async (req, res, next) => {
  try {
    const food = await foodService.uploadFoodImage(req.params.id, req.file);
    res.status(200).json({ success: true, message: 'Image uploaded successfully', data: { food } });
  } catch (error) { next(error); }
};

/** @route DELETE /api/foods/:id */
const deleteFood = async (req, res, next) => {
  try {
    await foodService.deleteFood(req.params.id);
    res.status(200).json({ success: true, message: 'Food item deleted' });
  } catch (error) { next(error); }
};

module.exports = { createFood, getFood, getFoodsByCanteen, getAllFoods, updateFood, toggleAvailability, uploadFoodImage, deleteFood };
