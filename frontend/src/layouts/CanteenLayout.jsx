import { useState, useEffect, useCallback } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMyCanteens, createCanteen } from '../api/canteenApi';
import './CanteenLayout.css';

const CanteenLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [canteen, setCanteen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegForm, setShowRegForm] = useState(false);

  // Form states for registering a new canteen
  const [regData, setRegData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    openingHours: '08:00 - 20:00',
  });
  const [regError, setRegError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCanteen = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: response } = await getMyCanteens();
      const canteens = response?.data?.canteens || [];
      if (canteens && canteens.length > 0) {
        setCanteen(canteens[0]);
        setShowRegForm(false);
      } else {
        setCanteen(null);
        setShowRegForm(true);
      }
    } catch (error) {
      console.error('Failed to fetch canteen info:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Role protection
    if (user && user.role !== 'canteen_owner' && user.role !== 'admin') {
      navigate('/', { replace: true });
      return;
    }
    fetchCanteen();
  }, [user, navigate, fetchCanteen]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    setIsSubmitting(true);
    try {
      await createCanteen(regData);
      await fetchCanteen(); // Refresh canteen state
    } catch (error) {
      setRegError(error.response?.data?.message || 'Failed to register canteen. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active': return 'canteen-status-active';
      case 'inactive': return 'canteen-status-inactive';
      case 'pending': return 'canteen-status-pending';
      default: return 'canteen-status-pending';
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring-2"></div>
            </div>
          </div>
          <p className="loading-text">Loading owner portal...</p>
        </div>
      </div>
    );
  }

  // Render Canteen Registration Wizard if no canteen exists
  if (showRegForm) {
    return (
      <div className="canteen-reg-container">
        <div className="canteen-reg-card">
          <div className="canteen-reg-header">
            <span className="canteen-reg-logo-emoji">🏢</span>
            <h2>Register Your Canteen</h2>
            <p>Welcome to the TLU Food Partner Portal! Please register your store to start setting up your menu and managing orders.</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="canteen-reg-form">
            {regError && <div className="canteen-reg-error">{regError}</div>}
            
            <div className="form-group">
              <label htmlFor="name">Canteen Name *</label>
              <input
                type="text"
                id="name"
                required
                placeholder="e.g. Canteen A7 - Bách Khoa"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address *</label>
              <input
                type="text"
                id="address"
                required
                placeholder="e.g. 1st Floor, Building A7, TLU Campus"
                value={regData.address}
                onChange={(e) => setRegData({ ...regData, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Contact Phone Number *</label>
              <input
                type="text"
                id="phone"
                required
                placeholder="e.g. 0912345678"
                value={regData.phone}
                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="openingHours">Opening Hours *</label>
              <input
                type="text"
                id="openingHours"
                required
                placeholder="e.g. 07:00 - 21:00"
                value={regData.openingHours}
                onChange={(e) => setRegData({ ...regData, openingHours: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                rows="3"
                placeholder="Introduce your canteen, specialties, etc."
                value={regData.description}
                onChange={(e) => setRegData({ ...regData, description: e.target.value })}
              ></textarea>
            </div>

            <div className="canteen-reg-buttons">
              <button type="button" className="btn-secondary-custom" onClick={logout}>Logout</button>
              <button type="submit" className="btn-primary-custom" disabled={isSubmitting}>
                {isSubmitting ? 'Registering...' : 'Register Canteen'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="canteen-layout">
      {/* Sidebar Navigation */}
      <aside className="canteen-sidebar">
        <div className="canteen-sidebar-brand">
          <span className="sidebar-brand-emoji">🍜</span>
          <h2>TLU Food</h2>
          <span className="portal-badge">Partner</span>
        </div>

        <div className="canteen-owner-profile">
          <div className="canteen-logo-container">
            {canteen?.logo_url ? (
              <img src={`http://localhost:5000${canteen.logo_url}`} alt="Logo" className="canteen-sidebar-logo" />
            ) : (
              <div className="canteen-logo-placeholder">🏢</div>
            )}
          </div>
          <div className="canteen-owner-info">
            <h4 className="canteen-name-sidebar">{canteen?.name}</h4>
            <span className={`canteen-status-badge ${getStatusBadgeClass(canteen?.status)}`}>
              {canteen?.status}
            </span>
          </div>
        </div>

        <nav className="canteen-sidebar-nav">
          <NavLink to="/canteen/dashboard" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">📊</span>
            Dashboard
          </NavLink>
          <NavLink to="/canteen/menu" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">🍜</span>
            Menu Items
          </NavLink>
          <NavLink to="/canteen/orders" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">📦</span>
            Orders
          </NavLink>
          <NavLink to="/canteen/settings" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-item-icon">⚙️</span>
            Settings
          </NavLink>
        </nav>

        <div className="canteen-sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout}>
            <span className="nav-item-icon">🚪</span>
            Logout Portal
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="canteen-main-content">
        <header className="canteen-content-header">
          <div className="header-breadcrumbs">
            <span className="breadcrumb-root">Portal</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">Dashboard</span>
          </div>
          <div className="header-user-info">
            <span className="user-avatar">👤</span>
            <span className="user-name-text">{user?.full_name}</span>
          </div>
        </header>

        <div className="canteen-content-body">
          {/* Passing the canteen object down to dashboard, menu, settings, orders pages */}
          <Outlet context={{ canteen, fetchCanteen }} />
        </div>
      </main>
    </div>
  );
};

export default CanteenLayout;
