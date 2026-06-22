import React, { useState } from 'react';

const FoodForm = () => {
  const [foodData, setFoodData] = useState({ name: '', price: '', description: '' });
  const [imagePreview, setImagePreview] = useState(null);

  // Xử lý khi chọn file ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Tạo URL tạm thời để preview ảnh
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dữ liệu submit:", foodData);
    alert("Thêm món thành công (Mock)!");
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '500px' }}>
      <h3 style={{ marginBottom: '15px' }}>Thêm Món Ăn Mới</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tên món ăn</label>
          <input type="text" style={{ width: '100%', padding: '8px' }} required 
                 onChange={e => setFoodData({...foodData, name: e.target.value})} />
        </div>

        <div>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Giá tiền (VNĐ)</label>
          <input type="number" style={{ width: '100%', padding: '8px' }} required 
                 onChange={e => setFoodData({...foodData, price: e.target.value})} />
        </div>

        {/* Phần Upload Hình Ảnh */}
        <div style={{ border: '1px dashed #999', padding: '15px', textAlign: 'center', borderRadius: '4px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Hình ảnh món ăn</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />

          {/* Hiển thị Preview ảnh */}
          {imagePreview && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Xem trước:</p>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} />
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Lưu Món Ăn</button>
      </form>
    </div>
  );
};

export default FoodForm;