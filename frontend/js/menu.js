/* menu.js — Menu page logic */

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Beverages', 'Desserts', 'Snacks'];

let allFoods = [];
let activeCategory = 'All';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar('menu');
  renderCategoryChips();
  fetchFoods();
  generateMenuQR();

  document.getElementById('menu-search').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderFoodGrid();
  });
});

function generateMenuQR() {
  const menuUrl = window.location.origin + '/menu.html';
  const urlEl = document.getElementById('menu-qr-url-text');
  if (urlEl) urlEl.textContent = menuUrl;

  const el = document.getElementById('menu-qr-div');
  if (!el || typeof QRCode === 'undefined') return;

  // Clear any previous QR
  el.innerHTML = '';

  new QRCode(el, {
    text: menuUrl,
    width: 100,
    height: 100,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function renderCategoryChips() {
  const container = document.getElementById('category-filter');
  container.innerHTML = CATEGORIES.map(cat => `
    <button class="category-chip ${activeCategory === cat ? 'active' : ''}"
            onclick="setCategory('${cat}')">${cat}</button>
  `).join('');
}

function setCategory(cat) {
  activeCategory = cat;
  renderCategoryChips();
  renderFoodGrid();
}

async function fetchFoods() {
  try {
    allFoods = await apiFetch('/foods');
    renderFoodGrid();
  } catch (err) {
    document.getElementById('food-content').innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <h2>Failed to load menu</h2>
        <p>${err.message || 'Please try again later.'}</p>
      </div>`;
  }
}

function renderFoodGrid() {
  const filtered = allFoods.filter(f => {
    const matchCat = activeCategory === 'All' || f.category === activeCategory;
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const container = document.getElementById('food-content');

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <h2>No items found</h2>
        <p>Try a different category or search term</p>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="food-grid">
      ${filtered.map(food => renderFoodCard(food)).join('')}
    </div>`;
}

function renderFoodCard(food) {
  const imgSrc = food.image || PLACEHOLDER_IMAGE;
  return `
    <div class="food-card animate-in">
      <div class="food-card-image-wrapper">
        <img src="${imgSrc}" alt="${food.name}" class="food-card-image"
             onerror="handleImgError(this)" />
        <span class="food-card-category">${food.category}</span>
        ${!food.isAvailable ? '<div class="food-card-unavailable">Unavailable</div>' : ''}
      </div>
      <div class="food-card-body">
        <h3 class="food-card-name">${food.name}</h3>
        <p class="food-card-desc">${food.description || 'Delicious and freshly prepared.'}</p>
        <div class="food-card-footer">
          <span class="food-card-price">${food.price}</span>
          <button class="btn btn-primary btn-sm"
                  onclick='addFoodToCart(${JSON.stringify(food).replace(/'/g, "&#39;")})'
                  ${!food.isAvailable ? 'disabled' : ''}>
            ＋ Add
          </button>
        </div>
      </div>
    </div>`;
}

function addFoodToCart(food) {
  Cart.addItem(food);
  renderNavbar('menu');

  // Quick feedback animation
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.style.animation = 'none';
    badge.offsetHeight; // trigger reflow
    badge.style.animation = 'badge-pop 0.3s ease';
  }
}
