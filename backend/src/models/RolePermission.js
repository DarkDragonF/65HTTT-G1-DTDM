const { pool } = require('../config/db');

const RolePermission = {
  findByRole: async (role) => {
    const [rows] = await pool.execute(
      `SELECT rp.*, p.name AS permission_name, p.description AS permission_description 
       FROM role_permissions rp
       JOIN permissions p ON rp.permission_id = p.id
       WHERE rp.role = ?`,
      [role]
    );
    return rows;
  },
  addPermissionToRole: async (role, permissionId) => {
    const [result] = await pool.execute(
      'INSERT INTO role_permissions (role, permission_id) VALUES (?, ?)',
      [role, permissionId]
    );
    return result.insertId;
  },
  removePermissionFromRole: async (role, permissionId) => {
    await pool.execute(
      'DELETE FROM role_permissions WHERE role = ? AND permission_id = ?',
      [role, permissionId]
    );
  }
};

module.exports = RolePermission;
