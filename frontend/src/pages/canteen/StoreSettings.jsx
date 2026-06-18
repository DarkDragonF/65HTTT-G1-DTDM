import { useState, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { updateCanteen, uploadLogo } from '../../api/canteenApi';
import './StoreSettings.css';

const StoreSettings = () => {
  const { canteen, fetchCanteen } = useOutletContext();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: canteen?.name || '',
    address: canteen?.address || '',
    phone: canteen?.phone || '',
    openingHours: canteen?.opening_hours || '',
    description: canteen?.description || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Logo upload state
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        openingHours: formData.openingHours,
        description: formData.description,
      };
      await updateCanteen(canteen.id, payload);
      setSuccessMsg('Store information updated successfully!');
      fetchCanteen(); // Refresh details in layout
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to update store settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUploadTrigger = () => {
    fileInputRef.current.click();
  };

  const handleLogoFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingLogo(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await uploadLogo(canteen.id, file);
      setSuccessMsg('Logo updated successfully!');
      fetchCanteen();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Failed to upload logo.');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  return (
    <div className="settings-page">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleLogoFileChange}
      />

      <div className="settings-header">
        <h2>Store Settings</h2>
        <p>Manage store information, address, hours, and branding.</p>
      </div>

      <div className="settings-grid">
        {/* Left Side: General Profile Form */}
        <div className="settings-card settings-form-card">
          <h3>Store Profile</h3>
          
          <form onSubmit={handleSubmit} className="settings-form">
            {successMsg && <div className="settings-success-alert">{successMsg}</div>}
            {errorMsg && <div className="settings-error-alert">{errorMsg}</div>}

            <div className="form-group">
              <label htmlFor="store-name">Store Name *</label>
              <input
                type="text"
                id="store-name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="store-address">Address *</label>
              <input
                type="text"
                id="store-address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="store-phone">Contact Phone *</label>
                <input
                  type="text"
                  id="store-phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="store-hours">Opening Hours *</label>
                <input
                  type="text"
                  id="store-hours"
                  required
                  value={formData.openingHours}
                  onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="store-desc">Store Description</label>
              <textarea
                id="store-desc"
                rows="4"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>
            </div>

            <button type="submit" className="btn-primary-custom" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>

        {/* Right Side: Branding/Logo Upload */}
        <div className="settings-card settings-branding-card">
          <h3>Store Branding</h3>
          
          <div className="logo-upload-section">
            <div className="logo-preview-box">
              {canteen?.logo_url ? (
                <img src={`http://localhost:5000${canteen.logo_url}`} alt="Logo" className="preview-logo-img" />
              ) : (
                <div className="preview-logo-placeholder">🏢</div>
              )}
              {isUploadingLogo && (
                <div className="logo-upload-spinner">
                  <div className="spinner"></div>
                </div>
              )}
            </div>

            <div className="logo-upload-details">
              <h4>Store Logo</h4>
              <p>Upload a high-resolution logo. Only PNG, JPG, and WebP formats up to 5MB are supported.</p>
              
              <button 
                type="button" 
                className="btn-upload-logo-custom" 
                onClick={handleLogoUploadTrigger}
                disabled={isUploadingLogo}
              >
                {isUploadingLogo ? 'Uploading...' : 'Choose Image'}
              </button>
            </div>
          </div>

          <div className="store-status-info">
            <h4>Application Status</h4>
            <div className="status-row">
              <span className="status-label">Operational Status:</span>
              <span className={`status-val-badge ${canteen?.status}`}>
                {canteen?.status?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <p className="status-notes">
              * Store status can only be modified by system administrators after contract signing. If your status is "pending", please complete the Zoho Sign contractual workflow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;
