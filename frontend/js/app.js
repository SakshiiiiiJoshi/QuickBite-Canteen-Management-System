/* ========================================================================
   app.js — Shared utilities for QuickBite Canteen (vanilla JS)
   ======================================================================== */

const API_URL = '/api';
const LAST_ORDER_KEY = 'canteen_last_order_id';

/* ── Cart (localStorage) ──────────────────────────────────────────────── */
const Cart = {
  KEY: 'canteen_cart',

  getItems() {
    try {
      const saved = localStorage.getItem(this.KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  },

  save(items) {
    localStorage.setItem(this.KEY, JSON.stringify(items));
  },

  addItem(food) {
    const items = this.getItems();
    const existing = items.find(i => i.id === food.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({ ...food, quantity: 1 });
    }
    this.save(items);
  },

  removeItem(foodId) {
    const items = this.getItems().filter(i => i.id !== foodId);
    this.save(items);
  },

  updateQuantity(foodId, qty) {
    if (qty <= 0) {
      this.removeItem(foodId);
      return;
    }
    const items = this.getItems().map(i =>
      i.id === foodId ? { ...i, quantity: qty } : i
    );
    this.save(items);
  },

  clear() {
    this.save([]);
  },

  getTotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.quantity, 0);
  },

  getItemCount() {
    return this.getItems().reduce((c, i) => c + i.quantity, 0);
  },
};

/* ── Auth helpers ─────────────────────────────────────────────────────── */
const Auth = {
  TOKEN_KEY: 'canteen_admin_token',
  USER_KEY: 'canteen_admin_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  },

  setUser(user) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  authHeaders() {
    return {
      Authorization: `Bearer ${this.getToken()}`,
      'Content-Type': 'application/json',
    };
  },
};

/* ── API Fetch wrapper ────────────────────────────────────────────────── */
async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    throw { status: res.status, message: data.message || 'Request failed' };
  }
  return data;
}

/* ── Navbar renderer ──────────────────────────────────────────────────── */
function renderNavbar(activePage) {
  const isAdmin = activePage.startsWith('admin');
  const cartCount = Cart.getItemCount();

  const nav = document.getElementById('navbar');
  if (!nav) return;

  const lastOrderId = localStorage.getItem(LAST_ORDER_KEY);
  const trackHref = lastOrderId ? `/order.html?orderId=${lastOrderId}` : '/track.html';

  nav.innerHTML = `
    <a href="/menu.html" class="navbar-brand">
      <span class="brand-icon">&#127869;&#65039;</span>
      <span>QuickBite</span>
    </a>
    <div class="navbar-links">
      ${!isAdmin ? `
        <a href="/menu.html" class="${activePage === 'menu' ? 'active' : ''}">Menu</a>
        <a href="/cart.html" class="${activePage === 'cart' ? 'active' : ''}" style="position:relative">
          Cart
          ${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
        </a>
        <a href="${trackHref}" class="${activePage === 'order' || activePage === 'track' ? 'active' : ''}">
          My Order${lastOrderId ? ` <span class="cart-badge" style="background:var(--primary-500)">&bull;</span>` : ''}
        </a>
      ` : `
        <a href="/menu.html">Customer View</a>
      `}
      <a href="/admin/login.html" class="${isAdmin ? 'active' : ''}">Admin</a>
    </div>
  `;
}

/* ── Placeholder image ────────────────────────────────────────────────── */
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';

function handleImgError(img) {
  img.onerror = null;
  img.src = PLACEHOLDER_IMAGE;
}
