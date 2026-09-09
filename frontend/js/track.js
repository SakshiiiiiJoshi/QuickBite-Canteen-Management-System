/* track.js — Track order page logic */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('track');

  // Show latest order shortcut if one exists in localStorage
  const lastId = localStorage.getItem(LAST_ORDER_KEY);
  if (lastId) {
    const recentSection = document.getElementById('track-recent');
    const displayEl = document.getElementById('recent-order-id-display');
    const linkEl = document.getElementById('recent-order-link');

    if (recentSection && displayEl && linkEl) {
      recentSection.style.display = 'block';
      displayEl.textContent = `Order #${lastId}`;
      linkEl.href = `/order.html?orderId=${lastId}`;
    }

    // Pre-fill the input too
    const input = document.getElementById('order-id-input');
    if (input) input.value = lastId;
  }

  // Allow pressing Enter in the input
  const input = document.getElementById('order-id-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') trackOrder();
    });
  }
});

async function trackOrder() {
  const input = document.getElementById('order-id-input');
  const errorEl = document.getElementById('track-error');
  const orderId = input ? input.value.trim() : '';

  if (!orderId || parseInt(orderId) < 1) {
    errorEl.innerHTML = '<div class="alert alert-error">Please enter a valid Order ID</div>';
    return;
  }

  errorEl.innerHTML = '';

  try {
    // Validate the order exists before navigating
    await apiFetch(`/orders/${orderId}`);
    window.location.href = `/order.html?orderId=${orderId}`;
  } catch {
    errorEl.innerHTML = `<div class="alert alert-error">No order found with ID #${orderId}. Please check and try again.</div>`;
  }
}
