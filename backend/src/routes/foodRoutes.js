const { Router } = require('express');
const foodController = require('../controllers/foodController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { verifyCanteenOwnership, verifyFoodOwnership } = require('../middlewares/ownershipMiddleware');
const { validate, createFoodSchema, updateFoodSchema } = require('../validations/foodValidation');
const { uploadTo } = require('../middlewares/upload');

const router = Router();

/**
 * @route   POST /api/foods/canteen/:canteenId
 * @desc    Create food item for a canteen
 * @access  Private (canteen_owner: own)
 */
router.post('/canteen/:canteenId', verifyToken, requireRole('canteen_owner'), verifyCanteenOwnership, validate(createFoodSchema), foodController.createFood);

/**
 * @route   GET /api/foods/canteen/:canteenId
 * @desc    Get menu for a canteen
 * @access  Public
 */
router.get('/canteen/:canteenId', foodController.getFoodsByCanteen);

/**
 * @route   GET /api/foods
 * @desc    Browse all available foods
 * @access  Public
 */
router.get('/', foodController.getAllFoods);

/**
 * @route   GET /api/foods/:id
 * @desc    Get food item details
 * @access  Public
 */
router.get('/:id', foodController.getFood);

/**
 * @route   PUT /api/foods/:id
 * @desc    Update food item
 * @access  Private (canteen_owner: own, admin: all)
 */
router.put('/:id', verifyToken, requireRole('canteen_owner', 'admin', 'super_admin'), verifyFoodOwnership, validate(updateFoodSchema), foodController.updateFood);

/**
 * @route   PATCH /api/foods/:id/availability
 * @desc    Toggle food availability
 * @access  Private (canteen_owner: own)
 */
router.patch('/:id/availability', verifyToken, requireRole('canteen_owner'), verifyFoodOwnership, foodController.toggleAvailability);

/**
 * @route   POST /api/foods/:id/image
 * @desc    Upload food image
 * @access  Private (canteen_owner: own, admin: all)
 */
router.post('/:id/image', verifyToken, requireRole('canteen_owner', 'admin', 'super_admin'), verifyFoodOwnership, ...uploadTo('foods'), foodController.uploadFoodImage);

/**
 * @route   DELETE /api/foods/:id
 * @desc    Soft-delete food item
 * @access  Private (canteen_owner: own, admin: all)
 */
router.delete('/:id', verifyToken, requireRole('canteen_owner', 'admin', 'super_admin'), verifyFoodOwnership, foodController.deleteFood);

module.exports = router;
