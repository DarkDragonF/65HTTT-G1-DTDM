import { useState, useEffect, useCallback } from 'react';
import { getAdminUsersList, updateUserStatus, updateUserRole } from '../../api/adminApi';
import { useNotification } from '../../hooks/useNotification';
import './Users.css';

const Users = () => {
  const { showToast, confirm } = useNotification();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal / Action states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUsersList({
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined
      });
      setUsers(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load user list:', error);
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadUsers();
    }, 450);
    return () => clearTimeout(delayDebounce);
  }, [loadUsers]);

  const handleStatusChange = async (user, targetStatus) => {
    if (targetStatus === 'suspended') {
      setSelectedUser(user);
      setSuspendReason('');
      setShowStatusModal(true);
      return;
    }
    
    // Direct Unsuspend/Activate action
    setIsLoading(true);
    try {
      await updateUserStatus(user.id, 'active', '');
      showToast(`User account for "${user.full_name}" restored successfully.`, 'success');
      await loadUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating user status.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuspendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await updateUserStatus(selectedUser.id, 'suspended', suspendReason);
      showToast(`User account for "${selectedUser.full_name}" suspended.`, 'warning');
      setShowStatusModal(false);
      await loadUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to suspend user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, targetRole) => {
    const isAccepted = await confirm(
      'Change User Role',
      `Are you sure you want to change this user's role to ${targetRole.replace('_', ' ')}?`
    );
    if (!isAccepted) {
      // Refresh to revert select element state
      await loadUsers();
      return;
    }

    setIsLoading(true);
    try {
      await updateUserRole(userId, targetRole);
      showToast('User role updated successfully.', 'success');
      await loadUsers();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating user role.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-users-view">
      <div className="users-header">
        <h3>User Account Management</h3>
        <p>Search, filter, assign administrative privileges, and suspend/unsuspend user accounts.</p>
      </div>

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-input-wrapper">
          <span className="search-input-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, email, or phone number..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>

        <div className="select-filters">
          <div className="filter-group">
            <label>Filter by Role</label>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="canteen_owner">Canteen Owner</option>
              <option value="delivery_staff">Delivery Staff</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Filter by Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {isLoading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Syncing account directories...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-results-card">
          <p>No user accounts matched the search criteria.</p>
        </div>
      ) : (
        <div className="users-table-card">
          <table className="users-data-table">
            <thead>
              <tr>
                <th>User Details</th>
                <th>Contact</th>
                <th>Role Assignment</th>
                <th>Verify Status</th>
                <th>Account Status</th>
                <th>Administrative Controls</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell-profile">
                      <div className="user-cell-avatar">
                        {u.full_name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="user-cell-nameinfo">
                        <strong>{u.full_name}</strong>
                        <span>ID: #{u.id}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="user-cell-contact">
                      <span>{u.email}</span>
                      <span>{u.phone || '—'}</span>
                    </div>
                  </td>
                  <td>
                    {u.role === 'super_admin' ? (
                      <span className="role-display-badge super-admin">{u.role.replace('_', ' ')}</span>
                    ) : (
                      <select 
                        className="role-selection-dropdown" 
                        value={u.role} 
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="student">Student</option>
                        <option value="lecturer">Lecturer</option>
                        <option value="canteen_owner">Canteen Owner</option>
                        <option value="delivery_staff">Delivery Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge-custom ${u.is_verified ? 'verified' : 'unverified'}`}>
                      {u.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-custom ${u.status === 'suspended' ? 'suspended' : 'active'}`}>
                      {u.status === 'suspended' ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="actions-buttons-cell">
                      {u.role !== 'super_admin' && (
                        u.status === 'suspended' ? (
                          <button 
                            className="btn-action-unsuspend" 
                            onClick={() => handleStatusChange(u, 'active')}
                          >
                            ✔️ Restore
                          </button>
                        ) : (
                          <button 
                            className="btn-action-suspend" 
                            onClick={() => handleStatusChange(u, 'suspended')}
                          >
                            ⚠️ Suspend
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Suspension Reasons Modal */}
      {showStatusModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <h4>Suspend User Account</h4>
            <p>You are suspending the account of **{selectedUser?.full_name}**. Please supply a valid administrative reason.</p>
            
            <form onSubmit={handleSuspendSubmit}>
              <div className="form-group">
                <label>Suspension Reason *</label>
                <textarea 
                  rows="3" 
                  value={suspendReason} 
                  onChange={(e) => setSuspendReason(e.target.value)} 
                  placeholder="e.g. Excessive order disputes or fraudulent account activity..."
                  required 
                ></textarea>
              </div>

              <div className="admin-modal-buttons">
                <button 
                  type="button" 
                  className="btn-secondary-custom" 
                  onClick={() => setShowStatusModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-custom btn-danger-custom"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Suspending...' : '⚠️ Confirm Suspension'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
