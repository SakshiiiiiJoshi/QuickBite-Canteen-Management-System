import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './components/CartContext';
import Navbar from './components/Navbar';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import OrderStatus from './pages/OrderStatus';
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import ManageFood from './pages/admin/ManageFood';
import ManageOrders from './pages/admin/ManageOrders';
import './index.css';

function App() {
  return (
    <CartProvider>
      <Router>
        <Navbar />
        <Routes>
          {/* Customer Routes */}
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment/:orderId" element={<Payment />} />
          <Route path="/order/:orderId" element={<OrderStatus />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Login />} />
          <Route path="/admin/dashboard" element={<Dashboard />}>
            <Route path="food" element={<ManageFood />} />
            <Route path="orders" element={<ManageOrders />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;
