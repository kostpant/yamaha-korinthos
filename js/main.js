/* ═════════════════════════════════════════════════════════════
   MAIN JAVASCRIPT — Homepage Logic
   ═════════════════════════════════════════════════════════════ */

import { initI18n, getCurrentLanguage, t } from './i18n.js';
import { fetchAllBikes, formatPrice, getLocalizedField } from './api.js';
import { FEATURES } from './config.js';

// ─────────────────────────────────────────────────────────────
// Initialize on DOM load
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize i18n first
    await initI18n();

    // Setup navbar scroll behavior
    setupNavbar();

    // Setup mobile menu
    setupMobileMenu();

    // Load featured motorcycles
    if (FEATURES.enableFeaturedCarousel) {
        await loadFeaturedBikes();
    }
});

// ─────────────────────────────────────────────────────────────
// Navbar Scroll Behavior (Glassmorphism)
// ─────────────────────────────────────────────────────────────
function setupNavbar() {
    const navbar = document.getElementById('navbar');

    function updateNavbar() {
        if (window.scrollY > 100) {
            navbar.classList.remove('navbar-transparent');
            navbar.classList.add('navbar-solid');
        } else {
            navbar.classList.remove('navbar-solid');
            navbar.classList.add('navbar-transparent');
        }
    }

    // Initial check
    updateNavbar();

    // Listen to scroll
    window.addEventListener('scroll', updateNavbar, { passive: true });
}

// ─────────────────────────────────────────────────────────────
// Mobile Menu Toggle
// ─────────────────────────────────────────────────────────────
function setupMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
    });

    // Close menu when clicking a link
    const menuLinks = menu.querySelectorAll('.mobile-menu-link');
    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
        });
    });
}

// ─────────────────────────────────────────────────────────────
// Load Featured Motorcycles
// ─────────────────────────────────────────────────────────────
async function loadFeaturedBikes() {
    const grid = document.getElementById('featured-grid');

    try {
        const allBikes = await fetchAllBikes();
        const featuredBikes = allBikes.filter(bike => bike.featured).slice(0, 3);

        if (featuredBikes.length === 0) {
            // No featured bikes, show first 3 available
            featuredBikes.push(...allBikes.slice(0, 3));
        }

        // Clear skeleton
        grid.innerHTML = '';

        // Render cards
        featuredBikes.forEach(bike => {
            const card = createBikeCard(bike);
            grid.appendChild(card);
        });

    } catch (error) {
        console.error('Failed to load featured bikes:', error);
        grid.innerHTML = `<p class="text-center text-muted" style="grid-column: 1 / -1;">${t('common.error')}</p>`;
    }
}

// ─────────────────────────────────────────────────────────────
// Create Bike Card Element
// ─────────────────────────────────────────────────────────────
function createBikeCard(bike) {
    const lang = getCurrentLanguage();
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cursor = 'pointer';
    card.setAttribute('data-bike-id', bike.id);
    card.style.cursor = 'pointer';
    card.onclick = function () {
        const bikeId = this.getAttribute('data-bike-id');
        window.location.href = 'listing.html?id=' + bikeId;
    };

    const title = getLocalizedField(bike, 'title', lang);
    const price = formatPrice(bike.price, lang);

    card.innerHTML = `
    <div class="card-image">
      <img 
        src="${bike.thumbnail}" 
        alt="${title}"
        loading="lazy"
        width="400"
        height="300"
      >
      ${bike.featured ? `<span class="badge badge-featured" style="position: absolute; top: 12px; left: 12px;">${t('listing.featured_badge')}</span>` : ''}
      ${bike.condition === 'New' ? `<span class="badge badge-new" style="position: absolute; top: 12px; right: 12px;">${t('listing.condition_new')}</span>` : ''}
    </div>
    <div class="card-body">
      <h3 class="card-title">${title}</h3>
      <p class="card-text">
        ${bike.year} · ${bike.engineCc} cc · ${bike.category}
      </p>
      <div class="flex-between mt-4">
        <span class="price">${price}</span>
        <span class="btn btn-primary" style="padding: var(--space-2) var(--space-4); font-size: var(--text-sm);">${t('listing.view_details')}</span>
      </div>
    </div>
  `;

    const btn = card.querySelector('.btn-primary');
    if (btn) {
        btn.onclick = function (e) {
            e.stopPropagation();
            const bikeId = this.closest('.card').getAttribute('data-bike-id');
            window.location.href = 'listing.html?id=' + bikeId;
        };
    }

    return card;
}
