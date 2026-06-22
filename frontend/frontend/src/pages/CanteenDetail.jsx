import React from 'react';
import { useParams } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { mockCanteens, mockFoods } from '../services/mockData';

const CanteenDetail = () => {
  const { id } = useParams(); // Lấy ID từ URL

  // Tìm canteen theo ID
  const canteen = mockCanteens.find(c => c.id === parseInt(id));
  // Lọc món ăn thuộc canteen này
  const menu = mockFoods.filter(f => f.canteen_id === parseInt(id));

  if (!canteen) return <h2>Không tìm thấy gian hàng!</h2>;

  return (
    <div>
      <div style={{ backgroundColor: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2 style={{ color: '#e65100' }}>{canteen.name}</h2>
        <p>{canteen.address} - {canteen.description}</p>
      </div>

      <h3>Thực đơn ({menu.length} món)</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '15px' }}>
        {menu.length > 0 ? (
          menu.map(food => <FoodCard key={food.id} food={food} />)
        ) : (
          <p>Gian hàng này chưa có món ăn nào.</p>
        )}
      </div>
    </div>
  );
};

export default CanteenDetail;