import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './AdminLayout.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="sidebar-brand-emoji">🍜</span>
          <h2>TLU Food</h2>
          <span className="admin-portal-badge">Admin</span>
        </div>

        <div className="admin-profile-sidebar">
          <div className="admin-avatar-container">
            <div className="admin-avatar-placeholder">🛡️</div>
          </div>
          <div className="admin-info-sidebar">
            <h4 className="admin-name-sidebar">{user?.full_name}</h4>
            <span className="admin-role-tag">{user?.role?.replace('_', ' ')}</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <NavLink to="/admin/dashboard" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">👥</span>
            Users Management
          </NavLink>
          <NavLink to="/admin/canteens" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">🏢</span>
            Canteens Approve
          </NavLink>
          <NavLink to="/admin/support" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">🎫</span>
            Helpdesk Tickets
          </NavLink>
          <NavLink to="/admin/feedback" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">📝</span>
            Customer Feedback
          </NavLink>
          <NavLink to="/admin/reports" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">⚙️</span>
            Reports & Settings
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={logout}>
            <span className="nav-item-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-content">
        <header className="admin-content-header">
          <div className="admin-header-breadcrumbs">
            <span className="breadcrumb-root">Admin Portal</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Dashboard</span>
          </div>
          <div className="admin-user-info">
            <span className="admin-avatar">👤</span>
            <span className="admin-user-name">{user?.full_name}</span>
          </div>
        </header>

        <div className="admin-content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
