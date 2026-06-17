const db = require('../config/db');
const axios = require('axios');
const zohoConfig = require('../config/zoho');

const zohoService = {
    // Các logic kết nối DB và Zoho API viết ở đây
    getAllUsersLocal: async (limit, offset) => {
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM Users LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    return rows;
},

    toggleUserStatusLocal: async (userId, status) => {
    await db.execute('UPDATE Users SET is_active = ? WHERE id = ?', [status, userId]);
    return { userId, status };
},
    getZohoAuthToken: async () => {
        const response = await axios.post(zohoConfig.authUrl, null, {
            params: {
                refresh_token: zohoConfig.refreshToken,
                client_id: zohoConfig.clientId,
                client_secret: zohoConfig.clientSecret,
                grant_type: 'refresh_token'
            }
        });
        return response.data.access_token;
    },
};

module.exports = zohoService;