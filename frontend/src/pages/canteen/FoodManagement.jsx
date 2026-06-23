import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getFoodsByCanteen, getCategories, createFood, updateFood, toggleAvailability, uploadFoodImage, deleteFood } from '../../api/foodApi';
import { useNotification } from '../../hooks/useNotification';
import { getImageUrl } from '../../utils/helpers';
import './FoodManagement.css';


const FoodManagement = () => {
  const { showToast, confirm } = useNotification();
  const { canteen } = useOutletContext();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add'); // 'add' or 'edit'
  const [currentFood, setCurrentFood] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    quantity: '10',
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image upload state
  const fileInputRef = useRef(null);
  const [uploadingFoodId, setUploadingFoodId] = useState(null);

  const loadData = useCallback(async () => {
    if (!canteen) return;
    setIsLoading(true);
    try {
      const foodsRes = await getFoodsByCanteen(canteen.id);
      const catsRes = await getCategories();
      setFoods(foodsRes.data.data.foods || []);
      setCategories(catsRes.data.data.categories || []);
    } catch (error) {
      console.error('Failed to load menu data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [canteen]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAddModal = () => {
    setModalType('add');
    setFormData({
      name: '',
      description: '',
      categoryId: categories[0]?.id || '',
      price: '',
      quantity: '10',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEditModal = (food) => {
    setModalType('edit');
    setCurrentFood(food);
    setFormData({
      name: food.name,
      description: food.description || '',
      categoryId: food.category_id || '',
      price: food.price,
      quantity: food.quantity,
    });
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      description: formData.description,
      categoryId: Number(formData.categoryId),
      price: Number(formData.price),
      quantity: Number(formData.quantity),
    };

    try {
      if (modalType === 'add') {
        await createFood(canteen.id, payload);
        showToast('Food item created successfully.', 'success');
      } else {
        await updateFood(currentFood.id, payload);
        showToast('Food item updated successfully.', 'success');
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to save food item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      // Optimistic update
      setFoods(foods.map(f => f.id === id ? { ...f, status: f.status === 'available' ? 'unavailable' : 'available' } : f));
      await toggleAvailability(id);
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      // Revert if failed
      loadData();
    }
  };

  const handleDeleteFood = async (id) => {
    const isAccepted = await confirm('Delete Item', 'Are you sure you want to delete this food item?');
    if (!isAccepted) return;
    try {
      await deleteFood(id);
      showToast('Food item deleted successfully.', 'success');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete food item.', 'error');
    }
  };

  // Image Upload handlers
  const triggerImageUpload = (foodId) => {
    setUploadingFoodId(foodId);
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !uploadingFoodId) return;

    try {
      setIsLoading(true);
      await uploadFoodImage(uploadingFoodId, file);
      showToast('Image uploaded successfully.', 'success');
      loadData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Image upload failed.', 'error');
    } finally {
      setUploadingFoodId(null);
      setIsLoading(false);
      // Reset input value to allow triggering change on same file
      e.target.value = '';
    }
  };

  // Filter and search logic
  const filteredFoods = foods.filter((food) => {
    const matchesCategory = selectedCategory === 'all' || Number(food.category_id) === Number(selectedCategory);
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (food.description && food.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="food-page">
      {/* Hidden file input for logo uploads */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        onChange={handleFileChange}
      />

      <div className="food-header">
        <div className="food-title-section">
          <h2>Menu Management</h2>
          <p>Create, update, and toggle availability of your delicious dishes.</p>
        </div>
        <button className="btn-add-food" onClick={handleOpenAddModal}>
          <span className="btn-add-icon">+</span> Add New Food
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="food-filters-bar">
        <div className="search-box-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input-field"
            placeholder="Search menu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filter-select">
          <label>Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Grid */}
      {isLoading ? (
        <div className="menu-loading">
          <div className="spinner"></div>
          <p>Loading your menu...</p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="menu-empty-state">
          <span className="empty-emoji">🍲</span>
          <h3>No food items found</h3>
          <p>Try refining your search/filter, or add some new dishes to your menu.</p>
        </div>
      ) : (
        <div className="menu-grid">
          {filteredFoods.map((food) => (
            <div key={food.id} className={`food-card ${food.status === 'unavailable' ? 'food-unavailable' : ''}`}>
              <div className="food-card-image-box">
                {food.image_url ? (
                  <img src={getImageUrl(food.image_url)} alt={food.name} className="food-card-img" />
                ) : (
                  <div className="food-card-img-placeholder">🍲</div>
                )}
                <button 
                  className="food-img-upload-overlay"
                  onClick={() => triggerImageUpload(food.id)}
                  title="Upload Image"
                >
                  📷 Upload Image
                </button>
                <div className="food-card-cat-badge">
                  {categories.find(c => c.id === food.category_id)?.name || 'Food'}
                </div>
              </div>

              <div className="food-card-body">
                <div className="food-title-row">
                  <h4 className="food-card-title">{food.name}</h4>
                  <span className="food-card-price">{formatCurrency(food.price)}</span>
                </div>
                <p className="food-card-desc">{food.description || 'No description provided.'}</p>
                
                <div className="food-card-stock">
                  Stock quantity: <span className="stock-count">{food.quantity}</span>
                </div>

                <div className="food-card-controls">
                  <div className="availability-switch">
                    <span className="availability-label">Available</span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={food.status === 'available'}
                        onChange={() => handleToggleAvailability(food.id)}
                      />
                      <span className="slider round"></span>
                    </label>
                  </div>

                  <div className="food-action-buttons">
                    <button className="btn-edit-item" onClick={() => handleOpenEditModal(food)} title="Edit Item">
                      ✏️
                    </button>
                    <button className="btn-delete-item" onClick={() => handleDeleteFood(food.id)} title="Delete Item">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Food Modal */}
      {showModal && (
        <div className="modal-backdrop-custom">
          <div className="food-modal-card">
            <div className="food-modal-header">
              <h3>{modalType === 'add' ? 'Add New Food Item' : 'Edit Food Item'}</h3>
              <button className="btn-close-modal" onClick={() => setShowModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleFormSubmit} className="food-modal-form">
              {formError && <div className="food-form-error">{formError}</div>}

              <div className="form-group">
                <label htmlFor="food-name">Food Name *</label>
                <input
                  type="text"
                  id="food-name"
                  required
                  placeholder="e.g. Phở Bò Bách Khoa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="food-category">Category *</label>
                  <select
                    id="food-category"
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="food-price">Price (VND) *</label>
                  <input
                    type="number"
                    id="food-price"
                    required
                    min="1000"
                    placeholder="e.g. 35000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="food-quantity">Daily Stock Quantity</label>
                <input
                  type="number"
                  id="food-quantity"
                  min="0"
                  placeholder="e.g. 50"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="food-desc">Description</label>
                <textarea
                  id="food-desc"
                  rows="3"
                  placeholder="Tell customers about the ingredients, taste, size..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="food-modal-buttons">
                <button type="button" className="btn-secondary-custom" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary-custom" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodManagement;
