const Canteen = require('../models/Canteen');
const User = require('../models/User');
const Contract = require('../models/Contract');
const { pool } = require('../config/db');
const { AppError } = require('../middlewares/errorHandler');
const auditService = require('./auditService');
const zohoCrmService = require('./zohoCrmService');

const adminCanteenService = {
  getCanteensList: async ({ page = 1, limit = 50, search, status } = {}) => {
    const offset = (page - 1) * limit;
    let query = `
      SELECT c.*, u.full_name AS owner_name, u.email AS owner_email 
      FROM canteens c
      JOIN users u ON c.owner_id = u.id
    `;
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(c.name LIKE ? OR c.description LIKE ?)');
      const likeSearch = `%${search}%`;
      params.push(likeSearch, likeSearch);
    }
    if (status) {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  approveCanteen: async (canteenId, adminId) => {
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      throw new AppError('Canteen not found', 404);
    }

    if (canteen.status === 'active') {
      throw new AppError('Canteen is already active', 400);
    }

    // 1. Update canteen status in local database
    await pool.execute('UPDATE canteens SET status = "active" WHERE id = ?', [canteenId]);

    // 2. Fetch owner email to sync with Zoho CRM
    const owner = await User.findById(canteen.owner_id);
    const ownerEmail = owner ? owner.email : 'unknown@tlufood.com';

    // Zoho CRM Partner Sync
    await zohoCrmService.syncPartnerRecord(canteenId, canteen.name, ownerEmail);

    // Zoho Sign Contract Generation
    const contractDetails = await zohoCrmService.triggerZohoSignContract(canteenId, canteen.name);
    
    // Save generated contract to DB
    const contractId = await Contract.create({
      canteenId,
      contractNumber: contractDetails.contractNumber,
      status: 'signed', // Auto-signed for simplicity of university project workflow
      fileUrl: contractDetails.fileUrl
    });

    // Update contract signed_at stamp
    await Contract.updateStatus(contractId, 'signed', new Date());

    // 3. Log audit action
    await auditService.logAction({
      userId: adminId,
      action: 'canteen.approve',
      targetType: 'canteens',
      targetId: canteenId,
      details: JSON.stringify({
        canteenName: canteen.name,
        contractNumber: contractDetails.contractNumber
      })
    });

    return { canteenId, status: 'active', contractNumber: contractDetails.contractNumber };
  },

  suspendCanteen: async (canteenId, adminId) => {
    const canteen = await Canteen.findById(canteenId);
    if (!canteen) {
      throw new AppError('Canteen not found', 404);
    }

    await pool.execute('UPDATE canteens SET status = "inactive" WHERE id = ?', [canteenId]);

    await auditService.logAction({
      userId: adminId,
      action: 'canteen.suspend',
      targetType: 'canteens',
      targetId: canteenId,
      details: JSON.stringify({ canteenName: canteen.name })
    });

    return { canteenId, status: 'inactive' };
  }
};

module.exports = adminCanteenService;
