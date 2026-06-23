import { useState, useEffect, useCallback } from 'react';
import { 
  getPlatformHealth, 
  getSystemMetrics, 
  getPlatformSettingsList, 
  updatePlatformSetting, 
  getAuditLogsList
} from '../../api/adminApi';
import { useNotification } from '../../hooks/useNotification';
import './Reports.css';

const Reports = () => {
  const { showToast } = useNotification();
  // Tabs: 'health', 'settings', 'audit'
  const [activeTab, setActiveTab] = useState('health');

  // Health State
  const [healthData, setHealthData] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [healthLoading, setHealthLoading] = useState(true);

  // Settings State
  const [settings, setSettings] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [savingSettingKey, setSavingSettingKey] = useState(null);

  // Audit Logs State
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logPage, setLogPage] = useState(1);
  const [logLimit] = useState(25);
  const [actionSearch, setActionSearch] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');



  // 1. Load Health & Metrics
  const loadHealthAndMetrics = useCallback(async () => {
    setHealthLoading(true);
    try {
      const [healthRes, metricsRes] = await Promise.all([
        getPlatformHealth(),
        getSystemMetrics()
      ]);
      setHealthData(healthRes.data?.data || null);
      setSystemMetrics(metricsRes.data?.data || null);
    } catch (error) {
      console.error('Failed to load system monitoring statistics:', error);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // 2. Load Platform Settings
  const loadSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const res = await getPlatformSettingsList();
      setSettings(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load platform settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  // 3. Load Audit Logs
  const loadAuditLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await getAuditLogsList({
        page: logPage,
        limit: logLimit,
        action: actionSearch || undefined,
        targetType: targetTypeFilter || undefined
      });
      setLogs(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLogsLoading(false);
    }
  }, [logPage, logLimit, actionSearch, targetTypeFilter]);

  // Load appropriate data on tab changes / filters
  useEffect(() => {
    if (activeTab === 'health') {
      loadHealthAndMetrics();
    } else if (activeTab === 'settings') {
      loadSettings();
    } else if (activeTab === 'audit') {
      loadAuditLogs();
    }
  }, [activeTab, loadHealthAndMetrics, loadSettings, loadAuditLogs]);


  // Handle setting updates
  const handleSettingUpdate = async (key, currentValue, newValue) => {
    if (currentValue === newValue) return;
    setSavingSettingKey(key);
    try {
      await updatePlatformSetting(key, newValue);
      showToast(`Setting "${key.split('_').join(' ').toUpperCase()}" updated successfully.`, 'success');
      // Reload settings to get updated state
      await loadSettings();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update setting.', 'error');
    } finally {
      setSavingSettingKey(null);
    }
  };

  return (
    <div className="admin-reports-view">
      <div className="reports-header-section">
        <h3>Platform Reports & System Configurations</h3>
        <p>Inspect API latency, monitor GCP hardware allocation, adjust order dispatch constraints, and review audit trails.</p>
      </div>

      {/* Tab Navigation */}
      <div className="reports-tabs-nav">
        <button 
          className={`tab-nav-btn ${activeTab === 'health' ? 'active' : ''}`}
          onClick={() => setActiveTab('health')}
        >
          🚦 System Health & Metrics
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Global Platform Settings
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          📜 Administrative Audit Trail
        </button>

      </div>


      {/* Tab Content */}
      <div className="reports-tab-content">
        
        {/* Tab 1: System Health */}
        {activeTab === 'health' && (
          <div className="health-tab-view">
            {healthLoading ? (
              <div className="admin-loading-container">
                <div className="admin-spinner"></div>
                <p>Querying network nodes and microservices...</p>
              </div>
            ) : (
              <div className="health-grid">
                {/* Node Latency Cards */}
                <div className="health-card">
                  <h4>Core Microservice Nodes</h4>
                  <div className="health-node-list">
                    <div className="health-node-item">
                      <span className="node-icon">💾</span>
                      <div className="node-detail">
                        <strong>Relational Database (Cloud SQL)</strong>
                        <span>Latency: {healthData?.services?.database?.latency}</span>
                      </div>
                      <span className={`node-status-tag ${healthData?.services?.database?.status}`}>
                        {healthData?.services?.database?.status}
                      </span>
                    </div>

                    <div className="health-node-item">
                      <span className="node-icon">🚀</span>
                      <div className="node-detail">
                        <strong>Backend API Server Node</strong>
                        <span>Uptime: {healthData?.services?.api_server?.uptime}</span>
                      </div>
                      <span className={`node-status-tag ${healthData?.services?.api_server?.status}`}>
                        {healthData?.services?.api_server?.status}
                      </span>
                    </div>

                    <div className="health-node-item">
                      <span className="node-icon">☁️</span>
                      <div className="node-detail">
                        <strong>GCP Cloud Run Environment</strong>
                        <span>Region: {healthData?.services?.gcp_cloud_run?.region} | CPU: {healthData?.services?.gcp_cloud_run?.cpu_utilization}</span>
                      </div>
                      <span className={`node-status-tag ${healthData?.services?.gcp_cloud_run?.status}`}>
                        {healthData?.services?.gcp_cloud_run?.status}
                      </span>
                    </div>

                    <div className="health-node-item">
                      <span className="node-icon">📦</span>
                      <div className="node-detail">
                        <strong>GCP Cloud Storage Bucket</strong>
                        <span>Objects: {healthData?.services?.gcp_storage?.total_objects} | Size: {healthData?.services?.gcp_storage?.total_size}</span>
                      </div>
                      <span className={`node-status-tag ${healthData?.services?.gcp_storage?.status}`}>
                        {healthData?.services?.gcp_storage?.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* System Diagnostics Metrics */}
                <div className="health-card">
                  <h4>V8 Engine & Memory Allocation</h4>
                  {systemMetrics && (
                    <div className="metrics-indicators-list">
                      <div className="metric-indicator-box">
                        <span className="metric-indicator-label">Node Memory RSS</span>
                        <span className="metric-indicator-value">{systemMetrics['node_memory_rss']?.value} {systemMetrics['node_memory_rss']?.unit}</span>
                      </div>
                      <div className="metric-indicator-box">
                        <span className="metric-indicator-label">Heap Memory Used</span>
                        <span className="metric-indicator-value">{systemMetrics['node_memory_heap']?.value} {systemMetrics['node_memory_heap']?.unit}</span>
                      </div>
                      {systemMetrics['database_latency'] && (
                        <div className="metric-indicator-box">
                          <span className="metric-indicator-label">Database Read Query Latency</span>
                          <span className="metric-indicator-value">{systemMetrics['database_latency']?.value} {systemMetrics['database_latency']?.unit}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <button className="btn-primary-custom refresh-health-btn" onClick={loadHealthAndMetrics}>
                    🔄 Force Refresh Diagnostic Poll
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Global Settings */}
        {activeTab === 'settings' && (
          <div className="settings-tab-view">
            {settingsLoading ? (
              <div className="admin-loading-container">
                <div className="admin-spinner"></div>
                <p>Reading configurations from data stores...</p>
              </div>
            ) : settings.length === 0 ? (
              <div className="empty-results-card">
                <p>No active platform configurations were found in the database.</p>
              </div>
            ) : (
              <div className="settings-list-card">
                <div className="settings-list-header">
                  <h4>Global Runtime Variables</h4>
                  <p>Updates apply instantly across active user sessions. Double-click values to modify.</p>
                </div>
                <div className="settings-items-container">
                  {settings.map((setting) => (
                    <div className="setting-item-row" key={setting.setting_key}>
                      <div className="setting-item-meta">
                        <strong>{setting.setting_key.split('_').join(' ').toUpperCase()}</strong>
                        <span>{setting.description || 'Global system parameter'}</span>
                      </div>
                      <div className="setting-item-control">
                        <input 
                          type="text" 
                          defaultValue={setting.setting_value}
                          onBlur={(e) => handleSettingUpdate(setting.setting_key, setting.setting_value, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleSettingUpdate(setting.setting_key, setting.setting_value, e.target.value);
                            }
                          }}
                          disabled={savingSettingKey === setting.setting_key}
                          className="setting-item-input"
                        />
                        {savingSettingKey === setting.setting_key && (
                          <span className="setting-saving-spinner">⏳</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Administrative Audit Trail */}
        {activeTab === 'audit' && (
          <div className="audit-tab-view">
            {/* Audit Logs Filter Bar */}
            <div className="filters-bar">
              <div className="search-input-wrapper">
                <span className="search-input-icon">🔍</span>
                <input 
                  type="text" 
                  placeholder="Filter logs by action name (e.g. user.suspend)..." 
                  value={actionSearch} 
                  onChange={(e) => {
                    setActionSearch(e.target.value);
                    setLogPage(1);
                  }} 
                />
              </div>

              <div className="select-filters">
                <div className="filter-group">
                  <label>Filter Target Entity</label>
                  <select 
                    value={targetTypeFilter} 
                    onChange={(e) => {
                      setTargetTypeFilter(e.target.value);
                      setLogPage(1);
                    }}
                  >
                    <option value="">All Entities</option>
                    <option value="users">Users</option>
                    <option value="canteens">Canteens</option>
                    <option value="orders">Orders</option>
                    <option value="platform_settings">Settings</option>
                    <option value="support_tickets">Tickets</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Logs Table */}
            {logsLoading ? (
              <div className="admin-loading-container">
                <div className="admin-spinner"></div>
                <p>Retrieving system transaction audit trails...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="empty-results-card">
                <p>No audit records found matching the specified parameters.</p>
              </div>
            ) : (
              <div className="logs-table-container">
                <div className="users-table-card">
                  <table className="users-data-table">
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Administrator</th>
                        <th>Action Logged</th>
                        <th>Target Info</th>
                        <th>IP & Client Device</th>
                        <th>Detailed Metadata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id}>
                          <td>
                            <span className="audit-timestamp">
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </td>
                          <td>
                            <div className="audit-admin-info">
                              <strong>{log.user_name || 'System Auto'}</strong>
                              <span>{log.user_email || '—'}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`audit-action-tag ${log.action?.replace('.', '-')}`}>
                              {log.action}
                            </span>
                          </td>
                          <td>
                            <div className="audit-target-info">
                              <span>Entity: <strong>{log.target_type}</strong></span>
                              {log.target_id && <span>ID: #{log.target_id}</span>}
                            </div>
                          </td>
                          <td>
                            <div className="audit-client-info">
                              <span>IP: {log.ip_address || '—'}</span>
                              <span className="audit-ua" title={log.user_agent}>
                                {log.user_agent ? (log.user_agent.length > 30 ? log.user_agent.slice(0, 30) + '...' : log.user_agent) : '—'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="audit-details-json">
                              {log.details ? (
                                <pre>{JSON.stringify(JSON.parse(log.details), null, 2)}</pre>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Audit Pagination */}
                <div className="audit-pagination-bar">
                  <button 
                    className="btn-secondary-custom" 
                    onClick={() => setLogPage(p => Math.max(p - 1, 1))}
                    disabled={logPage === 1 || logsLoading}
                  >
                    ⬅️ Previous Page
                  </button>
                  <span className="audit-page-display">Page <strong>{logPage}</strong></span>
                  <button 
                    className="btn-secondary-custom" 
                    onClick={() => setLogPage(p => p + 1)}
                    disabled={logs.length < logLimit || logsLoading}
                  >
                    Next Page ➡️
                  </button>
                </div>
              </div>
            )}
          </div>
        )}



      </div>

    </div>
  );
};

export default Reports;
