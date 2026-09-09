/* order.js — Order status page logic */

const STATUSES = ['Placed', 'Preparing', 'Ready', 'Delivered'];
const STATUS_ICONS = {
  Placed: '⏳',
  Preparing: '🍳',
  Ready: '🍔',
  Delivered: '🚴',
};

let currentOrder = null;
let pollInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('order');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  if (orderId) {
    fetchOrder(orderId);
    pollInterval = setInterval(() => fetchOrder(orderId), 10000);
  } else {
    showNotFound();
  }
});

async function fetchOrder(orderId) {
  try {
    currentOrder = await apiFetch(`/orders/${orderId}`);
    renderOrderStatus(orderId);
  } catch {
    showNotFound();
    if (pollInterval) clearInterval(pollInterval);
  }
}

function showNotFound() {
  document.getElementById('order-content').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">❌</div>
      <h2>Order not found</h2>
      <a href="/menu.html" class="btn btn-primary">Back to Menu</a>
    </div>`;
}

function renderOrderStatus(orderId) {
  const order = currentOrder;
  const currentIndex = STATUSES.indexOf(order.status);
  const trackUrl = `${window.location.origin}/order.html?orderId=${orderId}`;

  // Build stepper
  let stepperHTML = '';
  STATUSES.forEach((status, index) => {
    const cls = index < currentIndex ? 'completed' : index === currentIndex ? 'active' : '';
    const icon = index < currentIndex ? '✓' : STATUS_ICONS[status];

    stepperHTML += `
      <div class="status-step ${cls}">
        <div class="status-step-icon">${icon}</div>
        <span class="status-step-label">${status}</span>
      </div>`;

    if (index < STATUSES.length - 1) {
      stepperHTML += `<div class="status-connector ${index < currentIndex ? 'completed' : ''}"></div>`;
    }
  });

  document.getElementById('order-content').innerHTML = `
    <div class="order-status-container">
      <div class="page-header" style="text-align:center">
        <h1>📦 Order Status</h1>
        <p>Track your order in real-time</p>
      </div>

      <div class="status-card">
        <div class="status-order-id">Order ID: ${orderId}</div>

        <div class="status-stepper">
          ${stepperHTML}
        </div>

        <div class="status-info">
          <div class="status-info-item">
            <label>Customer</label>
            <p>${order.customerName}</p>
          </div>
          <div class="status-info-item">
            <label>Table</label>
            <p>#${order.tableNumber}</p>
          </div>
          <div class="status-info-item">
            <label>Total Amount</label>
            <p style="color:var(--primary-400)">₹${order.totalAmount}</p>
          </div>
          <div class="status-info-item">
            <label>Payment</label>
            <p>
              <span class="badge ${order.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}">
                ${order.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        <!-- Items -->
        <div style="margin-top:1.5rem;text-align:left">
          <h3 style="font-size:0.9rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:0.75rem">
            Order Items
          </h3>
          ${order.items.map((item, i) => `
            <div style="display:flex;justify-content:space-between;padding:0.5rem 0;
                        border-bottom:${i < order.items.length - 1 ? '1px solid var(--border-subtle)' : 'none'};
                        font-size:0.9rem">
              <span>${item.name} × ${item.quantity}</span>
              <span style="font-weight:600;color:var(--primary-400)">₹${item.price * item.quantity}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- QR Code -->
      <div class="status-card" style="margin-top:1.25rem;text-align:center">
        <h3 style="font-size:0.9rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;gap:0.5rem">
          📱 Share Order
        </h3>
        <div class="qr-display">
          <p style="margin-bottom:1rem;color:var(--text-secondary);font-weight:600">
            Scan to track this order
          </p>
          <div class="payment-qr">
            <div id="share-qr-div" style="background:#fff;padding:8px;border-radius:6px;display:inline-block"></div>
          </div>
        </div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem">
          Share this QR with others to let them track this order
        </p>
      </div>

      <div style="text-align:center;margin-top:1.5rem">
        <a href="/menu.html" class="btn btn-secondary">🍽️ Order More Food</a>
      </div>
    </div>`;

  // Generate share QR using qrcodejs
  const el = document.getElementById('share-qr-div');
  if (el && typeof QRCode !== 'undefined') {
    el.innerHTML = '';
    new QRCode(el, {
      text: trackUrl,
      width: 150,
      height: 150,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
}
