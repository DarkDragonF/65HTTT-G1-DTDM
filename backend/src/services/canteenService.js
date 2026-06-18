const Canteen = require('../models/Canteen');
const { AppError } = require('../middlewares/errorHandler');
const { getFileUrl, deleteFile } = require('../utils/storage');

/**
 * @desc Create a new canteen
 */
const createCanteen = async (ownerId, data) => {
  const canteenId = await Canteen.create({
    ownerId,
    name: data.name,
    address: data.address,
    description: data.description,
    phone: data.phone,
    openingHours: data.openingHours,
    logoUrl: null,
  });

  const canteen = await Canteen.findById(canteenId);
  // Mock Zoho CRM notification
  console.log(`===== [ZOHO CRM] New canteen registered: ${data.name} (ID: ${canteenId}) =====`);
  return canteen;
};

/**
 * @desc Get canteen by ID
 */
const getCanteen = async (id) => {
  const canteen = await Canteen.findById(id);
  if (!canteen) throw new AppError('Canteen not found', 404);
  return canteen;
};

/**
 * @desc Get all canteens for an owner
 */
const getMyCanteens = async (ownerId) => {
  return await Canteen.findByOwnerId(ownerId);
};

/**
 * @desc Get all canteens with pagination/filters
 */
const getAllCanteens = async (filters) => {
  return await Canteen.findAll(filters);
};

/**
 * @desc Update canteen info
 */
const updateCanteen = async (id, data) => {
  const canteen = await Canteen.findById(id);
  if (!canteen) throw new AppError('Canteen not found', 404);
  await Canteen.update(id, data);
  return await Canteen.findById(id);
};

/**
 * @desc Update canteen status (admin only)
 */
const updateCanteenStatus = async (id, status) => {
  const canteen = await Canteen.findById(id);
  if (!canteen) throw new AppError('Canteen not found', 404);
  await Canteen.updateStatus(id, status);
  console.log(`===== [ZOHO CLIQ] Canteen "${canteen.name}" status changed to ${status} =====`);
  return await Canteen.findById(id);
};

/**
 * @desc Upload canteen logo
 */
const uploadLogo = async (id, file) => {
  if (!file) throw new AppError('No image file provided', 400);

  const canteen = await Canteen.findById(id);
  if (!canteen) throw new AppError('Canteen not found', 404);

  // Delete old logo if exists
  if (canteen.logo_url) {
    deleteFile(canteen.logo_url);
  }

  const logoUrl = getFileUrl(file, 'logos');
  await Canteen.update(id, { logoUrl });
  return await Canteen.findById(id);
};

/**
 * @desc Delete canteen (admin only)
 */
const deleteCanteen = async (id) => {
  const canteen = await Canteen.findById(id);
  if (!canteen) throw new AppError('Canteen not found', 404);

  if (canteen.logo_url) deleteFile(canteen.logo_url);
  await Canteen.delete(id);
};

module.exports = {
  createCanteen,
  getCanteen,
  getMyCanteens,
  getAllCanteens,
  updateCanteen,
  updateCanteenStatus,
  uploadLogo,
  deleteCanteen,
};
