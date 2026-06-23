import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNotification } from '../../hooks/useNotification';
import './DeliveryProfile.css';

const DeliveryProfile = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();
  
  // Custom mock configuration states for rider duties
  const [dutyActive, setDutyActive] = useState(true);
  const [vehicleType, setVehicleType] = useState('Motorcycle');
  const [licensePlate, setLicensePlate] = useState('29-A1 999.99');

  return (
    <div className="delivery-profile-view">
      <div className="profile-header-section">
        <h3>Rider Account Profile</h3>
        <p>Manage your active duty status, vehicle parameters, and contact coordinates.</p>
      </div>

      <div className="profile-workspace-grid">
        {/* Left Column: Avatar & Duty Switch */}
        <div className="profile-card-left">
          <div className="profile-avatar-large">🚴</div>
          <h4>{user?.full_name}</h4>
          <span className="rider-status-role">{user?.role?.replace('_', ' ')?.toUpperCase()}</span>

          <div className="duty-status-toggle">
            <span className="duty-label">Duty Status:</span>
            <button 
              className={`btn-duty-toggle ${dutyActive ? 'active' : 'inactive'}`}
              onClick={() => setDutyActive(!dutyActive)}
            >
              {dutyActive ? '🟢 ON DUTY (ACTIVE)' : '🔴 OFF DUTY (INACTIVE)'}
            </button>
            <p className="duty-help-text">
              {dutyActive 
                ? 'You are currently visible to canteens and will receive pending order broadcasts.' 
                : 'Go on duty to receive delivery orders and earn payouts.'}
            </p>
          </div>
        </div>

        {/* Right Column: Details Forms */}
        <div className="profile-card-right">
          <div className="profile-details-section">
            <h5>Rider Information</h5>
            
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
                <span className="detail-label">Verification Status</span>
                <span className={`detail-value status-badge ${user?.is_verified ? 'verified' : 'unverified'}`}>
                  {user?.is_verified ? 'VERIFIED' : 'PENDING'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-details-section vehicle-config">
            <h5>Vehicle Configuration</h5>
            
            <div className="form-grid-vehicle">
              <div className="form-group-vehicle">
                <label>Vehicle Type</label>
                <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                  <option value="Motorcycle">Motorcycle / Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                  <option value="Electric Scooter">Electric Scooter</option>
                </select>
              </div>

              <div className="form-group-vehicle">
                <label>License Plate</label>
                <input 
                  type="text" 
                  value={licensePlate} 
                  onChange={(e) => setLicensePlate(e.target.value)} 
                  placeholder="e.g. 29-A1 999.99"
                />
              </div>
            </div>
            
            <button className="btn-primary-custom save-vehicle-btn" onClick={() => showToast('Vehicle parameters updated successfully!', 'success')}>
              💾 Save Profile Config
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DeliveryProfile;
