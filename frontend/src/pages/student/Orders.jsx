import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import './Orders.css';

/**
 * Orders Page. Lists student order history, supporting tabs for active/past orders
 * and styling status badges.
 */
const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'past'

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await orderService.getMyOrders();
        // Backend returns: { success: true, data: { orders, total, ... } }
        setOrders(data.data?.orders || []);
      } catch (error) {
        console.error('Failed to load orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    return orders.filter(order => {
      const isActive = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivering'].includes(order.status);
      return activeTab === 'active' ? isActive : !isActive;
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'preparing': return 'status-preparing';
      case 'ready_for_pickup': return 'status-ready';
      case 'delivering': return 'status-delivering';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="student-loading">
        <div className="student-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="student-orders animate-fade-in">
      <div className="orders-header">
        <h2>My Orders</h2>
        <p>Track your current meals or view your order history</p>
      </div>

      {/* Tabs */}
      <div className="orders-tabs">
        <button
          className={`orders-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Orders
        </button>
        <button
          className={`orders-tab-btn ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Order History
        </button>
      </div>

      {getFilteredOrders().length === 0 ? (
        <div className="empty-state">
          <span className="empty-emoji">📦</span>
          <h3>No Orders Found</h3>
          <p>You don't have any {activeTab} orders at the moment.</p>
          {activeTab === 'active' && (
            <button className="explore-btn" onClick={() => navigate('/')}>
              Order Now
            </button>
          )}
        </div>
      ) : (
        <div className="orders-list">
          {getFilteredOrders().map(order => (
            <div key={order.id} className="order-summary-card" onClick={() => navigate(`/orders/${order.id}`)}>
              <div className="order-summary-header">
                <div className="order-num-canteen">
                  <span className="order-num">{order.order_number || `#${order.id}`}</span>
                  <span className="order-canteen">🏪 {order.canteen_name}</span>
                </div>
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <div className="order-summary-body">
                <span className="order-date">📅 {formatDate(order.created_at)}</span>
                <span className="order-total">Total: <strong>{formatCurrency(order.total_amount)}</strong></span>
              </div>
              <div className="order-summary-footer">
                {order.note && <p className="order-note-preview">📝 Note: "{order.note}"</p>}
                <button className="view-details-btn">Track Order &rarr;</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
