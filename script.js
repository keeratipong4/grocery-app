/* ============================================================
   FARMART — script.js
   Cart · Wishlist · Mobile Menu · Scroll Controls · Newsletter
   ============================================================ */

/* ── State ─────────────────────────────────────────────────── */
const state = {
  cart: JSON.parse(localStorage.getItem('fm_cart') || '[]'),
  wishlist: new Set(JSON.parse(localStorage.getItem('fm_wishlist') || '[]')),
};

/* ── DOM refs ───────────────────────────────────────────────── */
const cartDrawer     = document.getElementById('cartDrawer');
const cartOverlay    = document.getElementById('cartOverlay');
const cartClose      = document.getElementById('cartClose');
const cartBtn        = document.getElementById('cartBtn');
const cartCount      = document.getElementById('cartCount');
const cartTotal      = document.getElementById('cartTotal');
const cartItems      = document.getElementById('cartItems');
const cartDrawerCount = document.getElementById('cartDrawerCount');
const cartDrawerTotal = document.getElementById('cartDrawerTotal');
const wishlistCount  = document.getElementById('wishlistCount');
const mobileMenuBtn  = document.getElementById('mobileMenuBtn');
const navMenu        = document.getElementById('navMenu');
const newsletterForm = document.getElementById('newsletterForm');

/* ── Cart helpers ───────────────────────────────────────────── */
function saveCart() {
  localStorage.setItem('fm_cart', JSON.stringify(state.cart));
}

function getCartTotals() {
  const count = state.cart.reduce((n, i) => n + i.qty, 0);
  const total = state.cart.reduce((n, i) => n + i.price * i.qty, 0);
  return { count, total };
}

function formatPrice(n) {
  return '$' + n.toFixed(2);
}

function addToCart(id, name, price) {
  const existing = state.cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    state.cart.push({ id, name, price: parseFloat(price), qty: 1 });
  }
  saveCart();
  updateCartUI();
  openCart();
  showToast(`"${name}" added to cart`);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const { count, total } = getCartTotals();

  cartCount.textContent = count;
  cartTotal.textContent = formatPrice(total);
  cartDrawerCount.textContent = count;
  cartDrawerTotal.textContent = formatPrice(total);

  if (state.cart.length === 0) {
    cartItems.innerHTML = '<p class="cart-drawer__empty">Your cart is empty.</p>';
    return;
  }

  cartItems.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__name">${item.name}</div>
      <span class="cart-item__qty">x${item.qty}</span>
      <span class="cart-item__price">${formatPrice(item.price * item.qty)}</span>
      <button class="cart-item__remove" data-remove="${item.id}" aria-label="Remove ${item.name}">✕</button>
    </div>
  `).join('');

  cartItems.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}

/* ── Cart drawer ────────────────────────────────────────────── */
function openCart() {
  cartDrawer.classList.add('is-open');
  cartDrawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer.classList.remove('is-open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

cartBtn.addEventListener('click', openCart);
cartClose.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCart();
});

/* ── Add to cart buttons ────────────────────────────────────── */
document.addEventListener('click', e => {
  const btn = e.target.closest('.product-card__add-btn');
  if (!btn) return;
  const card = btn.closest('.product-card');
  if (!card) return;
  addToCart(card.dataset.id, card.dataset.name, card.dataset.price);
});

/* ── Wishlist ───────────────────────────────────────────────── */
function saveWishlist() {
  localStorage.setItem('fm_wishlist', JSON.stringify([...state.wishlist]));
}

function updateWishlistUI() {
  wishlistCount.textContent = state.wishlist.size;
  document.querySelectorAll('.product-card__wishlist').forEach(btn => {
    const id = btn.closest('.product-card')?.dataset.id;
    btn.classList.toggle('is-wishlisted', state.wishlist.has(id));
    btn.textContent = state.wishlist.has(id) ? '♥' : '♡';
  });
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.product-card__wishlist');
  if (!btn) return;
  const id = btn.closest('.product-card')?.dataset.id;
  if (!id) return;
  if (state.wishlist.has(id)) {
    state.wishlist.delete(id);
  } else {
    state.wishlist.add(id);
    showToast('Added to wishlist ♥');
  }
  saveWishlist();
  updateWishlistUI();
});

/* ── Mobile menu ────────────────────────────────────────────── */
mobileMenuBtn?.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('is-open');
  mobileMenuBtn.setAttribute('aria-expanded', isOpen);
});

/* ── Horizontal scroll controls ────────────────────────────── */
function setupScrollRow(rowId, leftId, rightId) {
  const row   = document.getElementById(rowId);
  const left  = document.getElementById(leftId);
  const right = document.getElementById(rightId);
  if (!row || !left || !right) return;

  const STEP = 260;
  left.addEventListener('click',  () => row.scrollBy({ left: -STEP, behavior: 'smooth' }));
  right.addEventListener('click', () => row.scrollBy({ left:  STEP, behavior: 'smooth' }));
}

setupScrollRow('bestSellerRow', 'bsLeft',  'bsRight');
setupScrollRow('justLandingRow', 'jlLeft', 'jlRight');

/* ── Search ─────────────────────────────────────────────────── */
document.getElementById('searchForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const q = e.target.querySelector('.search__input').value.trim();
  if (q) showToast(`Searching for "${q}"…`);
});

/* ── Newsletter ─────────────────────────────────────────────── */
newsletterForm?.addEventListener('submit', e => {
  e.preventDefault();
  showToast('🎉 Welcome! Your 15% discount code is on its way.');
  newsletterForm.reset();
});

/* ── Toast notification ─────────────────────────────────────── */
let toastTimer = null;

function showToast(msg) {
  let toast = document.getElementById('fm-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'fm-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#222',
      color: '#fff',
      padding: '10px 20px',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'inherit',
      zIndex: '999',
      boxShadow: '0 4px 12px rgba(0,0,0,.2)',
      transition: 'opacity .2s',
      whiteSpace: 'nowrap',
    });
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}

/* ── Init ───────────────────────────────────────────────────── */
updateCartUI();
updateWishlistUI();
