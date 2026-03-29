import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext.jsx';

// Customer screens
import CustomerLayout from './customer/CustomerLayout.jsx';
import Dashboard from './customer/Dashboard.jsx';
import Menu from './customer/Menu.jsx';
import OrderConfirmation from './customer/OrderConfirmation.jsx';
import OrderTracking from './customer/OrderTracking.jsx';
import CustomerProfile from './customer/CustomerProfile.jsx';
import CustomerOrderHistory from './customer/CustomerOrderHistory.jsx';
import AboutQuickBite from './customer/AboutQuickBite.jsx';

// Vendor screens
import VendorLayout from './vendor/VendorLayout.jsx';
import LiveDashboard from './vendor/LiveDashboard.jsx';
import VendorOrders from './vendor/VendorOrders.jsx';
import MenuManagement from './vendor/MenuManagement.jsx';
import VendorProfile from './vendor/VendorProfile.jsx';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/customer/home" replace />} />

          {/* Customer routes — has persistent bottom nav */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route path="home" element={<Dashboard />} />
            <Route path="orders" element={<OrderTracking />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Customer flow routes — full-screen, no bottom nav from layout */}
          <Route path="/customer/menu/:shopId" element={<Menu />} />
          <Route path="/customer/confirm/:shopId/:itemId" element={<OrderConfirmation />} />
          <Route path="/customer/track/:orderId" element={<OrderTracking />} />
          <Route path="/orders/history" element={<CustomerOrderHistory />} />
          <Route path="/about" element={<AboutQuickBite />} />

          {/* Vendor default redirect */}
          <Route path="/vendor" element={<Navigate to="/vendor/kitchen-kukkries/live" replace />} />

          {/* Vendor routes — has persistent vendor bottom nav */}
          <Route path="/vendor/:shopId" element={<VendorLayout />}>
            <Route path="live" element={<LiveDashboard />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="profile" element={<VendorProfile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/customer/home" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
