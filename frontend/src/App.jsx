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
import CustomerSupport from './pages/student/CustomerSupport';
import Feedback from './pages/student/Feedback';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Canteens from './pages/admin/Canteens';
import AdminSupport from './pages/admin/AdminSupport';
import Reports from './pages/admin/Reports';

// Delivery Pages
import DeliveryLayout from './layouts/DeliveryLayout';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryProfile from './pages/delivery/DeliveryProfile';

// Context Providers
import { CartProvider } from './contexts/CartContext';
import { useSalesIQ } from './hooks/useSalesIQ';

function App() {
  useSalesIQ();
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
          path="/support"
          element={
            <ProtectedRoute>
              <CustomerSupport />
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

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <Feedback />
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

        {/* Administration Portal Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="canteens" element={<Canteens />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Delivery Rider Workspace Routes */}
        <Route
          path="/delivery"
          element={
            <ProtectedRoute>
              <DeliveryLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/delivery/dashboard" replace />} />
          <Route path="dashboard" element={<DeliveryDashboard />} />
          <Route path="profile" element={<DeliveryProfile />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}

export default App;
