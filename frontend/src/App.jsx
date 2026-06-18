import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OtpVerificationPage from './pages/OtpVerificationPage'
import HomePage from './pages/HomePage'
import ProtectedRoute from './components/ProtectedRoute'
import CanteenLayout from './layouts/CanteenLayout'
import Dashboard from './pages/canteen/Dashboard'
import FoodManagement from './pages/canteen/FoodManagement'
import OrderManagement from './pages/canteen/OrderManagement'
import StoreSettings from './pages/canteen/StoreSettings'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
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
  )
}

export default App
