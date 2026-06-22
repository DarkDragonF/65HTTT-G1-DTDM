import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header'; // Import Header

const MainLayout = () => {
  return (
    <div>
      <Header /> {/* Sử dụng Component Header */}

      <main style={{ minHeight: '80vh', padding: '20px' }}>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '20px', background: '#333', color: 'white' }}>
         © 2026 TLU FOOD.
      </footer>
    </div>
  );
};

export default MainLayout;