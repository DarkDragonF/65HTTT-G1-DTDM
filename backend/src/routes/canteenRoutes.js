const { Router } = require('express');
const canteenController = require('../controllers/canteenController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { verifyCanteenOwnership } = require('../middlewares/ownershipMiddleware');
const { validate, createCanteenSchema, updateCanteenSchema, updateStatusSchema } = require('../validations/canteenValidation');
const { uploadTo } = require('../middlewares/upload');

const router = Router();

/**
 * @route   POST /api/canteens
 * @desc    Create a new canteen
 * @access  Private (canteen_owner)
 */
router.post('/', verifyToken, requireRole('canteen_owner'), validate(createCanteenSchema), canteenController.createCanteen);

/**
 * @route   GET /api/canteens/my
 * @desc    Get canteens owned by authenticated user
 * @access  Private (canteen_owner)
 */
router.get('/my', verifyToken, requireRole('canteen_owner'), canteenController.getMyCanteens);

/**
 * @route   GET /api/canteens
 * @desc    Get all canteens (public browse)
 * @access  Public
 */
router.get('/', canteenController.getAllCanteens);

/**
 * @route   GET /api/canteens/:id
 * @desc    Get canteen details
 * @access  Public
 */
router.get('/:id', canteenController.getCanteen);

/**
 * @route   PUT /api/canteens/:id
 * @desc    Update canteen info
 * @access  Private (canteen_owner: own, admin: all)
 */
router.put('/:id', verifyToken, requireRole('canteen_owner', 'admin'), verifyCanteenOwnership, validate(updateCanteenSchema), canteenController.updateCanteen);

/**
 * @route   PATCH /api/canteens/:id/status
 * @desc    Update canteen status
 * @access  Private (admin only)
 */
router.patch('/:id/status', verifyToken, requireRole('admin'), validate(updateStatusSchema), canteenController.updateCanteenStatus);

/**
 * @route   POST /api/canteens/:id/logo
 * @desc    Upload canteen logo
 * @access  Private (canteen_owner: own, admin: all)
 */
router.post('/:id/logo', verifyToken, requireRole('canteen_owner', 'admin'), verifyCanteenOwnership, ...uploadTo('logos'), canteenController.uploadLogo);

/**
 * @route   DELETE /api/canteens/:id
 * @desc    Delete canteen
 * @access  Private (admin only)
 */
router.delete('/:id', verifyToken, requireRole('admin'), canteenController.deleteCanteen);

module.exports = router;
