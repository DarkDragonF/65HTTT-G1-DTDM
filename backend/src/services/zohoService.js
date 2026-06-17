// Hàm truy vấn database lấy toàn bộ danh sách người dùng
const db = require('../config/db'); 
async function getAllUsersLocal(limit, offset) {
    const [rows] = await db.execute('SELECT id, name, email, role, created_at FROM Users LIMIT ? OFFSET ?', [parseInt(limit), parseInt(offset)]);
    return rows;
}