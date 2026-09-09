/* admin.js — Admin dashboard logic */

let allOrders = [];
let allFoods = [];
let currentSection = 'dashboard';
let editingFoodId = null;
let orderPollInterval = null;

const FOOD_IMAGES = {
  Starters: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400&h=300&fit=crop',
  'Main Course': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop',
  Desserts: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=300&fit=crop',
  Snacks: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
};

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('admin-dashboard');

  if (!Auth.isLoggedIn()) {
    window.location.href = '/admin/login.html';
    return;
  }

  fetchAllData();

  document.getElementById('food-form').addEventListener('submit', handleFoodSave);
});

async function fetchAllData() {
  try {
    const [orders, foods] = await Promise.all([
      apiFetch('/orders', { headers: Auth.authHeaders() }),
      apiFetch('/foods'),
    ]);
    allOrders = orders;
    allFoods = foods;
    showSection('dashboard');
  } catch (err) {
    if (err.status === 401) {
      Auth.logout();
      window.location.href = '/admin/login.html';
    }
  }
}

/* ── Section Switching ────────────────────────────────────────────────── */
function showSection(section) {
  currentSection = section;

  // Update sidebar active state
  document.querySelectorAll('.admin-sidebar-link').forEach(link => {
    link.classList.remove('active');
  });
  const links = document.querySelectorAll('.admin-sidebar-link');
  if (section === 'dashboard') links[0]?.classList.add('active');
  else if (section === 'food') links[1]?.classList.add('active');
  else if (section === 'orders') links[2]?.classList.add('active');

  // Clear order polling
  if (orderPollInterval) {
    clearInterval(orderPollInterval);
    orderPollInterval = null;
  }

  if (section === 'dashboard') renderDashboard();
  else if (section === 'food') renderManageFood();
  else if (section === 'orders') {
    renderManageOrders();
    orderPollInterval = setInterval(refreshOrders, 15000);
  }
}

