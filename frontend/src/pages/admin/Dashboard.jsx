import { useState, useEffect } from 'react';
import { getAdminDashboardSummary, getAdminRevenueReport, triggerRevenueSnapshot } from '../../api/adminApi';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueReport, setRevenueReport] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snapDate, setSnapDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSnapping, setIsSnapping] = useState(false);
  const [snapMsg, setSnapMsg] = useState('');

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const summaryRes = await getAdminDashboardSummary();
      setStats(summaryRes.data?.data);

      const revenueRes = await getAdminRevenueReport();
      setRevenueReport(revenueRes.data?.data || []);
    } catch (error) {
      console.error('Failed to load admin dashboard summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleSnapshotTrigger = async (e) => {
    e.preventDefault();
    setIsSnapping(true);
    setSnapMsg('');
    try {
      await triggerRevenueSnapshot(snapDate);
      setSnapMsg('✅ Analytics snapshot completed successfully!');
      loadDashboardData(); // Reload stats
    } catch (error) {
      setSnapMsg(`❌ Failed: ${error.response?.data?.message || 'Server error'}`);
    } finally {
      setIsSnapping(false);
    }
  };

  if (isLoading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  const totals = stats?.totals || {};
  const trends = stats?.revenueTrends || {};

  return (
    <div className="admin-dashboard-view">
      <div className="dashboard-intro">
        <h3>Dashboard Overview</h3>
        <p>Real-time statistics, revenue metrics, and operational snapshot controls.</p>
      </div>

      {/* Stats Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-icon">👥</span>
          <div className="metric-info">
            <span className="metric-value">{totals.users || 0}</span>
            <span className="metric-label">Total Users</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">🎓</span>
          <div className="metric-info">
            <span className="metric-value">{totals.students || 0}</span>
            <span className="metric-label">Students</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">🏫</span>
          <div className="metric-info">
            <span className="metric-value">{totals.canteens || 0}</span>
            <span className="metric-label">Active Canteens</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">🚴</span>
          <div className="metric-info">
            <span className="metric-value">{totals.deliveryStaff || 0}</span>
            <span className="metric-label">Rider Agents</span>
          </div>
        </div>

        <div className="metric-card">
          <span className="metric-icon">📦</span>
          <div className="metric-info">
            <span className="metric-value">{totals.orders || 0}</span>
            <span className="metric-label">Total Orders</span>
          </div>
        </div>

        <div className="metric-card highlight-metric">
          <span className="metric-icon">💰</span>
          <div className="metric-info">
            <span className="metric-value">{Number(totals.revenue || 0).toLocaleString()}đ</span>
            <span className="metric-label">Total Sales</span>
          </div>
        </div>
      </div>

      {/* Revenue Sections */}
      <div className="dashboard-content-split">
        <div className="revenue-trends-card">
          <h4>Sales Performance Trends</h4>
          <div className="trends-grid">
            <div className="trend-item">
              <span className="trend-lbl">Today's Revenue</span>
              <span className="trend-val">{Number(trends.daily || 0).toLocaleString()}đ</span>
            </div>
            <div className="trend-item">
              <span className="trend-lbl">7-Day Revenue</span>
              <span className="trend-val">{Number(trends.weekly || 0).toLocaleString()}đ</span>
            </div>
            <div className="trend-item">
              <span className="trend-lbl">30-Day Revenue</span>
              <span className="trend-val">{Number(trends.monthly || 0).toLocaleString()}đ</span>
            </div>
          </div>

          <h5 style={{ marginTop: '24px', marginBottom: '12px' }}>Daily Sales Distribution</h5>
          <div className="bars-chart">
            {revenueReport.length === 0 ? (
              <p className="no-data-msg">No sales data found for the current period.</p>
            ) : (
              revenueReport.map((day, idx) => (
                <div key={idx} className="chart-bar-row">
                  <span className="bar-date">{day.date}</span>
                  <div className="bar-wrapper">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${Math.min(100, (day.dailyRevenue / Math.max(...revenueReport.map(d => d.dailyRevenue), 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="bar-val">{Number(day.dailyRevenue).toLocaleString()}đ ({day.ordersCount} orders)</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Snapshot Controls */}
        <div className="snapshot-controls-card">
          <h4>Sync Zoho & Generate Snapshot</h4>
          <p className="snap-desc">Manually compile daily aggregates and trigger data sync to **Zoho Analytics**.</p>
          
          <form onSubmit={handleSnapshotTrigger} className="snapshot-form">
            <div className="form-group">
              <label>Select Snapshot Date</label>
              <input 
                type="date" 
                value={snapDate} 
                onChange={(e) => setSnapDate(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn-primary-custom" disabled={isSnapping}>
              {isSnapping ? 'Syncing data...' : '⚡ Generate Daily Snapshot'}
            </button>
          </form>
          {snapMsg && <p className="snapshot-msg">{snapMsg}</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
