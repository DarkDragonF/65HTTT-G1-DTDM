import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getCanteenOrders, getOrderDetails, updateOrderStatus } from '../../api/orderApi';
import './OrderManagement.css';

const OrderManagement = () => {
  const { canteen } = useOutletContext();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active', 'completed', 'cancelled'
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Cancellation Modal state
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const fetchOrders = useCallback(async () => {
    if (!canteen) return;
    setIsLoading(true);
    try {
      const { data } = await getCanteenOrders(canteen.id);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  }, [canteen]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = async (orderId) => {
    setIsLoadingDetails(true);
    try {
      const { data } = await getOrderDetails(orderId);
      setSelectedOrder(data);
    } catch (error) {
      alert('Failed to fetch order details.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      // Refresh list
      fetchOrders();
      // If modal is open, update details
      if (selectedOrder && selectedOrder.id === orderId) {
        handleViewDetails(orderId);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update order status.');
    }
  };

  const handleOpenCancelModal = (order) => {
    setCancellingOrder(order);
    setCancelReason('');
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setIsSubmittingCancel(true);
    try {
      await updateOrderStatus(cancellingOrder.id, 'cancelled', cancelReason);
      setCancellingOrder(null);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === cancellingOrder.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const getFilteredOrders = () => {
    return orders.filter((order) => {
      if (activeTab === 'active') {
        return ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivering'].includes(order.status);
      } else if (activeTab === 'completed') {
        return order.status === 'completed';
      } else {
        return order.status === 'cancelled';
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return '⏳ Pending';
      case 'confirmed': return '👍 Confirmed';
      case 'preparing': return '🍳 Preparing';
      case 'ready_for_pickup': return '📦 Ready for Pickup';
      case 'delivering': return '🏍️ Delivering';
      case 'completed': return '✅ Completed';
      case 'cancelled': return '❌ Cancelled';
      default: return status;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'order-badge-pending';
      case 'confirmed': return 'order-badge-confirmed';
      case 'preparing': return 'order-badge-preparing';
      case 'ready_for_pickup': return 'order-badge-ready';
      case 'delivering': return 'order-badge-delivering';
      case 'completed': return 'order-badge-completed';
      case 'cancelled': return 'order-badge-cancelled';
      default: return 'order-badge-pending';
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>Order Processing</h2>
        <p>Monitor customer requests, confirm incoming orders, and track order stages.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="orders-tabs">
        <button 
          className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active Orders <span>({orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivering'].includes(o.status)).length})</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed <span>({orders.filter(o => o.status === 'completed').length})</span>
        </button>
        <button 
          className={`tab-button ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled <span>({orders.filter(o => o.status === 'cancelled').length})</span>
        </button>
      </div>

      {/* Orders List Container */}
      {isLoading ? (
        <div className="orders-loading">
          <div className="spinner"></div>
          <p>Syncing orders...</p>
        </div>
      ) : getFilteredOrders().length === 0 ? (
        <div className="orders-empty-state">
          <span className="empty-emoji">📦</span>
          <h3>No orders in this category</h3>
          <p>Incoming customer orders will appear here automatically.</p>
        </div>
      ) : (
        <div className="orders-list">
          {getFilteredOrders().map((order) => (
            <div key={order.id} className="order-item-card">
              <div className="order-card-header">
                <div className="order-id-section">
                  <span className="order-id-label">Order</span>
                  <h4 className="order-id-number">#{order.id}</h4>
                </div>
                <span className={`status-badge-custom ${getStatusBadgeClass(order.status)}`}>
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-info-row">
                  <span className="info-label">Customer:</span>
                  <span className="info-value">{order.customer_name}</span>
                </div>
                <div className="order-info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{order.customer_phone || 'N/A'}</span>
                </div>
                <div className="order-info-row">
                  <span className="info-label">Total Amount:</span>
                  <span className="info-value price-text">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="order-info-row">
                  <span className="info-label">Order Time:</span>
                  <span className="info-value">
                    {new Date(order.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
                {order.note && (
                  <div className="order-card-note">
                    <strong>Note:</strong> {order.note}
                  </div>
                )}
                {order.cancel_reason && (
                  <div className="order-card-cancel-reason">
                    <strong>Cancel Reason:</strong> {order.cancel_reason}
                  </div>
                )}
              </div>

              <div className="order-card-footer">
                <button 
                  className="btn-view-details-custom" 
                  onClick={() => handleViewDetails(order.id)}
                >
                  View Details
                </button>

                <div className="order-action-controls">
                  {order.status === 'pending' && (
                    <>
                      <button 
                        className="btn-cancel-custom"
                        onClick={() => handleOpenCancelModal(order)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-confirm-custom"
                        onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      >
                        Confirm
                      </button>
                    </>
                  )}

                  {order.status === 'confirmed' && (
                    <>
                      <button 
                        className="btn-cancel-custom"
                        onClick={() => handleOpenCancelModal(order)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-prepare-custom"
                        onClick={() => handleUpdateStatus(order.id, 'preparing')}
                      >
                        Prepare
                      </button>
                    </>
                  )}

                  {order.status === 'preparing' && (
                    <>
                      <button 
                        className="btn-cancel-custom"
                        onClick={() => handleOpenCancelModal(order)}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn-ready-custom"
                        onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}
                      >
                        Ready
                      </button>
                    </>
                  )}

                  {/* Fallback complete for owners if delivery stuff isn't used */}
                  {order.status === 'ready_for_pickup' && (
                    <button 
                      className="btn-complete-custom"
                      onClick={() => handleUpdateStatus(order.id, 'completed')}
                    >
                      Complete Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal-backdrop-custom">
          <div className="order-details-modal-card">
            <div className="details-modal-header">
              <h3>Order Detail #{selectedOrder.id}</h3>
              <button className="btn-close-modal" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>

            <div className="details-modal-body">
              <div className="details-customer-section">
                <h4>Customer Information</h4>
                <div className="details-grid-two">
                  <div>
                    <span className="details-label">Name</span>
                    <span className="details-value">{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="details-label">Phone</span>
                    <span className="details-value">{selectedOrder.customer_phone || 'No phone'}</span>
                  </div>
                </div>
              </div>

              <div className="details-items-section">
                <h4>Ordered Foods</h4>
                <div className="details-items-list">
                  {selectedOrder.items && selectedOrder.items.map((item, idx) => (
                    <div className="detail-food-item" key={idx}>
                      <div className="item-name-col">
                        <span className="item-qty">{item.quantity}x</span>
                        <span className="item-name">{item.food_name || 'Food item'}</span>
                      </div>
                      <span className="item-subtotal">{formatCurrency(item.subtotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="detail-total-row">
                  <span>Grand Total</span>
                  <span className="total-val">{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>

              {selectedOrder.note && (
                <div className="details-note-section">
                  <h4>Customer Note</h4>
                  <p className="details-note-p">{selectedOrder.note}</p>
                </div>
              )}
            </div>

            <div className="details-modal-footer">
              <button className="btn-secondary-custom" onClick={() => setSelectedOrder(null)}>Close</button>
              
              <div className="modal-footer-actions">
                {selectedOrder.status === 'pending' && (
                  <button 
                    className="btn-confirm-custom"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                  >
                    Confirm Order
                  </button>
                )}
                {selectedOrder.status === 'confirmed' && (
                  <button 
                    className="btn-prepare-custom"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'preparing')}
                  >
                    Start Preparing
                  </button>
                )}
                {selectedOrder.status === 'preparing' && (
                  <button 
                    className="btn-ready-custom"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'ready_for_pickup')}
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingOrder && (
        <div className="modal-backdrop-custom">
          <div className="cancel-modal-card">
            <div className="cancel-modal-header">
              <h3>Cancel Order #{cancellingOrder.id}</h3>
              <button className="btn-close-modal" onClick={() => setCancellingOrder(null)}>&times;</button>
            </div>

            <form onSubmit={handleCancelSubmit} className="cancel-modal-form">
              <div className="form-group">
                <label htmlFor="cancel-reason">Reason for Cancellation *</label>
                <textarea
                  id="cancel-reason"
                  required
                  rows="3"
                  placeholder="e.g. Out of stock / Store closing soon / Overcrowded"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
              </div>

              <div className="cancel-modal-buttons">
                <button type="button" className="btn-secondary-custom" onClick={() => setCancellingOrder(null)}>
                  Keep Order
                </button>
                <button type="submit" className="btn-cancel-submit" disabled={isSubmittingCancel}>
                  {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
