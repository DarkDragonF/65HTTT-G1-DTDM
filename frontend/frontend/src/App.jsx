import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Canteens from './pages/Canteens'; // Import trang Canteens
import CanteenDetail from './pages/CanteenDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="canteens" element={<Canteens />} /> {/* Thêm route này */}
          <Route path="canteens/:id" element={<CanteenDetail />} /> {/* Thêm dòng này */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;