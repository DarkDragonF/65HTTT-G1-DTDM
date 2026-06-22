import React, { useState } from 'react';
import CanteenCard from '../components/CanteenCard';
import { mockCanteens } from '../services/mockData';

const Canteens = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc danh sách dựa trên từ khóa tìm kiếm
  const filteredCanteens = mockCanteens.filter(canteen => 
    canteen.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Danh sách Canteen TLU</h2>
        <input 
          type="text" 
          placeholder="Tìm kiếm gian hàng..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '10px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {filteredCanteens.length > 0 ? (
          filteredCanteens.map(canteen => (
            <CanteenCard key={canteen.id} canteen={canteen} />
          ))
        ) : (
          <p>Không tìm thấy gian hàng nào phù hợp.</p>
        )}
      </div>
    </div>
  );
};

export default Canteens;