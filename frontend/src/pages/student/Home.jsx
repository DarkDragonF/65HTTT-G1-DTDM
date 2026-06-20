import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCanteens } from '../../api/canteenApi';
import { getFoodsByCanteen } from '../../api/foodApi';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import './Home.css';

/**
 * Student Home Page. Displays active canteens and details their menus,
 * allowing adding foods to the shopping cart.
 */
const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addItem, carts } = useCart();
  
  const [canteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [quantities, setQuantities] = useState({}); // foodId -> quantity

  useEffect(() => {
    const fetchCanteens = async () => {
      setIsLoading(true);
      try {
        const { data } = await getAllCanteens();
        // Only show active canteens
        setCanteens((data || []).filter(c => c.status === 'active'));
      } catch (error) {
        console.error('Failed to load canteens:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCanteens();
  }, []);

  const handleSelectCanteen = async (canteen) => {
    setSelectedCanteen(canteen);
    setIsLoadingFoods(true);
    setSelectedCategory('All');
    try {
      const { data } = await getFoodsByCanteen(canteen.id);
      // Only show available food items
      const availableFoods = (data || []).filter(f => f.status === 'available');
      setFoods(availableFoods);
      
      // Extract unique categories present in foods
      const uniqueCats = ['All', ...new Set(availableFoods.map(f => f.category_name || 'General'))];
      setCategories(uniqueCats);
      
      // Reset quantities map
      const initialQty = {};
      availableFoods.forEach(f => {
        initialQty[f.id] = 1;
      });
      setQuantities(initialQty);
    } catch (error) {
      console.error('Failed to load menu items:', error);
    } finally {
      setIsLoadingFoods(false);
    }
  };

  const handleQtyChange = (foodId, change, maxStock) => {
    const current = quantities[foodId] || 1;
    const next = current + change;
    if (next >= 1 && next <= maxStock) {
      setQuantities({ ...quantities, [foodId]: next });
    }
  };

  const handleAddToCart = async (food) => {
    const qty = quantities[food.id] || 1;
    try {
      await addItem(food.id, qty);
      alert(`Added ${qty}x "${food.name}" to cart!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add item to cart.');
    }
  };

  const getFilteredFoods = () => {
    if (selectedCategory === 'All') return foods;
    return foods.filter(f => (f.category_name || 'General') === selectedCategory);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="student-loading">
        <div className="student-spinner"></div>
        <p>Loading canteens...</p>
      </div>
    );
  }

  // Find if there is an active cart for this canteen to show quick-access cart bar
  const activeCartSummary = selectedCanteen 
    ? carts.find(c => c.canteenId === selectedCanteen.id)
    : null;

  return (
    <div className="student-home">
      {!selectedCanteen ? (
        // Canteen List View
        <div className="canteens-view animate-fade-in">
          <div className="section-header">
            <h2>Campus Canteens</h2>
            <p>Select a canteen below to browse its menu and order fresh meals</p>
          </div>
          {canteens.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🏢</span>
              <h3>No Active Canteens</h3>
              <p>There are currently no active canteens serving food.</p>
            </div>
          ) : (
            <div className="canteens-grid">
              {canteens.map(c => (
                <div key={c.id} className="canteen-card" onClick={() => handleSelectCanteen(c)}>
                  <div className="canteen-card-image">
                    {c.logo_url ? (
                      <img src={`http://localhost:5000${c.logo_url}`} alt={c.name} />
                    ) : (
                      <span className="canteen-logo-placeholder">🏪</span>
                    )}
                  </div>
                  <div className="canteen-card-info">
                    <h3>{c.name}</h3>
                    <p className="canteen-addr">{c.address || 'TLU Campus'}</p>
                    <p className="canteen-hours">🕒 {c.opening_hours || '08:00 - 20:00'}</p>
                    {c.description && <p className="canteen-desc">{c.description}</p>}
                    <button className="canteen-browse-btn">Browse Menu &rarr;</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Menu / Food List View
        <div className="menu-view animate-fade-in">
          {/* Back Navigation & Canteen Info Header */}
          <div className="menu-header">
            <button className="back-btn" onClick={() => setSelectedCanteen(null)}>&larr; Back to Canteens</button>
            <div className="menu-canteen-meta">
              <h2>{selectedCanteen.name} Menu</h2>
              <p className="menu-canteen-sub">📍 {selectedCanteen.address} | 🕒 {selectedCanteen.opening_hours}</p>
            </div>
          </div>

          {/* Quick Cart Floating Bar */}
          {activeCartSummary && (
            <div className="quick-cart-bar animate-slide-in" onClick={() => navigate('/cart')}>
              <div className="quick-cart-info">
                <span>🛒 <strong>My Cart:</strong> {activeCartSummary.totalItems} items ({activeCartSummary.totalQuantity} total qty)</span>
                <span className="quick-cart-subtotal">Subtotal: <strong>{formatCurrency(activeCartSummary.subtotal)}</strong></span>
              </div>
              <button className="quick-cart-btn">View Cart & Checkout &rarr;</button>
            </div>
          )}

          {/* Categories Tab Bar */}
          {categories.length > 1 && (
            <div className="categories-tab-bar">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`category-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {isLoadingFoods ? (
            <div className="student-loading" style={{ minHeight: '200px' }}>
              <div className="student-spinner"></div>
              <p>Loading menu items...</p>
            </div>
          ) : getFilteredFoods().length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">🍕</span>
              <h3>No Items Available</h3>
              <p>This category or canteen doesn't have any items available right now.</p>
            </div>
          ) : (
            <div className="foods-grid">
              {getFilteredFoods().map(food => (
                <div key={food.id} className="food-item-card">
                  <div className="food-item-image">
                    {food.image_url ? (
                      <img src={`http://localhost:5000${food.image_url}`} alt={food.name} />
                    ) : (
                      <span className="food-image-placeholder">🍔</span>
                    )}
                  </div>
                  <div className="food-item-body">
                    <div className="food-item-title-row">
                      <h3>{food.name}</h3>
                      <span className="food-item-category">{food.category_name}</span>
                    </div>
                    {food.description && <p className="food-item-desc">{food.description}</p>}
                    
                    <div className="food-item-price-stock">
                      <span className="food-item-price">{formatCurrency(food.price)}</span>
                      <span className="food-item-stock">Stock: <strong>{food.quantity} left</strong></span>
                    </div>

                    <div className="food-item-actions">
                      <div className="qty-picker">
                        <button 
                          onClick={() => handleQtyChange(food.id, -1, food.quantity)}
                          disabled={(quantities[food.id] || 1) <= 1}
                        >-</button>
                        <span className="qty-display">{quantities[food.id] || 1}</span>
                        <button 
                          onClick={() => handleQtyChange(food.id, 1, food.quantity)}
                          disabled={(quantities[food.id] || 1) >= food.quantity}
                        >+</button>
                      </div>
                      <button className="add-to-cart-btn" onClick={() => handleAddToCart(food)}>
                        Add To Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
