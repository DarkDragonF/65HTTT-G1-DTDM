import React from 'react';
import CanteenCard from '../components/CanteenCard';
import { mockCanteens } from '../services/mockData';

const Home = () => {
  // Lấy 3 gian hàng đầu tiên làm nổi bật
  const featuredCanteens = mockCanteens.slice(0, 3); 

  return (
    <div className="home-page">
      {/* ... (Giữ nguyên phần Hero Banner) ... */}
      <section className="hero-banner">
         {/* ... */}
      </section>

      <section className="canteen-section">
        <h3 style={{ marginBottom: '20px' }}>Gian Hàng Nổi Bật</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {featuredCanteens.map(canteen => (
            <CanteenCard key={canteen.id} canteen={canteen} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;