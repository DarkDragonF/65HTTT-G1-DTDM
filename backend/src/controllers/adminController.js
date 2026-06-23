const analyticsService = require('../services/analyticsService');
const monitoringService = require('../services/monitoringService');
const auditService = require('../services/auditService');
const PlatformSetting = require('../models/PlatformSetting');
const inventoryService = require('../services/inventoryService');

const adminController = {
  getSummary: async (req, res, next) => {
    try {
      const summary = await analyticsService.getDashboardSummary();
      res.status(200).json({ status: 'success', data: summary });
    } catch (error) {
      next(error);
    }
  },

  getRevenue: async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const report = await analyticsService.getRevenueAnalytics({ startDate, endDate });
      res.status(200).json({ status: 'success', data: report });
    } catch (error) {
      next(error);
    }
  },

  getPlatformHealth: async (req, res, next) => {
    try {
      const health = await monitoringService.getPlatformHealth();
      res.status(200).json({ status: 'success', data: health });
    } catch (error) {
      next(error);
    }
  },

  getSystemMetrics: async (req, res, next) => {
    try {
      const metrics = await monitoringService.getSystemMetrics();
      res.status(200).json({ status: 'success', data: metrics });
    } catch (error) {
      next(error);
    }
  },

  getAuditLogs: async (req, res, next) => {
    try {
      const { page, limit, action, targetType } = req.query;
      const logs = await auditService.getAuditLogs({ page, limit, action, targetType });
      res.status(200).json({ status: 'success', data: logs });
    } catch (error) {
      next(error);
    }
  },

  getSettings: async (req, res, next) => {
    try {
      const settings = await PlatformSetting.findAll();
      res.status(200).json({ status: 'success', data: settings });
    } catch (error) {
      next(error);
    }
  },

  updateSetting: async (req, res, next) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const updated = await PlatformSetting.update(key, value, req.user.id);
      if (!updated) {
        return res.status(404).json({ status: 'error', message: `Setting key '${key}' not found` });
      }

      await auditService.logAction({
        userId: req.user.id,
        action: 'setting.update',
        targetType: 'platform_settings',
        targetId: null,
        details: JSON.stringify({ key, value })
      });

      res.status(200).json({ status: 'success', message: `Setting key '${key}' updated successfully` });
    } catch (error) {
      next(error);
    }
  },

  triggerSnapshot: async (req, res, next) => {
    try {
      const { date } = req.body;
      const snapshot = await analyticsService.generateDailySnapshot(date);
      res.status(200).json({ status: 'success', message: 'Daily analytics snapshot triggered successfully', data: snapshot });
    } catch (error) {
      next(error);
    }
  },

  syncInventoryItems: async (req, res, next) => {
    try {
      const result = await inventoryService.syncAllDatabaseItemsWithZoho();
      
      await auditService.logAction({
        userId: req.user.id,
        action: 'inventory.sync',
        targetType: 'inventory',
        targetId: null,
        details: JSON.stringify(result.stats)
      });

      res.status(200).json({
        status: 'success',
        message: `Inventory catalog sync completed. Created: ${result.stats.created}, Linked: ${result.stats.linked}, Skipped: ${result.stats.skipped}, Errors: ${result.stats.errors}`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = adminController;
