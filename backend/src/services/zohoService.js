const db = require('../config/db');
const axios = require('axios');

const zohoService = {
    // Các logic kết nối DB và Zoho API viết ở đây
    getAllUsersLocal: async (limit, offset) => {
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM Users LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    return rows;
},
};

module.exports = zohoService;