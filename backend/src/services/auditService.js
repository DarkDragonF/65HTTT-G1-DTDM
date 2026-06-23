const AuditLog = require('../models/AuditLog');

const auditService = {
  logAction: async ({ userId, action, targetType, targetId, ipAddress, userAgent, details }) => {
    try {
      await AuditLog.create({
        userId,
        action,
        targetType,
        targetId,
        ipAddress,
        userAgent,
        details
      });
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }
  },
  getAuditLogs: async (filters) => {
    return await AuditLog.findAll(filters);
  }
};

module.exports = auditService;
