import { useState, useEffect } from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import {
  IoFastFood,
  IoReceipt,
  IoStatsChart,
  IoLogOut,
  IoQrCode,
  IoTrendingUp,
  IoTime,
  IoCheckmarkCircle,
  IoAlertCircle,
} from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  const token = localStorage.getItem('canteen_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [ordersRes, foodsRes] = await Promise.all([
        axios.get(`${API_URL}/orders`, config),
        axios.get(`${API_URL}/foods`),
      ]);
      setOrders(ordersRes.data);
      setFoods(foodsRes.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('canteen_admin_token');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('canteen_admin_token');
    localStorage.removeItem('canteen_admin_user');
    navigate('/admin');
  };

  const isActive = (path) => location.pathname === path;

  // Stats
  const today = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );
  const pendingOrders = orders.filter(
    (o) => o.status === 'Placed' || o.status === 'Preparing'
  );
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const isDashboardHome =
    location.pathname === '/admin/dashboard';

  // Generate menu QR URL
  const menuUrl = `${window.location.origin}/menu`;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
            ⚙️ Admin Panel
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            QuickBite Canteen
          </p>
        </div>

        <Link
          to="/admin/dashboard"
          className={`admin-sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}
        >
          <IoStatsChart /> Dashboard
        </Link>
        <Link
          to="/admin/dashboard/food"
          className={`admin-sidebar-link ${isActive('/admin/dashboard/food') ? 'active' : ''}`}
        >
          <IoFastFood /> Manage Food
        </Link>
        <Link
          to="/admin/dashboard/orders"
          className={`admin-sidebar-link ${isActive('/admin/dashboard/orders') ? 'active' : ''}`}
        >
          <IoReceipt /> Manage Orders
        </Link>

        <button
          className="admin-sidebar-link"
          onClick={() => setShowQR(!showQR)}
        >
          <IoQrCode /> Menu QR Code
        </button>

        <div style={{ flex: 1 }} />

        <button className="admin-sidebar-link" onClick={handleLogout}>
          <IoLogOut /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="admin-content">
        {isDashboardHome ? (
          <>
            <div className="page-header">
              <h1>📊 Dashboard</h1>
              <p>Welcome back! Here's your canteen overview.</p>
            </div>

            {loading ? (
              <div className="loading-center">
                <div className="spinner"></div>
              </div>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-card-icon orange">
                      <IoReceipt />
                    </div>
                    <div className="stat-card-value">{todayOrders.length}</div>
                    <div className="stat-card-label">Orders Today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon yellow">
                      <IoAlertCircle />
                    </div>
                    <div className="stat-card-value">{pendingOrders.length}</div>
                    <div className="stat-card-label">Pending Orders</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon green">
                      <IoTrendingUp />
                    </div>
                    <div className="stat-card-value">₹{todayRevenue}</div>
                    <div className="stat-card-label">Revenue Today</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-card-icon blue">
                      <IoFastFood />
                    </div>
                    <div className="stat-card-value">{foods.length}</div>
                    <div className="stat-card-label">Menu Items</div>
                  </div>
                </div>

                {/* Quick Actions */}
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                  Quick Actions
                </h2>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <Link to="/admin/dashboard/food" className="btn btn-primary">
                    <IoFastFood /> Manage Food
                  </Link>
                  <Link to="/admin/dashboard/orders" className="btn btn-secondary">
                    <IoReceipt /> View Orders
                  </Link>
                  <button className="btn btn-secondary" onClick={() => setShowQR(true)}>
                    <IoQrCode /> Generate QR
                  </button>
                </div>

                {/* Recent Orders */}
                {orders.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                      Recent Orders
                    </h2>
                    <div className="admin-table-wrapper">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Table</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order._id}>
                              <td style={{ fontWeight: 600 }}>{order.customerName}</td>
                              <td>#{order.tableNumber}</td>
                              <td style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
                                ₹{order.totalAmount}
                              </td>
                              <td>
                                <span className={`badge badge-${order.status.toLowerCase()}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                                  {order.paymentStatus}
                                </span>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <Outlet />
        )}

        {/* QR Modal */}
        {showQR && (
          <div className="modal-overlay" onClick={() => setShowQR(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>📱 Menu QR Code</h2>
                <button className="modal-close" onClick={() => setShowQR(false)}>
                  ✕
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Print this QR code and place it on tables. Customers can scan to view the menu directly on their phones.
              </p>
              <QRCodeDisplay
                value={menuUrl}
                size={250}
                title="Scan to view menu"
              />
              <p style={{
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
              }}>
                {menuUrl}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
