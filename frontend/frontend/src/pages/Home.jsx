import React from 'react';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <div className="hero-content">
          <h2>TLU FOOD - Đặt Món Dễ Dàng, Giao Hàng Tận Nơi</h2>
          <p>Khám phá thực đơn đa dạng từ các canteen trong trường Đại học.</p>
          <button className="btn-primary">Xem Gian Hàng Ngay</button>
        </div>
      </section>

      {/* Phần dành cho Danh sách gian hàng sau này */}
      <section className="canteen-section">
        <h3>Gian Hàng Nổi Bật</h3>
        <p>--- Danh sách gian hàng sẽ hiển thị ở đây ---</p>
      </section>
    </div>
  );
};

export default Home;