import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './ProtectedRoute.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <span className="loading-emoji">🍜</span>
            <h1 className="loading-title">TLU Food</h1>
          </div>
          <div className="loading-spinner-container">
            <div className="loading-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-ring spinner-ring-2"></div>
            </div>
          </div>
          <p className="loading-text">Loading your experience...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;
