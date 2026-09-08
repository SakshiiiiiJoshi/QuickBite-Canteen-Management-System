import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import axios from 'axios';
import { IoAdd, IoRemove, IoTrash, IoArrowForward, IoRestaurant } from 'react-icons/io5';

const API_URL = 'http://localhost:5000/api';
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getTotal } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const total = getTotal();

  const handlePlaceOrder = async () => {
    if (!customerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!tableNumber || parseInt(tableNumber) < 1) {
      setError('Please enter a valid table number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: cartItems.map((item) => ({
          food: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: total,
        customerName: customerName.trim(),
        tableNumber: parseInt(tableNumber),
      };

      const res = await axios.post(`${API_URL}/orders`, orderData);
      clearCart();
      navigate(`/payment/${res.data._id}`, {
        state: { order: res.data },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious food from our menu!</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>
            <IoRestaurant /> Browse Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="cart-container">
        <div className="page-header">
          <h1>🛒 Your Cart</h1>
          <p>{cartItems.length} item{cartItems.length > 1 ? 's' : ''} in your cart</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Cart Items */}
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item">
            <img
              src={item.image || PLACEHOLDER_IMAGE}
              alt={item.name}
              className="cart-item-image"
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
            />
            <div className="cart-item-info">
              <div className="cart-item-name">{item.name}</div>
              <div className="cart-item-price">₹{item.price} each</div>
            </div>
            <div className="cart-item-controls">
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item._id, item.quantity - 1)}
              >
                <IoRemove />
              </button>
              <span className="cart-item-qty">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => updateQuantity(item._id, item.quantity + 1)}
              >
                <IoAdd />
              </button>
            </div>
            <span className="cart-item-total">₹{item.price * item.quantity}</span>
            <button
              className="cart-item-remove"
              onClick={() => removeFromCart(item._id)}
              title="Remove item"
            >
              <IoTrash />
            </button>
          </div>
        ))}

        {/* Summary */}
        <div className="cart-summary">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span>₹{total}</span>
          </div>
          <div className="cart-summary-row total">
            <span>Total</span>
            <span>₹{total}</span>
          </div>

          {/* Customer Info */}
          <div className="cart-form">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Your Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                id="customer-name"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Table Number</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g., 5"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                min="1"
                id="table-number"
              />
            </div>
          </div>

          <div className="cart-actions">
            <button className="btn btn-secondary" onClick={clearCart}>
              Clear Cart
            </button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
              <IoArrowForward />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
