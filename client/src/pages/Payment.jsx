import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { IoCheckmarkCircle, IoArrowForward } from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';

const Payment = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (!order) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${orderId}`);
      setOrder(res.data);
      if (res.data.paymentStatus === 'Paid') {
        setPaid(true);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentDone = async () => {
    setPaying(true);
    try {
      await axios.put(`${API_URL}/orders/${orderId}/pay`);
      setPaid(true);
    } catch (error) {
      console.error('Error marking payment:', error);
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-center">
          <div className="spinner"></div>
          <p>Loading order...</p>
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

  // After payment confirmed
  if (paid) {
    const orderTrackingUrl = `${window.location.origin}/order/${orderId}`;

    return (
      <div className="page-container">
        <div className="payment-container">
          <div className="payment-card">
            <div className="order-confirmed">
              <div className="checkmark-circle">
                <IoCheckmarkCircle />
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Order Confirmed! 🎉
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1.05rem' }}>
                Your payment of <strong style={{ color: 'var(--primary-400)' }}>₹{order.totalAmount}</strong> has been received.
                <br />Your food is being prepared!
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <QRCodeDisplay
                  value={orderTrackingUrl}
                  size={160}
                  title="📱 Scan to track your order"
                />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Save this QR to check your order status anytime
                </p>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(`/order/${orderId}`)}
              >
                Track Your Order <IoArrowForward />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // UPI Payment QR
  const upiUrl = `upi://pay?pa=canteen@upi&pn=QuickBite%20Canteen&am=${order.totalAmount}&cu=INR&tn=Order%20${orderId}`;

  return (
    <div className="page-container">
      <div className="payment-container">
        <div className="page-header" style={{ textAlign: 'center' }}>
          <h1>💳 Payment</h1>
          <p>Scan the QR code to pay</p>
        </div>

        <div className="payment-card">
          <div className="payment-amount">{order.totalAmount}</div>

          <QRCodeDisplay
            value={upiUrl}
            size={220}
            title="Scan with any UPI app"
          />

          <p className="payment-instructions">
            Open your UPI app (GPay, PhonePe, Paytm, etc.),
            scan the QR code above, and complete the payment.
          </p>

          <div className="payment-divider">or</div>

          <button
            className="btn btn-success btn-lg"
            onClick={handlePaymentDone}
            disabled={paying}
            style={{ width: '100%' }}
          >
            {paying ? 'Processing...' : "✅ I've Completed the Payment"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
