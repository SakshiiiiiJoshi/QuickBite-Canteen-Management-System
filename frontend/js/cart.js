/* cart.js — Cart page logic */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('cart');
  renderCart();
});

function renderCart() {
  const items = Cart.getItems();
  const container = document.getElementById('cart-content');

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some delicious food from our menu!</p>
        <a href="/menu.html" class="btn btn-primary">🍽️ Browse Menu</a>
      </div>`;
    return;
  }

  const total = Cart.getTotal();

  container.innerHTML = `
    <div class="cart-container">
      <div class="page-header">
        <h1>🛒 Your Cart</h1>
        <p>${items.length} item${items.length > 1 ? 's' : ''} in your cart</p>
      </div>

      <div id="cart-error"></div>

      <!-- Cart Items -->
      ${items.map(item => `
        <div class="cart-item">
          <img src="${item.image || PLACEHOLDER_IMAGE}" alt="${item.name}"
               class="cart-item-image" onerror="handleImgError(this)" />
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">₹${item.price} each</div>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity - 1})">−</button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, ${item.quantity + 1})">+</button>
          </div>
          <span class="cart-item-total">₹${item.price * item.quantity}</span>
          <button class="cart-item-remove" onclick="removeItem(${item.id})" title="Remove item">🗑️</button>
        </div>
      `).join('')}

      <!-- Summary -->
      <div class="cart-summary">
        <div class="cart-summary-row">
          <span>Subtotal</span>
          <span>₹${total}</span>
        </div>
        <div class="cart-summary-row total">
          <span>Total</span>
          <span>₹${total}</span>
        </div>

        <div class="cart-form">
          <div class="form-group" style="margin-bottom:0">
            <label>Your Name</label>
            <input type="text" class="form-input" placeholder="Enter your name"
                   id="customer-name" />
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>Table Number</label>
            <input type="number" class="form-input" placeholder="e.g., 5"
                   id="table-number" min="1" />
          </div>
        </div>

        <div class="cart-actions">
          <button class="btn btn-secondary" onclick="clearCart()">Clear Cart</button>
          <button class="btn btn-primary btn-lg" id="place-order-btn" onclick="placeOrder()">
            Place Order →
          </button>
        </div>
      </div>
    </div>`;
}

function changeQty(foodId, newQty) {
  Cart.updateQuantity(foodId, newQty);
  renderNavbar('cart');
  renderCart();
}

function removeItem(foodId) {
  Cart.removeItem(foodId);
  renderNavbar('cart');
  renderCart();
}

function clearCartAction() {
  Cart.clear();
  renderNavbar('cart');
  renderCart();
}

// Alias for onclick
function clearCart() {
  clearCartAction();
}

async function placeOrder() {
  const nameEl = document.getElementById('customer-name');
  const tableEl = document.getElementById('table-number');
  const errorEl = document.getElementById('cart-error');
  const btn = document.getElementById('place-order-btn');

  const customerName = nameEl ? nameEl.value.trim() : '';
  const tableNumber = tableEl ? tableEl.value : '';

  if (!customerName) {
    errorEl.innerHTML = '<div class="alert alert-error">Please enter your name</div>';
    return;
  }
  if (!tableNumber || parseInt(tableNumber) < 1) {
    errorEl.innerHTML = '<div class="alert alert-error">Please enter a valid table number</div>';
    return;
  }

  errorEl.innerHTML = '';
  btn.disabled = true;
  btn.textContent = 'Placing Order...';

  try {
    const items = Cart.getItems();
    const orderData = {
      items: items.map(i => ({
        food: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount: Cart.getTotal(),
      customerName,
      tableNumber: parseInt(tableNumber),
    };

    const order = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    Cart.clear();
    localStorage.setItem(LAST_ORDER_KEY, order.id);
    window.location.href = `/payment.html?orderId=${order.id}`;
  } catch (err) {
    errorEl.innerHTML = `<div class="alert alert-error">${err.message || 'Failed to place order'}</div>`;
    btn.disabled = false;
    btn.textContent = 'Place Order →';
  }
}
