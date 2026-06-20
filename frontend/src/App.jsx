import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OtpVerificationPage from './pages/OtpVerificationPage';
import HomePage from './pages/HomePage';
import ProtectedRoute from './components/ProtectedRoute';
import CanteenLayout from './layouts/CanteenLayout';
import Dashboard from './pages/canteen/Dashboard';
import FoodManagement from './pages/canteen/FoodManagement';
import OrderManagement from './pages/canteen/OrderManagement';
import StoreSettings from './pages/canteen/StoreSettings';

// Student Pages
import Home from './pages/student/Home';
import Cart from './pages/student/Cart';
import Orders from './pages/student/Orders';
import OrderDetail from './pages/student/OrderDetail';
import Profile from './pages/student/Profile';

// Context Providers
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <CartProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-otp" element={<OtpVerificationPage />} />

        {/* Protected Dashboard/Home Routing */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Student Portal Pages */}
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Canteen Partner Portal Routes */}
        <Route
          path="/canteen"
          element={
            <ProtectedRoute>
              <CanteenLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/canteen/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="menu" element={<FoodManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="settings" element={<StoreSettings />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
