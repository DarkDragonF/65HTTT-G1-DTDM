import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import './HomePage.css';

const HomePage = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin', { replace: true });
      } else if (user.role === 'delivery_staff') {
        navigate('/delivery', { replace: true });
      } else if (user.role === 'canteen_owner') {
        navigate('/canteen', { replace: true });
      }
    }
  }, [user, navigate]);

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Header */}
        <header className="home-header">
          <div className="home-brand">
            <span className="home-brand-emoji">🍜</span>
            <h1 className="home-brand-name">TLU Food</h1>
          </div>
          <button className="home-logout-btn" onClick={logout} aria-label="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </header>

        {/* Welcome Section */}
        <section className="home-welcome">
          <div className="welcome-card">
            <div className="welcome-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || '👤'}
            </div>
            <h2 className="welcome-title">
              Welcome back, <span className="welcome-name">{user?.full_name || 'User'}</span>!
            </h2>
            <p className="welcome-subtitle">
              What would you like to eat today?
            </p>
            <div className="welcome-role-badge">
              {user?.role?.replace('_', ' ') || 'student'}
            </div>
          </div>
        </section>

        {/* Quick Stats / Placeholder Cards */}
        <section className="home-features">
          <Link to="/browse" className="feature-card">
            <span className="feature-icon">🍕</span>
            <h3>Browse Food</h3>
            <p>Explore delicious meals from campus canteens</p>
            <span className="feature-badge active-badge">Go &rarr;</span>
          </Link>
          <Link to="/cart" className="feature-card">
            <span className="feature-icon">🛒</span>
            <h3>My Cart</h3>
            <p>Review and manage your food selections</p>
            {cartCount > 0 ? (
              <span className="feature-badge cart-count-badge">{cartCount} Items</span>
            ) : (
              <span className="feature-badge active-badge">Go &rarr;</span>
            )}
          </Link>
          <Link to="/orders" className="feature-card">
            <span className="feature-icon">📦</span>
            <h3>My Orders</h3>
            <p>Track your current and past orders</p>
            <span className="feature-badge active-badge">Go &rarr;</span>
          </Link>
          <Link to="/support" className="feature-card">
            <span className="feature-icon">🎫</span>
            <h3>Helpdesk support</h3>
            <p>Submit dispute tickets and chat with helpdesk</p>
            <span className="feature-badge active-badge">Go &rarr;</span>
          </Link>
          <Link to="/profile" className="feature-card">
            <span className="feature-icon">👤</span>
            <h3>My Profile</h3>
            <p>Manage your account settings and profile information</p>
            <span className="feature-badge active-badge">Go &rarr;</span>
          </Link>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <p>🎓 TLU Food — Thuy Loi University Campus Food Ordering</p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
