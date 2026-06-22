import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Canteens from './pages/Canteens';
import CanteenDetail from './pages/CanteenDetail';
import MenuManager from './pages/MenuManager'; // 1. Import trang quản lý

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="canteens" element={<Canteens />} />
          <Route path="canteens/:id" element={<CanteenDetail />} />
          
          {/* 2. Thêm route quản lý thực đơn */}
          <Route path="manage-menu" element={<MenuManager />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;