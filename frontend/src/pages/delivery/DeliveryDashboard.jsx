import { useState, useEffect, useCallback } from 'react';
import { getAvailableDeliveries, getMyDeliveries, updateOrderStatus, getOrderDetails } from '../../api/orderApi';
import { useNotification } from '../../hooks/useNotification';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const { showToast, confirm } = useNotification();
  // Tabs: 'available', 'active'
  const [activeTab, setActiveTab] = useState('available');

  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // 1. Fetch available pickups
  const loadAvailablePickups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAvailableDeliveries();
      setAvailableOrders(res.data?.data?.orders || []);
    } catch (error) {
      console.error('Failed to load available deliveries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch active assigned tasks
  const loadMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyDeliveries();
      // Filter out completed/cancelled to only show active delivering tasks
      const activeTasks = (res.data?.data?.orders || []).filter(o => o.status === 'delivering');
      setMyOrders(activeTasks);
    } catch (error) {
      console.error('Failed to load rider deliveries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload lists depending on tab
  useEffect(() => {
    if (activeTab === 'available') {
      loadAvailablePickups();
    } else {
      loadMyTasks();
    }
    setSelectedOrderId(null);
    setSelectedOrder(null);
  }, [activeTab, loadAvailablePickups, loadMyTasks]);

  // Load detailed items for selected order
  useEffect(() => {
    const fetchDetails = async () => {
      if (!selectedOrderId) {
        setSelectedOrder(null);
        return;
      }
      setLoadingDetails(true);
      try {
        const res = await getOrderDetails(selectedOrderId);
        setSelectedOrder(res.data?.data?.order || null);
      } catch (error) {
        console.error('Failed to fetch order details:', error);
      } finally {
        setLoadingDetails(false);
      }
    };
    fetchDetails();
  }, [selectedOrderId]);

  // Claim pickup task
  const handleClaimTask = async (orderId) => {
    const isAccepted = await confirm('Accept Task', 'Do you want to accept this delivery task?');
    if (!isAccepted) return;
    try {
      await updateOrderStatus(orderId, 'delivering');
      showToast('Task claimed successfully. Head to the canteen to pickup items!', 'success');
      setActiveTab('active');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to claim task.', 'error');
    }
  };

  // Complete delivery task
  const handleCompleteTask = async (orderId) => {
    const isAccepted = await confirm('Confirm Delivery', 'Confirm that this order has been successfully delivered to the customer.');
    if (!isAccepted) return;
    try {
      await updateOrderStatus(orderId, 'completed');
      showToast('Delivery marked as completed. Well done!', 'success');
      loadMyTasks();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to complete task.', 'error');
    }
  };

  return (
    <div className="delivery-dashboard-view">
      {/* Overview stats cards */}
      <div className="rider-stats-grid">
        <div className="rider-stat-card">
          <div className="rider-stat-icon">🚴</div>
          <div className="rider-stat-info">
            <span className="rider-stat-value">{myOrders.length}</span>
            <span className="rider-stat-label">Active Delivers</span>
          </div>
        </div>
        <div className="rider-stat-card">
          <div className="rider-stat-icon">📦</div>
          <div className="rider-stat-info">
            <span className="rider-stat-value">{availableOrders.length}</span>
            <span className="rider-stat-label">Available Pickups</span>
          </div>
        </div>
        <div className="rider-stat-card">
          <div className="rider-stat-icon">💰</div>
          <div className="rider-stat-info">
            <span className="rider-stat-value">15k ₫</span>
            <span className="rider-stat-label">Earnings / Trip</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="delivery-tabs-nav">
        <button 
          className={`delivery-tab-btn ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          🎒 Available Canteen Pickups ({availableOrders.length})
        </button>
        <button 
          className={`delivery-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          🚲 My Active Deliveries ({myOrders.length})
        </button>
      </div>

      <div className="delivery-workspace-split">
        
        {/* Orders list pane */}
        <div className="delivery-orders-list-pane">
          {loading ? (
            <div className="pane-loader">
              <div className="admin-spinner"></div>
              <span>Searching nearby canteens...</span>
            </div>
          ) : (activeTab === 'available' ? availableOrders : myOrders).length === 0 ? (
            <div className="pane-empty-card">
              <span className="empty-emoji">🏝️</span>
              <p>No {activeTab} delivery runs found at this time.</p>
            </div>
          ) : (
            <div className="delivery-cards-stack">
              {(activeTab === 'available' ? availableOrders : myOrders).map((o) => (
                <div 
                  key={o.id} 
                  className={`delivery-order-card ${selectedOrderId === o.id ? 'active' : ''}`}
                  onClick={() => setSelectedOrderId(o.id)}
                >
                  <div className="card-top">
                    <strong>#{o.order_number}</strong>
                    <span className={`status-badge-custom ${o.status}`}>
                      {o.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="card-route-info">
                    <div className="route-stop canteen">
                      <span className="stop-icon">🏢</span>
                      <div className="stop-detail">
                        <span>Pickup:</span>
                        <strong>{o.canteen_name}</strong>
                      </div>
                    </div>
                    <div className="route-stop customer">
                      <span className="stop-icon">📍</span>
                      <div className="stop-detail">
                        <span>Deliver To:</span>
                        <strong>{o.customer_name}</strong>
                        <span className="address-sub">{o.delivery_address || 'Main Campus'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-bottom">
                    <span className="amount-label">Payable Amount:</span>
                    <strong className="amount-value">{Number(o.total_price || o.total_amount).toLocaleString()} ₫</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details and Operations Map/Pane */}
        <div className="delivery-details-pane">
          {selectedOrderId ? (
            loadingDetails && !selectedOrder ? (
              <div className="details-loader">
                <div className="admin-spinner"></div>
                <span>Syncing trip details...</span>
              </div>
            ) : (
              selectedOrder && (
                <div className="delivery-details-workspace">
                  <h4>Delivery Details: #{selectedOrder.order_number}</h4>
                  
                  <div className="details-route-card">
                    <div className="route-step">
                      <span className="bullet start">A</span>
                      <div className="step-content">
                        <strong>{selectedOrder.canteen_name}</strong>
                        <span>Merchant Location - Collect Items</span>
                      </div>
                    </div>
                    <div className="route-step">
                      <span className="bullet end">B</span>
                      <div className="step-content">
                        <strong>{selectedOrder.customer_name}</strong>
                        <span>Customer Location - Deliver Items</span>
                        <span className="address-highlight">📍 {selectedOrder.delivery_address || 'Main Campus'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order items listing */}
                  <div className="order-items-box">
                    <h5>Package Contents</h5>
                    <div className="items-list-container">
                      {selectedOrder.items && selectedOrder.items.map((item) => (
                        <div className="item-row-rider" key={item.id}>
                          <span className="item-qty">{item.quantity}x</span>
                          <span className="item-name">{item.food_name || `Item #${item.food_id}`}</span>
                          <span className="item-price">{Number(item.price).toLocaleString()} ₫</span>
                        </div>
                      ))}
                    </div>
                    <div className="items-box-footer">
                      <span>Total Invoice:</span>
                      <strong>{Number(selectedOrder.total_price || selectedOrder.total_amount).toLocaleString()} ₫</strong>
                    </div>
                  </div>

                  {selectedOrder.note && (
                    <div className="rider-note-card">
                      <strong>Customer Remarks:</strong>
                      <p>"{selectedOrder.note}"</p>
                    </div>
                  )}

                  {/* Actions buttons */}
                  <div className="rider-action-footer">
                    {selectedOrder.status === 'ready_for_pickup' && (
                      <button 
                        className="btn-rider-action claim"
                        onClick={() => handleClaimTask(selectedOrder.id)}
                      >
                        🎒 Accept & Pickup Delivery Task
                      </button>
                    )}
                    {selectedOrder.status === 'delivering' && (
                      <button 
                        className="btn-rider-action complete"
                        onClick={() => handleCompleteTask(selectedOrder.id)}
                      >
                        ✔️ Confirm Successful Delivery
                      </button>
                    )}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="empty-details-view">
              <span className="empty-rider-emoji">🚴</span>
              <p>Select an assignment card to display client route, item manifest, and action triggers.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DeliveryDashboard;
