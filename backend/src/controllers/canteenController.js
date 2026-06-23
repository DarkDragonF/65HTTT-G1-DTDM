const canteenService = require('../services/canteenService');

/** @route POST /api/canteens */
const createCanteen = async (req, res, next) => {
  try {
    const canteen = await canteenService.createCanteen(req.user.id, req.body);
    res.status(201).json({ success: true, message: 'Canteen created successfully', data: { canteen } });
  } catch (error) { next(error); }
};

/** @route GET /api/canteens/:id */
const getCanteen = async (req, res, next) => {
  try {
    const canteen = await canteenService.getCanteen(req.params.id);
    res.status(200).json({ success: true, data: { canteen } });
  } catch (error) { next(error); }
};

/** @route GET /api/canteens/my */
const getMyCanteens = async (req, res, next) => {
  try {
    const canteens = await canteenService.getMyCanteens(req.user.id);
    res.status(200).json({ success: true, data: { canteens } });
  } catch (error) { next(error); }
};

/** @route GET /api/canteens */
const getAllCanteens = async (req, res, next) => {
  try {
    const result = await canteenService.getAllCanteens(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

/** @route PUT /api/canteens/:id */
const updateCanteen = async (req, res, next) => {
  try {
    const canteen = await canteenService.updateCanteen(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Canteen updated successfully', data: { canteen } });
  } catch (error) { next(error); }
};

/** @route PATCH /api/canteens/:id/status */
const updateCanteenStatus = async (req, res, next) => {
  try {
    const canteen = await canteenService.updateCanteenStatus(req.params.id, req.body.status);
    res.status(200).json({ success: true, message: 'Canteen status updated', data: { canteen } });
  } catch (error) { next(error); }
};

/** @route POST /api/canteens/:id/logo */
const uploadLogo = async (req, res, next) => {
  try {
    const canteen = await canteenService.uploadLogo(req.params.id, req.file);
    res.status(200).json({ success: true, message: 'Logo uploaded successfully', data: { canteen } });
  } catch (error) { next(error); }
};

/** @route DELETE /api/canteens/:id */
const deleteCanteen = async (req, res, next) => {
  try {
    await canteenService.deleteCanteen(req.params.id);
    res.status(200).json({ success: true, message: 'Canteen deleted successfully' });
  } catch (error) { next(error); }
};

module.exports = { createCanteen, getCanteen, getMyCanteens, getAllCanteens, updateCanteen, updateCanteenStatus, uploadLogo, deleteCanteen };