/* ── Dashboard ────────────────────────────────────────────────────────── */
function renderDashboard() {
  const today = new Date().toDateString();
  const todayOrders = allOrders.filter(o => new Date(o.createdAt).toDateString() === today);
  const pendingOrders = allOrders.filter(o => o.status === 'Placed' || o.status === 'Preparing');
  const todayRevenue = todayOrders
    .filter(o => o.paymentStatus === 'Paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  let recentHTML = '';
  if (allOrders.length > 0) {
    recentHTML = `
      <div style="margin-top:2rem">
        <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:1rem">Recent Orders</h2>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <thead>
              <tr><th>Customer</th><th>Table</th><th>Amount</th><th>Status</th><th>Payment</th><th>Time</th></tr>
            </thead>
            <tbody>
              ${allOrders.slice(0, 5).map(o => `
                <tr>
                  <td style="font-weight:600">${o.customerName}</td>
                  <td>#${o.tableNumber}</td>
                  <td style="color:var(--primary-400);font-weight:600">₹${o.totalAmount}</td>
                  <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                  <td><span class="badge ${o.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}">${o.paymentStatus}</span></td>
                  <td style="color:var(--text-muted);font-size:0.85rem">${new Date(o.createdAt).toLocaleTimeString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  }

  document.getElementById('admin-main').innerHTML = `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Welcome back! Here's your canteen overview.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-icon orange">&#128203;</div>
        <div class="stat-card-value">${todayOrders.length}</div>
        <div class="stat-card-label">Orders Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon yellow">&#9203;</div>
        <div class="stat-card-value">${pendingOrders.length}</div>
        <div class="stat-card-label">Pending Orders</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon green">&#8593;</div>
        <div class="stat-card-value">&#8377;${todayRevenue}</div>
        <div class="stat-card-label">Revenue Today</div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon blue">&#127860;</div>
        <div class="stat-card-value">${allFoods.length}</div>
        <div class="stat-card-label">Menu Items</div>
      </div>
    </div>

    <h2 style="font-size:1.2rem;font-weight:700;margin-bottom:1rem">Quick Actions</h2>
    <div style="display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn btn-primary" onclick="showSection('food')">Manage Food</button>
      <button class="btn btn-secondary" onclick="showSection('orders')">View Orders</button>
      <button class="btn btn-secondary" onclick="showMenuQR()">Menu QR Code</button>
      <button class="btn btn-secondary" onclick="showPaymentQR()">Payment QR Code</button>
    </div>

    ${recentHTML}
  `;
}

/* ── Manage Food ──────────────────────────────────────────────────────── */
function renderManageFood() {
  document.getElementById('admin-main').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem">
      <div>
        <h1 style="font-size:1.5rem;font-weight:800">Manage Food</h1>
        <p style="color:var(--text-secondary);font-size:0.9rem">${allFoods.length} items in menu</p>
      </div>
      <button class="btn btn-primary" onclick="openAddFood()">+ Add Food</button>
    </div>

    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr><th>Item</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${allFoods.length === 0 ? `
            <tr><td colspan="5" style="text-align:center;padding:3rem;color:var(--text-muted)">
              No food items yet. Click "Add Food" to get started!
            </td></tr>
          ` : allFoods.map(food => `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:0.75rem">
                  <img src="${food.image || FOOD_IMAGES[food.category] || ''}" alt="${food.name}"
                       style="width:45px;height:45px;border-radius:8px;object-fit:cover"
                       onerror="handleImgError(this)" />
                  <div>
                    <div style="font-weight:600">${food.name}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted)">
                      ${food.description ? (food.description.length > 40 ? food.description.substring(0, 40) + '...' : food.description) : 'No description'}
                    </div>
                  </div>
                </div>
              </td>
              <td><span class="badge badge-placed">${food.category}</span></td>
              <td style="font-weight:700;color:var(--primary-400)">₹${food.price}</td>
              <td>
                <button class="btn btn-sm ${food.isAvailable ? 'btn-success' : 'btn-danger'}"
                        onclick="toggleAvailability(${food.id})" style="min-width:100px">
                  ${food.isAvailable ? '👁️ Available' : '🚫 Hidden'}
                </button>
              </td>
              <td>
                <div style="display:flex;gap:0.5rem">
                  <button class="btn btn-secondary btn-sm" onclick="openEditFood(${food.id})">✏️</button>
                  <button class="btn btn-danger btn-sm" onclick="deleteFood(${food.id})">🗑️</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}

function openAddFood() {
  editingFoodId = null;
  document.getElementById('food-modal-title').textContent = '➕ Add Food';
  document.getElementById('food-name').value = '';
  document.getElementById('food-desc').value = '';
  document.getElementById('food-price').value = '';
  document.getElementById('food-category').value = 'Starters';
  document.getElementById('food-image').value = '';
  document.getElementById('food-save-btn').textContent = 'Add Food';
  document.getElementById('food-modal-error').innerHTML = '';
  document.getElementById('food-modal').style.display = 'flex';
}

function openEditFood(id) {
  const food = allFoods.find(f => f.id === id);
  if (!food) return;

  editingFoodId = id;
  document.getElementById('food-modal-title').textContent = '✏️ Edit Food';
  document.getElementById('food-name').value = food.name;
  document.getElementById('food-desc').value = food.description || '';
  document.getElementById('food-price').value = food.price;
  document.getElementById('food-category').value = food.category;
  document.getElementById('food-image').value = food.image || '';
  document.getElementById('food-save-btn').textContent = 'Update';
  document.getElementById('food-modal-error').innerHTML = '';
  document.getElementById('food-modal').style.display = 'flex';
}

function closeFoodModal() {
  document.getElementById('food-modal').style.display = 'none';
}

async function handleFoodSave(e) {
  e.preventDefault();
  const btn = document.getElementById('food-save-btn');
  const errorEl = document.getElementById('food-modal-error');
  const category = document.getElementById('food-category').value;

  const data = {
    name: document.getElementById('food-name').value,
    description: document.getElementById('food-desc').value,
    price: parseFloat(document.getElementById('food-price').value),
    category,
    image: document.getElementById('food-image').value || FOOD_IMAGES[category] || '',
    isAvailable: true,
  };

  errorEl.innerHTML = '';
  btn.disabled = true;
  btn.textContent = 'Saving...';

  try {
    if (editingFoodId) {
      await apiFetch(`/foods/${editingFoodId}`, {
        method: 'PUT',
        headers: Auth.authHeaders(),
        body: JSON.stringify(data),
      });
    } else {
      await apiFetch('/foods', {
        method: 'POST',
        headers: Auth.authHeaders(),
        body: JSON.stringify(data),
      });
    }

    closeFoodModal();
    allFoods = await apiFetch('/foods');
    renderManageFood();
  } catch (err) {
    errorEl.innerHTML = `<div class="alert alert-error">${err.message || 'Failed to save'}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = editingFoodId ? 'Update' : 'Add Food';
  }
}

async function deleteFood(id) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    await apiFetch(`/foods/${id}`, {
      method: 'DELETE',
      headers: Auth.authHeaders(),
    });
    allFoods = await apiFetch('/foods');
    renderManageFood();
  } catch (err) {
    alert(err.message || 'Failed to delete');
  }
}

async function toggleAvailability(id) {
  const food = allFoods.find(f => f.id === id);
  if (!food) return;

  try {
    await apiFetch(`/foods/${id}`, {
      method: 'PUT',
      headers: Auth.authHeaders(),
      body: JSON.stringify({ isAvailable: !food.isAvailable }),
    });
    allFoods = await apiFetch('/foods');
    renderManageFood();
  } catch (err) {
    console.error('Error:', err);
  }
}

/* ── Manage Orders ────────────────────────────────────────────────────── */
let orderFilterStatus = 'All';
const ORDER_STATUSES = ['All', 'Placed', 'Preparing', 'Ready', 'Delivered'];

function renderManageOrders() {
  const filtered = orderFilterStatus === 'All'
    ? allOrders
    : allOrders.filter(o => o.status === orderFilterStatus);

  document.getElementById('admin-main').innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;gap:1rem">
      <div>
        <h1 style="font-size:1.5rem;font-weight:800">📋 Manage Orders</h1>
        <p style="color:var(--text-secondary);font-size:0.9rem">
          ${allOrders.length} total orders • Auto-refreshes every 15s
        </p>
      </div>
      <button class="btn btn-secondary" onclick="refreshOrders()">🔄 Refresh</button>
    </div>

    <div class="category-filter">
      ${ORDER_STATUSES.map(s => `
        <button class="category-chip ${orderFilterStatus === s ? 'active' : ''}"
                onclick="setOrderFilter('${s}')">
          ${s}${s !== 'All' ? ` <span style="margin-left:0.35rem;opacity:0.7">(${allOrders.filter(o => o.status === s).length})</span>` : ''}
        </button>
      `).join('')}
    </div>

    ${filtered.length === 0 ? `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h2>No orders found</h2>
        <p>${orderFilterStatus === 'All' ? 'Orders will appear here once customers place them.' : `No orders with status "${orderFilterStatus}".`}</p>
      </div>
    ` : `
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <thead>
            <tr><th>Order</th><th>Items</th><th>Amount</th><th>Status</th><th>Payment</th><th>Time</th><th>Update Status</th></tr>
          </thead>
          <tbody>
            ${filtered.map(o => `
              <tr>
                <td>
                  <div>
                    <div style="font-weight:600">${o.customerName}</div>
                    <div style="font-size:0.8rem;color:var(--text-muted)">Table #${o.tableNumber}</div>
                  </div>
                </td>
                <td>
                  <div style="font-size:0.85rem">
                    ${o.items.map(item => `<div>${item.name} × ${item.quantity}</div>`).join('')}
                  </div>
                </td>
                <td style="font-weight:700;color:var(--primary-400)">₹${o.totalAmount}</td>
                <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                <td><span class="badge ${o.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}">${o.paymentStatus}</span></td>
                <td style="font-size:0.85rem;color:var(--text-muted)">
                  <div>${new Date(o.createdAt).toLocaleDateString()}</div>
                  <div>${new Date(o.createdAt).toLocaleTimeString()}</div>
                </td>
                <td>
                  <select class="form-input" value="${o.status}"
                          onchange="updateOrderStatus(${o.id}, this.value)"
                          style="padding:0.4rem 0.75rem;font-size:0.85rem;min-width:130px">
                    <option value="Placed" ${o.status === 'Placed' ? 'selected' : ''}>Placed</option>
                    <option value="Preparing" ${o.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="Ready" ${o.status === 'Ready' ? 'selected' : ''}>Ready</option>
                    <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `}`;
}

function setOrderFilter(status) {
  orderFilterStatus = status;
  renderManageOrders();
}

async function refreshOrders() {
  try {
    allOrders = await apiFetch('/orders', { headers: Auth.authHeaders() });
    if (currentSection === 'orders') renderManageOrders();
  } catch (err) {
    if (err.status === 401) {
      Auth.logout();
      window.location.href = '/admin/login.html';
    }
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await apiFetch(`/orders/${orderId}/status`, {
      method: 'PUT',
      headers: Auth.authHeaders(),
      body: JSON.stringify({ status: newStatus }),
    });
    await refreshOrders();
  } catch (err) {
    alert(err.message || 'Failed to update status');
  }
}

/* ── QR Modal ─────────────────────────────────────────────────────────── */
function showMenuQR() {
  const menuUrl = `${window.location.origin}/menu.html`;
  document.getElementById('menu-qr-url').textContent = menuUrl;
  document.getElementById('qr-modal').style.display = 'flex';

  setTimeout(() => {
    const el = document.getElementById('menu-qr-div');
    if (!el || typeof QRCode === 'undefined') return;
    el.innerHTML = '';
    new QRCode(el, {
      text: menuUrl,
      width: 250,
      height: 250,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H,
    });
  }, 100);
}

function closeQRModal() {
  document.getElementById('qr-modal').style.display = 'none';
}

/* ── Payment QR ───────────────────────────────────────────────────────── */
function showPaymentQR() {
  document.getElementById('payment-qr-modal').style.display = 'flex';
  setTimeout(() => generatePaymentQR(), 150);
}

function generatePaymentQR() {
  const upiId = document.getElementById('payment-upi-id').value.trim() || 'canteen@upi';
  const payeeName = document.getElementById('payment-payee-name').value.trim() || 'QuickBite Canteen';
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

  document.getElementById('payment-qr-upi-url').textContent = upiUrl;
  document.getElementById('payment-qr-display').style.display = 'block';

  const el = document.getElementById('payment-qr-div');
  if (!el || typeof QRCode === 'undefined') return;
  el.innerHTML = '';

  new QRCode(el, {
    text: upiUrl,
    width: 240,
    height: 240,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function closePaymentQRModal() {
  document.getElementById('payment-qr-modal').style.display = 'none';
}

/* ── Logout ───────────────────────────────────────────────────────────── */
function doLogout() {
  Auth.logout();
  window.location.href = '/admin/login.html';
}
