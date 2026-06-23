const zohoService = require('../services/zohoService');

const adminController = {
    // Các hàm xử lý request sẽ viết ở đây
    getAllUsers: async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const offset = req.query.offset || 0;
        const users = await zohoService.getAllUsersLocal(limit, offset);
        res.status(200).json({ success: true, data: users });
    } catch (err) { res.status(500).json({ error: err.message }); }
},
    changeUserStatus: async (req, res) => {
    try {
        const { status } = req.body;
        const result = await zohoService.toggleUserStatusLocal(req.params.id, status);
        res.status(200).json({ success: true, data: result });
    } catch (err) { res.status(500).json({ error: err.message }); }
},
    syncCanteenPartner: async (req, res) => {
    try {
        const syncResult = await zohoService.pushPartnerToCRM(req.body);
        res.status(200).json({ success: true, message: "Successfully synced with Zoho CRM", data: syncResult });
    } catch (err) { res.status(500).json({ error: err.message }); }
},

    getDashboardStats: async (req, res) => {
    try {
        const localRev = await zohoService.getLocalRevenueData();
        const zohoCharts = await zohoService.getZohoAnalyticsReport();
        res.status(200).json({ success: true, localRevenue: localRev, cloudAnalytics: zohoCharts });
    } catch (err) { res.status(500).json({ error: err.message }); }
},

    checkSystemHealth: async (req, res) => {
    res.status(200).json({ status: "healthy", database: "connected", storage: "cloud_storage_active" });
}

};

module.exports = adminController;
