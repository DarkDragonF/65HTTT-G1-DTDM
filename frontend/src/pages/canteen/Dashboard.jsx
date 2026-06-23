import { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getCanteenStats, getCanteenOrders } from '../../api/orderApi';
import './Dashboard.css';

const Dashboard = () => {
  const { canteen } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [period, setPeriod] = useState('daily');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!canteen) return;
    setIsLoading(true);
    try {
      const statsRes = await getCanteenStats(canteen.id, { period });
      const ordersRes = await getCanteenOrders(canteen.id, { limit: 5 });
      setStats(statsRes.data.data.stats || statsRes.data.data);
      setRecentOrders(ordersRes.data.data.orders || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [canteen, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);



  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'order-badge-pending';
      case 'confirmed': return 'order-badge-confirmed';
      case 'preparing': return 'order-badge-preparing';
      case 'ready_for_pickup': return 'order-badge-ready';
      case 'completed': return 'order-badge-completed';
      case 'cancelled': return 'order-badge-cancelled';
      default: return 'order-badge-pending';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount || 0));
  };

  const getCompletionRate = () => {
    if (!stats) return 0;
    const total = Number(stats.totalOrders || 0);
    const completed = Number(stats.completedOrders || 0);
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (isLoading || !stats) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Fetching metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <h2>Dashboard Overview</h2>
        <p>Monitor your sales, performance metrics, and process new orders.</p>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon revenue-icon">💰</div>
          <div className="metric-details">
            <span className="metric-label">Total Revenue</span>
            <h3 className="metric-value">{formatCurrency(stats.totalRevenue)}</h3>
            <span className="metric-trend positive">All-time Earnings</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon orders-icon">📦</div>
          <div className="metric-details">
            <span className="metric-label">Total Orders</span>
            <h3 className="metric-value">{stats.totalOrders}</h3>
            <span className="metric-trend">Customer requests</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon completion-icon">✅</div>
          <div className="metric-details">
            <span className="metric-label">Completion Rate</span>
            <h3 className="metric-value">{getCompletionRate()}%</h3>
            <div className="completion-bar-container">
              <div className="completion-bar" style={{ width: `${getCompletionRate()}%` }}></div>
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon cancellations-icon">❌</div>
          <div className="metric-details">
            <span className="metric-label">Cancelled Orders</span>
            <h3 className="metric-value">{stats.cancelledOrders}</h3>
            <span className="metric-trend negative">Rejected/Cancelled</span>
          </div>
        </div>
      </div>

      {/* Dashboard Main Columns */}
      <div className="dashboard-row">
        {/* Left Column: Recent Orders */}
        <div className="dashboard-col col-main">
          <div className="section-card">
            <div className="section-card-header">
              <h3>Recent Incoming Orders</h3>
              <Link to="/canteen/orders" className="section-header-link">View All Orders</Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <span className="empty-state-emoji">📭</span>
                <p>No recent orders found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total Amount</th>
                      <th>Status</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <Link to="/canteen/orders" className="order-id-link">
                            #{order.id}
                          </Link>
                        </td>
                        <td>
                          <div className="customer-info-cell">
                            <span className="customer-name">{order.customer_name}</span>
                            <span className="customer-phone">{order.customer_phone || 'No Phone'}</span>
                          </div>
                        </td>
                        <td>{order.note || 'Regular Order'}</td>
                        <td>{formatCurrency(order.total_amount)}</td>
                        <td>
                          <span className={`status-badge-custom ${getStatusBadgeClass(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Sales Trends */}
        <div className="dashboard-col col-side">
          <div className="section-card">
            <div className="section-card-header">
              <h3>Revenue Log</h3>
              <div className="period-toggle-buttons">
                <button 
                  className={`period-toggle-btn ${period === 'daily' ? 'active' : ''}`}
                  onClick={() => setPeriod('daily')}
                >
                  Day
                </button>
                <button 
                  className={`period-toggle-btn ${period === 'weekly' ? 'active' : ''}`}
                  onClick={() => setPeriod('weekly')}
                >
                  Week
                </button>
                <button 
                  className={`period-toggle-btn ${period === 'monthly' ? 'active' : ''}`}
                  onClick={() => setPeriod('monthly')}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="revenue-history-list">
              {stats.revenueByPeriod && stats.revenueByPeriod.length > 0 ? (
                stats.revenueByPeriod.slice(0, 6).map((item, idx) => (
                  <div className="revenue-history-item" key={idx}>
                    <div className="rev-item-left">
                      <span className="rev-item-period">{item.period}</span>
                      <span className="rev-item-count">{item.orderCount} completed order(s)</span>
                    </div>
                    <span className="rev-item-value">{formatCurrency(item.revenue)}</span>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>No history available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
