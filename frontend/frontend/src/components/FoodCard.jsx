import React from 'react';

const FoodCard = ({ food }) => {
  return (
    <div style={{ border: '1px solid #eee', borderRadius: '8px', padding: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
      <div style={{ width: '80px', height: '80px', backgroundColor: '#ddd', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px', color: '#666' }}>
        [Ảnh món]
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ color: '#333', marginBottom: '5px' }}>{food.name}</h4>
        <p style={{ fontSize: '13px', color: '#777', marginBottom: '5px' }}>{food.description}</p>
        <p style={{ fontWeight: 'bold', color: '#d32f2f' }}>{food.price.toLocaleString()} VNĐ</p>
      </div>
    </div>
  );
};

export default FoodCard;