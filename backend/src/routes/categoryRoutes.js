const { Router } = require('express');
const FoodCategory = require('../models/FoodCategory');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const { AppError } = require('../middlewares/errorHandler');

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all food categories
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const categories = await FoodCategory.findAll();
    res.status(200).json({ success: true, data: { categories } });
  } catch (error) { next(error); }
});

/**
 * @route   POST /api/categories
 * @desc    Create food category
 * @access  Private (admin only)
 */
router.post('/', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description, icon, sortOrder } = req.body;
    if (!name) throw new AppError('Category name is required', 400);

    const id = await FoodCategory.create({ name, description, icon, sortOrder });
    const category = await FoodCategory.findById(id);
    res.status(201).json({ success: true, message: 'Category created', data: { category } });
  } catch (error) { next(error); }
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update food category
 * @access  Private (admin only)
 */
router.put('/:id', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const category = await FoodCategory.findById(req.params.id);
    if (!category) throw new AppError('Category not found', 404);

    await FoodCategory.update(req.params.id, req.body);
    const updated = await FoodCategory.findById(req.params.id);
    res.status(200).json({ success: true, message: 'Category updated', data: { category: updated } });
  } catch (error) { next(error); }
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete food category
 * @access  Private (admin only)
 */
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res, next) => {
  try {
    const category = await FoodCategory.findById(req.params.id);
    if (!category) throw new AppError('Category not found', 404);

    await FoodCategory.delete(req.params.id);
    res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
