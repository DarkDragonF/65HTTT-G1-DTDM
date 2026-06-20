import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';
import { useNotification } from '../../hooks/useNotification';
import './OrderDetail.css';

/**
 * Order Details Page. Tracks order status timeline, displays items,
 * detail information (delivery staff contact) and supports student cancel orders.
 */
const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await orderService.getOrderDetails(id);
      // Backend returns: { success: true, data: { order } }
      setOrder(res.data?.order || null);
    } catch (error) {
      console.error('Failed to load order details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
    
    // Poll order details every 10 seconds to auto-update timeline
    const interval = setInterval(fetchOrderDetails, 10000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancelOrder = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await orderService.cancelOrder(id, cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
      showToast('Order cancelled successfully.', 'success');
      fetchOrderDetails();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to cancel order.', 'error');
    } finally {
      setIsCancelling(false);
    }
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
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (isLoading && !order) {
    return (
      <div className="student-loading">
        <div className="student-spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="student-order-detail empty-view animate-fade-in">
        <div className="empty-state">
          <span className="empty-emoji">❓</span>
          <h2>Order Not Found</h2>
          <p>We couldn't find the order you are looking for.</p>
          <button className="explore-btn" onClick={() => navigate('/orders')}>
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  // Steps for timeline progression
  const steps = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Canteen Confirmed' },
    { key: 'preparing', label: 'Preparing Food' },
    { key: 'ready_for_pickup', label: 'Ready for Pickup' },
    { key: 'delivering', label: 'Out for Delivery' },
    { key: 'completed', label: 'Completed' }
  ];

  const getStepIndex = (status) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex(s => s.key === status);
  };

  const currentStepIndex = getStepIndex(order.status);

  return (
    <div className="student-order-detail animate-fade-in">
      {/* Header */}
      <div className="detail-header-row">
        <button className="back-btn" onClick={() => navigate('/orders')}>&larr; Back to Orders</button>
        <div className="header-meta">
          <h2>Order {order.order_number || `#${order.id}`}</h2>
          <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="detail-container">
        {/* Left pane: Details, Items, Notes */}
        <div className="detail-main">
          {/* Canteen info */}
          <div className="detail-card canteen-details">
            <h3>Store Information</h3>
            <p><strong>🏪 Canteen:</strong> {order.canteen_name}</p>
            <p><strong>📅 Placed At:</strong> {formatDate(order.created_at)}</p>
          </div>

          {/* Items list */}
          <div className="detail-card items-list-card">
            <h3>Order Items</h3>
            <div className="order-items-container">
              {order.items && order.items.map(item => (
                <div key={item.id} className="order-item-row">
                  <div className="order-item-left">
                    <span className="item-qty">{item.quantity}x</span>
                    <span className="item-name">{item.food_name}</span>
                  </div>
                  <span className="item-subtotal">{formatCurrency(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="order-total-summary">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
              <div className="summary-row">
                <span>Delivery</span>
                <span className="free-badge">FREE</span>
              </div>
              <hr />
              <div className="summary-row total-row">
                <span>Total</span>
                <span className="total-val">{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Notes & Actions */}
          <div className="detail-card note-actions-card">
            <h3>Instructions & Details</h3>
            {order.note ? (
              <p className="order-note-text">"{order.note}"</p>
            ) : (
              <p className="no-note-text">No notes provided for this order.</p>
            )}

            {order.delivery_staff_name && (
              <div className="delivery-staff-info">
                <h4>🚴 Assigned Delivery Partner</h4>
                <p><strong>Name:</strong> {order.delivery_staff_name}</p>
                <p><strong>Phone:</strong> {order.delivery_staff_phone || 'N/A'}</p>
              </div>
            )}

            {order.status === 'cancelled' && (
              <div className="cancel-info-box">
                <h4>❌ Order Cancelled</h4>
                <p><strong>Cancelled by:</strong> {order.cancelled_by?.toUpperCase() || 'N/A'}</p>
                <p><strong>Reason:</strong> "{order.cancel_reason || 'N/A'}"</p>
              </div>
            )}

            {order.status === 'pending' && (
              <button className="cancel-order-trigger-btn" onClick={() => setShowCancelModal(true)}>
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Right pane: Status Tracker Timeline */}
        <div className="detail-sidebar">
          <div className="detail-card tracker-card">
            <h3>Track Order</h3>
            
            {order.status === 'cancelled' ? (
              <div className="cancelled-timeline-state">
                <span className="cancel-timeline-emoji">❌</span>
                <h4>Order Cancelled</h4>
                <p>This order has been cancelled and cannot be tracked further.</p>
              </div>
            ) : (
              <div className="timeline">
                {steps.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isActive = idx === currentStepIndex;
                  // Check if this step has status logs
                  const log = order.timeline?.find(l => l.to_status === step.key);

                  return (
                    <div key={step.key} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      <div className="timeline-marker">
                        {isCompleted ? (
                          <span className="marker-check">✓</span>
                        ) : (
                          <span className="marker-dot"></span>
                        )}
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-label">{step.label}</span>
                        {log && (
                          <span className="timeline-time">{new Date(log.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        {log && log.note && (
                          <p className="timeline-note">{log.note}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Reason Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-slide-in">
            <h3>Cancel Order</h3>
            <p>Please provide a reason for cancelling this order. This helps the canteen understand your cancellation.</p>
            <form onSubmit={handleCancelOrder}>
              <div className="form-group">
                <textarea
                  required
                  placeholder="e.g. Changed my mind / Ordered wrong item / Deliver time too long..."
                  rows="3"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="modal-cancel-btn" onClick={() => setShowCancelModal(false)}>Close</button>
                <button type="submit" className="modal-submit-btn" disabled={isCancelling}>
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetail;
