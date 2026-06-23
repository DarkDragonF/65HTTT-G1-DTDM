import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './DeliveryLayout.css';

const DeliveryLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="delivery-layout">
      {/* Sidebar Navigation */}
      <aside className="delivery-sidebar">
        <div className="delivery-sidebar-brand">
          <span className="sidebar-brand-emoji">🚴</span>
          <h2>TLU Food</h2>
          <span className="delivery-portal-badge">Rider</span>
        </div>

        <div className="delivery-profile-sidebar">
          <div className="delivery-avatar-container">
            <div className="delivery-avatar-placeholder">🚴</div>
          </div>
          <div className="delivery-info-sidebar">
            <h4 className="delivery-name-sidebar">{user?.full_name}</h4>
            <span className="delivery-role-tag">Delivery Agent</span>
          </div>
        </div>

        <nav className="delivery-sidebar-nav">
          <NavLink to="/delivery/dashboard" className={({ isActive }) => `delivery-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">📦</span>
            Deliveries Workspace
          </NavLink>
          <NavLink to="/delivery/profile" className={({ isActive }) => `delivery-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">👤</span>
            Rider Profile
          </NavLink>
        </nav>

        <div className="delivery-sidebar-footer">
          <button className="delivery-logout-btn" onClick={logout}>
            <span className="nav-item-icon">🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="delivery-main-content">
        <header className="delivery-content-header">
          <div className="delivery-header-breadcrumbs">
            <span className="breadcrumb-root">Rider Portal</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Workspace</span>
          </div>
          <div className="delivery-user-info">
            <span className="delivery-avatar">🚴</span>
            <span className="delivery-user-name">{user?.full_name}</span>
          </div>
        </header>

        <div className="delivery-content-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DeliveryLayout;
