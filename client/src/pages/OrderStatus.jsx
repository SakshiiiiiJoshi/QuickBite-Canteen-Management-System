import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { IoCheckmark, IoRestaurant, IoTime, IoBicycle, IoFastFood, IoQrCode } from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';

const STATUSES = ['Placed', 'Preparing', 'Ready', 'Delivered'];
const STATUS_ICONS = {
  Placed: <IoTime />,
  Preparing: <IoRestaurant />,
  Ready: <IoFastFood />,
  Delivered: <IoBicycle />,
};

const OrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrder(res.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading order status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <h2>Order not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const currentIndex = STATUSES.indexOf(order.status);

  return (
    <div className="page-container">
      <div className="order-status-container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1>📦 Order Status</h1>
          <p>Track your order in real-time</p>
        </div>

        <div className="status-card">
          <div className="status-order-id">
            Order ID: {orderId}
          </div>

          {/* Status Stepper */}
          <div className="status-stepper">
            {STATUSES.map((status, index) => (
              <div key={status} style={{ display: 'contents' }}>
                <div
                  className={`status-step ${
                    index < currentIndex
                      ? 'completed'
                      : index === currentIndex
                      ? 'active'
                      : ''
                  }`}
                >
                  <div className="status-step-icon">
                    {index < currentIndex ? (
                      <IoCheckmark />
                    ) : (
                      STATUS_ICONS[status]
                    )}
                  </div>
                  <span className="status-step-label">{status}</span>
                </div>
                {index < STATUSES.length - 1 && (
                  <div
                    className={`status-connector ${
                      index < currentIndex ? 'completed' : ''
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Order Info */}
          <div className="status-info">
            <div className="status-info-item">
              <label>Customer</label>
              <p>{order.customerName}</p>
            </div>
            <div className="status-info-item">
              <label>Table</label>
              <p>#{order.tableNumber}</p>
            </div>
            <div className="status-info-item">
              <label>Total Amount</label>
              <p style={{ color: 'var(--primary-400)' }}>₹{order.totalAmount}</p>
            </div>
            <div className="status-info-item">
              <label>Payment</label>
              <p>
                <span className={`badge ${order.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}`}>
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Items */}
          <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>
              Order Items
            </h3>
            {order.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: i < order.items.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  fontSize: '0.9rem',
                }}
              >
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--primary-400)' }}>
                  ₹{item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order QR Code */}
        <div className="status-card" style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <IoQrCode /> Share Order
          </h3>
          <QRCodeDisplay
            value={`${window.location.origin}/order/${orderId}`}
            size={150}
            title="Scan to track this order"
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Share this QR with others to let them track this order
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/menu')}>
            🍽️ Order More Food
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
