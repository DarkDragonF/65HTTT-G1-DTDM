import axiosInstance from './axiosInstance';

export const getAdminDashboardSummary = () => {
  return axiosInstance.get('/admin/dashboard/summary');
};

export const getAdminRevenueReport = (params) => {
  return axiosInstance.get('/admin/dashboard/revenue', { params });
};

export const getAdminUsersList = (params) => {
  return axiosInstance.get('/admin/users', { params });
};

export const updateUserStatus = (id, status, reason) => {
  return axiosInstance.patch(`/admin/users/${id}/status`, { status, reason });
};

export const updateUserRole = (id, role) => {
  return axiosInstance.patch(`/admin/users/${id}/role`, { role });
};

export const getAdminCanteensList = (params) => {
  return axiosInstance.get('/admin/canteens', { params });
};

export const approveCanteen = (id) => {
  return axiosInstance.patch(`/admin/canteens/${id}/approve`);
};

export const suspendCanteen = (id) => {
  return axiosInstance.patch(`/admin/canteens/${id}/suspend`);
};

export const getPlatformHealth = () => {
  return axiosInstance.get('/admin/monitoring/health');
};

export const getSystemMetrics = () => {
  return axiosInstance.get('/admin/monitoring/metrics');
};

export const getAuditLogsList = (params) => {
  return axiosInstance.get('/admin/audit-logs', { params });
};

export const getPlatformSettingsList = () => {
  return axiosInstance.get('/admin/settings');
};

export const updatePlatformSetting = (key, value) => {
  return axiosInstance.patch(`/admin/settings/${key}`, { value });
};

export const triggerRevenueSnapshot = (date) => {
  return axiosInstance.post('/admin/dashboard/snapshot', { date });
};

export const syncInventoryCatalog = () => {
  return axiosInstance.post('/admin/inventory/sync');
};

export const getFeedbackList = () => {
  return axiosInstance.get('/feedback');
};

