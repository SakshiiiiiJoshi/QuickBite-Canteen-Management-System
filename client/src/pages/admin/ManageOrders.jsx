import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { IoRefresh } from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';

const STATUSES = ['All', 'Placed', 'Preparing', 'Ready', 'Delivered'];

const ManageOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const token = localStorage.getItem('canteen_admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }
    fetchOrders();
    // Auto-refresh every 15s
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/orders`, config);
      setOrders(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('canteen_admin_token');
        navigate('/admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/orders/${orderId}/status`, { status: newStatus }, config);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredOrders =
    filterStatus === 'All'
      ? orders
      : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📋 Manage Orders</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {orders.length} total orders • Auto-refreshes every 15s
          </p>
        </div>
        <button className="btn btn-secondary" onClick={fetchOrders}>
          <IoRefresh /> Refresh
        </button>
      </div>

      {/* Status Filter */}
      <div className="category-filter">
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`category-chip ${filterStatus === status ? 'active' : ''}`}
            onClick={() => setFilterStatus(status)}
          >
            {status}
            {status !== 'All' && (
              <span style={{ marginLeft: '0.35rem', opacity: 0.7 }}>
                ({orders.filter((o) => o.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <h2>No orders found</h2>
          <p>
            {filterStatus === 'All'
              ? 'Orders will appear here once customers place them.'
              : `No orders with status "${filterStatus}".`}
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Time</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Table #{order.tableNumber}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      {order.items.map((item, i) => (
                        <div key={i}>
                          {item.name} × {item.quantity}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary-400)' }}>
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
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div>{new Date(order.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td>
                    <select
                      className="form-input"
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.85rem',
                        minWidth: '130px',
                      }}
                    >
                      <option value="Placed">Placed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
