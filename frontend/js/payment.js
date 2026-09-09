/* payment.js — Payment page logic */

let currentOrder = null;

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('payment');
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get('orderId');
  if (orderId) {
    fetchOrder(orderId);
  } else {
    showNotFound();
  }
});

async function fetchOrder(orderId) {
  try {
    currentOrder = await apiFetch(`/orders/${orderId}`);
    if (currentOrder.paymentStatus === 'Paid') {
      // Already paid — go straight to tracking
      window.location.href = `/order.html?orderId=${orderId}`;
    } else {
      renderPayment(orderId);
    }
  } catch {
    showNotFound();
  }
}

function showNotFound() {
  document.getElementById('payment-content').innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">&#10060;</div>
      <h2>Order not found</h2>
      <a href="/menu.html" class="btn btn-primary">Back to Menu</a>
    </div>`;
}

function renderPayment(orderId) {
  const upiUrl = `upi://pay?pa=canteen@upi&pn=QuickBite%20Canteen&am=${currentOrder.totalAmount}&cu=INR&tn=Order%20${orderId}`;

  document.getElementById('payment-content').innerHTML = `
    <div class="payment-container">
      <div class="page-header" style="text-align:center">
        <h1>Payment</h1>
        <p>Scan the QR code to pay for your order</p>
      </div>

      <div class="payment-card">
        <div class="payment-amount">&#8377;${currentOrder.totalAmount}</div>

        <div class="qr-display">
          <p style="margin-bottom:1rem;color:var(--text-secondary);font-weight:600">
            Scan with any UPI app
          </p>
          <div class="payment-qr">
            <div id="upi-qr-div" style="background:#fff;padding:8px;border-radius:6px;display:inline-block"></div>
          </div>
        </div>

        <p class="payment-instructions">
          Open your UPI app (GPay, PhonePe, Paytm, etc.),
          scan the QR code above, and complete the payment.
        </p>

        <div class="payment-divider">or</div>

        <button class="btn btn-success btn-lg" id="pay-done-btn"
                onclick="markPaymentDone('${orderId}')" style="width:100%">
          I have Completed the Payment
        </button>
      </div>
    </div>`;

  // Generate UPI QR using qrcodejs
  const el = document.getElementById('upi-qr-div');
  if (el && typeof QRCode !== 'undefined') {
    new QRCode(el, {
      text: upiUrl,
      width: 220,
      height: 220,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });
  }
}

async function markPaymentDone(orderId) {
  const btn = document.getElementById('pay-done-btn');
  btn.disabled = true;
  btn.textContent = 'Processing...';

  try {
    await apiFetch(`/orders/${orderId}/pay`, { method: 'PUT' });
    // Redirect directly to order tracking page
    window.location.href = `/order.html?orderId=${orderId}`;
  } catch {
    btn.disabled = false;
    btn.textContent = 'I have Completed the Payment';
  }
}
