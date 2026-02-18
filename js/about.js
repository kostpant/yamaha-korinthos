/* ═════════════════════════════════════════════════════════════
   ABOUT PAGE JAVASCRIPT
   ═════════════════════════════════════════════════════════════ */

import { initI18n } from './i18n.js';
import { setupNavbar, setupMobileMenu } from './navbar.js';

// DOM Elements
const backToTop = document.getElementById('backToTop');

// Initialize
async function init() {
  await initI18n();
  setupNavbar();
  setupMobileMenu();
  setupEventListeners();
  setupScrollListener();
}

// Setup event listeners
function setupEventListeners() {
  // Back to top
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Setup scroll listener
function setupScrollListener() {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      backToTop?.classList.add('visible');
    } else {
      backToTop?.classList.remove('visible');
    }
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
