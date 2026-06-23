import { useAuth } from '../../hooks/useAuth';
import './Profile.css';

/**
 * Profile Page. Displays authenticated user profile metadata.
 */
const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="student-profile animate-fade-in">
      <div className="profile-header">
        <h2>My Profile</h2>
        <p>Manage your account settings and contact information</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-large">
          {user?.full_name?.charAt(0)?.toUpperCase() || '👤'}
        </div>
        
        <div className="profile-details-grid">
          <div className="profile-detail-item">
            <span className="detail-label">Full Name</span>
            <span className="detail-value">{user?.full_name || 'N/A'}</span>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">Email Address</span>
            <span className="detail-value">{user?.email || 'N/A'}</span>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">Phone Number</span>
            <span className="detail-value">{user?.phone || 'Not provided'}</span>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">Account Role</span>
            <span className="detail-value role-badge">{user?.role?.replace('_', ' ') || 'student'}</span>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">Verification Status</span>
            <span className={`detail-value status-badge ${user?.is_verified ? 'verified' : 'unverified'}`}>
              {user?.is_verified ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
