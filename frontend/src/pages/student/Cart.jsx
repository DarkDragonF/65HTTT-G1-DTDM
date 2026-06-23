import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { placeOrderFromCart } from '../../api/orderApi';
import { useNotification } from '../../hooks/useNotification';
import './Cart.css';

/**
 * Cart Page. Lists cart items per canteen, computes totals on backend,
 * updates quantities, removes items, and posts checkout orders.
 */
const Cart = () => {
  const navigate = useNavigate();
  const { carts, activeCart, fetchCartDetails, updateQuantity, removeItem, clearCanteenCart, refreshCarts } = useCart();
  const { showToast, confirm } = useNotification();
  const [selectedCanteenId, setSelectedCanteenId] = useState(null);
  const [note, setNote] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Set default canteen cart when summary lists are loaded or updated
  useEffect(() => {
    if (carts.length > 0) {
      if (!selectedCanteenId || !carts.some(c => c.canteenId === selectedCanteenId)) {
        setSelectedCanteenId(carts[0].canteenId);
      }
    } else {
      setSelectedCanteenId(null);
    }
  }, [carts, selectedCanteenId]);

  // Fetch detailed cart items when selected canteen changes
  useEffect(() => {
    if (selectedCanteenId) {
      setIsLoadingDetails(true);
      fetchCartDetails(selectedCanteenId)
        .catch(err => console.error('Failed to load cart details:', err))
        .finally(() => setIsLoadingDetails(false));
    }
  }, [selectedCanteenId, fetchCartDetails]);

  const handleQtyChange = async (itemId, currentQty, change, maxStock) => {
    const nextQty = currentQty + change;
    if (nextQty >= 1 && nextQty <= maxStock) {
      try {
        await updateQuantity(itemId, nextQty);
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to update quantity.', 'error');
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    const isAccepted = await confirm('Remove Item', 'Are you sure you want to remove this item from your cart?');
    if (isAccepted) {
      try {
        await removeItem(itemId);
        showToast('Item removed from cart.', 'success');
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to remove item.', 'error');
      }
    }
  };

  const handleClearCart = async () => {
    const isAccepted = await confirm('Clear Cart', 'Are you sure you want to remove all items from this canteen cart?');
    if (isAccepted) {
      try {
        await clearCanteenCart(selectedCanteenId);
        showToast('Cart cleared successfully.', 'success');
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to clear cart.', 'error');
      }
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedCanteenId || !activeCart || activeCart.items.length === 0) return;
    
    setIsCheckingOut(true);
    try {
      const response = await placeOrderFromCart(selectedCanteenId, { note });
      setNote('');
      await refreshCarts();
      showToast('Order placed successfully!', 'success');
      const order = response.data.data.order; // Matches backend success payload structure: { success, message, data: { order } }
      navigate(`/orders/${order.id}`);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to place order.', 'error');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (carts.length === 0) {
    return (
      <div className="student-cart empty-view animate-fade-in">
        <div className="empty-state">
          <span className="empty-emoji">🛒</span>
          <h2>Your Cart is Empty</h2>
          <p>You haven't added any items to your cart yet. Go browse our campus canteens and pick your favorite meals!</p>
          <button className="explore-btn" onClick={() => navigate('/')}>
            Explore Canteens & Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="student-cart animate-fade-in">
      <div className="cart-header-title">
        <h2>My Shopping Carts</h2>
        <p>You have active selections at {carts.length} canteen{carts.length > 1 ? 's' : ''}</p>
      </div>

      {/* Cart Tabbing / Multi-canteen selections */}
      {carts.length > 1 && (
        <div className="cart-tabs">
          {carts.map(cartSummary => (
            <button
              key={cartSummary.canteenId}
              className={`cart-tab-btn ${selectedCanteenId === cartSummary.canteenId ? 'active' : ''}`}
              onClick={() => setSelectedCanteenId(cartSummary.canteenId)}
            >
              🏪 {cartSummary.canteenName} ({cartSummary.totalQuantity})
            </button>
          ))}
        </div>
      )}

      {isLoadingDetails || !activeCart ? (
        <div className="student-loading" style={{ minHeight: '300px' }}>
          <div className="student-spinner"></div>
          <p>Loading cart details...</p>
        </div>
      ) : (
        <div className="cart-container">
          {/* Items List Card */}
          <div className="cart-items-section">
            <div className="cart-section-title">
              <h3>Items from {activeCart.canteenName}</h3>
              <button className="clear-cart-btn" onClick={handleClearCart}>Clear Cart</button>
            </div>
            
            <div className="cart-table-wrapper">
              <table className="cart-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {activeCart.items.map(item => (
                    <tr key={item.id}>
                      <td className="item-td">
                        <div className="cart-item-info">
                          <div className="cart-item-img">
                            {item.imageUrl ? (
                              <img src={`http://localhost:5000${item.imageUrl}`} alt={item.name} />
                            ) : (
                              <span>🍔</span>
                            )}
                          </div>
                          <div>
                            <span className="cart-item-name">{item.name}</span>
                            {item.stock < item.quantity && (
                              <span className="stock-warning">Exceeds stock ({item.stock} left)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>
                        <div className="qty-picker">
                          <button 
                            onClick={() => handleQtyChange(item.id, item.quantity, -1, item.stock)}
                            disabled={item.quantity <= 1}
                          >-</button>
                          <span className="qty-display">{item.quantity}</span>
                          <button 
                            onClick={() => handleQtyChange(item.id, item.quantity, 1, item.stock)}
                            disabled={item.quantity >= item.stock}
                          >+</button>
                        </div>
                      </td>
                      <td className="subtotal-td">{formatCurrency(item.subtotal)}</td>
                      <td>
                        <button className="delete-item-btn" onClick={() => handleRemoveItem(item.id)} aria-label="Remove item">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cart Summary & Checkout Sidebar */}
          <div className="cart-summary-section">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row">
                <span>Items Subtotal</span>
                <span>{formatCurrency(activeCart.subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Estimated Delivery</span>
                <span className="free-badge">FREE</span>
              </div>
              <hr />
              <div className="summary-row total-row">
                <span>Total Amount</span>
                <span className="total-price">{formatCurrency(activeCart.subtotal)}</span>
              </div>

              <form onSubmit={handleCheckout} className="checkout-form">
                <div className="form-group">
                  <label htmlFor="note">Add Notes / Instructions</label>
                  <textarea
                    id="note"
                    placeholder="e.g. No spicy, deliver to room 302 Building A5..."
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  className="checkout-btn" 
                  disabled={isCheckingOut || activeCart.items.some(item => item.quantity > item.stock)}
                >
                  {isCheckingOut ? 'Placing Order...' : 'Place Order &rarr;'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
