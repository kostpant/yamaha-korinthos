/* ═════════════════════════════════════════════════════════════
   LISTINGS PAGE JAVASCRIPT
   ═════════════════════════════════════════════════════════════ */

import { fetchAllBikes, formatPrice, getLocalizedField } from './api.js';
import { initI18n, getCurrentLanguage, t } from './i18n.js';

// State
let allBikes = [];
let filteredBikes = [];
let currentSort = 'newest';
let isGridView = true;

// DOM Elements
const listingsGrid = document.getElementById('listingsGrid');
const emptyState = document.getElementById('emptyState');
const resultsCount = document.getElementById('resultsCount');
const searchInput = document.getElementById('searchInput');
const mobileSearchInput = document.getElementById('mobileSearchInput');
const sortSelect = document.getElementById('sortSelect');
const gridViewBtn = document.getElementById('gridView');
const listViewBtn = document.getElementById('listView');
const clearFiltersBtn = document.getElementById('clearFilters');
const resetFiltersBtn = document.getElementById('resetFilters');
const filterSidebar = document.getElementById('filterSidebar');
const mobileFilterToggle = document.getElementById('mobileFilterToggle');
const filterClose = document.getElementById('filterClose');
const filterCount = document.getElementById('filterCount');
const mobileFilterCount = document.getElementById('mobileFilterCount');
const activeFilterCount = document.getElementById('activeFilterCount');
const backToTop = document.getElementById('backToTop');

// Initialize
async function init() {
  await initI18n();

  // Show skeleton loading
  showSkeletons(6);

  try {
    // Fetch all bikes
    allBikes = await fetchAllBikes();
    filteredBikes = [...allBikes];

    // Render dynamic filters first
    renderAllFilters(allBikes);

    // Load filters from URL
    loadFiltersFromURL();

    // Apply filters and render cards
    applyFilters();

  } catch (error) {
    console.error('Failed to load listings:', error);
    showError();
  }

  // Setup event listeners
  setupEventListeners();

  // Setup scroll listener for back-to-top
  setupScrollListener();
}

// Render all filter sections dynamically
function renderAllFilters(bikes) {
  const lang = getCurrentLanguage();

  // 1. Unique Brands
  const brands = [...new Set(bikes.map(b => b.brand))].filter(Boolean).sort();
  const brandContainer = document.getElementById('brandFilterContainer');
  if (brandContainer) {
    brandContainer.innerHTML = brands.map(brand => `
      <label class="filter-checkbox">
        <input type="checkbox" name="brand" value="${brand}">
        <span class="checkmark"></span>
        <span>${brand}</span>
      </label>
    `).join('');
  }

  // 2. Unique Categories
  const categories = [...new Set(bikes.map(b => b.category))].filter(Boolean).sort();
  const categoryContainer = document.getElementById('categoryFilterContainer');
  if (categoryContainer) {
    categoryContainer.innerHTML = categories.map(cat => `
      <label class="filter-checkbox">
        <input type="checkbox" name="category" value="${cat}">
        <span class="checkmark"></span>
        <span>${cat}</span>
      </label>
    `).join('');
  }

  // 3. Unique Conditions
  const conditions = [...new Set(bikes.map(b => b.condition))].filter(Boolean).sort();
  const conditionContainer = document.getElementById('conditionFilterContainer');
  if (conditionContainer) {
    let conditionHTML = `
      <label class="filter-radio">
        <input type="radio" name="condition" value="all" checked>
        <span class="radiomark"></span>
        <span data-i18n="listings.all">${t('listings.all')}</span>
      </label>
    `;
    conditionHTML += conditions.map(cond => `
      <label class="filter-radio">
        <input type="radio" name="condition" value="${cond}">
        <span class="radiomark"></span>
        <span>${cond}</span>
      </label>
    `).join('');
    conditionContainer.innerHTML = conditionHTML;
  }

  // 4. Year Range
  const years = bikes.map(b => b.year).filter(y => y > 0);
  if (years.length > 0) {
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearMinInput = document.getElementById('yearMin');
    const yearMaxInput = document.getElementById('yearMax');
    if (yearMinInput) yearMinInput.placeholder = minYear;
    if (yearMaxInput) yearMaxInput.placeholder = maxYear;
  }

  // 5. Price Range
  const prices = bikes.map(b => b.price).filter(p => p > 0);
  if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceMinInput = document.getElementById('priceMin');
    const priceMaxInput = document.getElementById('priceMax');
    if (priceMinInput) priceMinInput.placeholder = minPrice;
    if (priceMaxInput) priceMaxInput.placeholder = maxPrice;
  }

  // 6. Engine CC Dropdown
  const engineCCs = [...new Set(bikes.map(b => b.engineCc))].filter(cc => cc > 0).sort((a, b) => a - b);
  const engineCCSelect = document.getElementById('engineCCSelect');
  if (engineCCSelect) {
    engineCCSelect.innerHTML = `
      <option value="" data-i18n="listings.all_cc">${t('listings.all_cc')}</option>
      ${engineCCs.map(cc => `<option value="${cc}">${cc}cc</option>`).join('')}
    `;
  }
}

// Show skeleton loading cards
function showSkeletons(count = 6) {
  listingsGrid.innerHTML = '';
  for (let i = 0; i < count; i++) {
    listingsGrid.appendChild(createSkeletonCard());
  }
}

// Create skeleton card element
function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'skeleton-card';
  card.innerHTML = `
    <div class="skeleton-card__image"></div>
    <div class="skeleton-card__content">
      <div class="skeleton-card__title"></div>
      <div class="skeleton-card__meta"></div>
      <div class="skeleton-card__price"></div>
    </div>
  `;
  return card;
}

// Render bike cards
function renderCards(bikes) {
  listingsGrid.innerHTML = '';

  if (bikes.length === 0) {
    listingsGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  listingsGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  const lang = getCurrentLanguage();

  bikes.forEach(bike => {
    listingsGrid.appendChild(createCard(bike, lang));
  });

  // Update count
  updateCount(bikes.length, allBikes.length);
}

// Create bike card element
function createCard(bike, lang) {
  const card = document.createElement('div');
  card.className = 'bike-card';
  card.style.cursor = 'pointer';
  card.setAttribute('data-bike-id', bike.id);
  card.style.cursor = 'pointer';
  card.onclick = function () {
    const bikeId = this.getAttribute('data-bike-id');
    window.location.href = 'listing?id=' + bikeId;
  };

  const title = getLocalizedField(bike, 'title', lang);
  const priceDisplay = formatPrice(bike.price, lang);
  const conditionKey = bike.condition.toLowerCase();
  const conditionText = lang === 'gr'
    ? (bike.condition === 'New' ? 'Καινούργια' : 'Μεταχειρισμένη')
    : bike.condition;

  card.innerHTML = `
    <div class="bike-card__image">
      <img src="${bike.mainImage}" alt="${title}" loading="lazy">
      <div class="bike-card__badges">
        ${bike.featured ? `<span class="bike-card__badge bike-card__badge--featured" data-i18n="listing.featured_badge">${t('listing.featured_badge')}</span>` : ''}
        <span class="bike-card__badge bike-card__badge--${conditionKey}">${conditionText}</span>
      </div>
    </div>
    <div class="bike-card__content">
      <h3 class="bike-card__title">${title}</h3>
      <div class="bike-card__meta">
        <span>${bike.year}</span>
        <span>•</span>
        <span>${bike.brand}</span>
      </div>
      <div class="bike-card__specs">
        <span class="bike-card__spec">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          ${bike.mileageKm.toLocaleString(lang === 'gr' ? 'el-GR' : 'en-US')} ${t('common.km')}
        </span>
        <span class="bike-card__spec">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
          ${bike.engineCc}cc
        </span>
      </div>
      <div class="bike-card__price">${priceDisplay}</div>
    </div>
  `;

  return card;
}

// Apply filters
function applyFilters() {
  const brandFilters = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(cb => cb.value);
  const categoryFilters = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
  const conditionFilter = document.querySelector('input[name="condition"]:checked')?.value || 'all';
  const yearMin = parseInt(document.getElementById('yearMin')?.value) || null;
  const yearMax = parseInt(document.getElementById('yearMax')?.value) || null;
  const priceMin = parseInt(document.getElementById('priceMin')?.value) || null;
  const priceMax = parseInt(document.getElementById('priceMax')?.value) || null;
  const engineCC = document.getElementById('engineCCSelect')?.value || '';
  const searchQuery = (searchInput?.value || '').toLowerCase().trim();

  filteredBikes = allBikes.filter(bike => {
    // Brand filter
    if (brandFilters.length > 0 && !brandFilters.includes(bike.brand)) {
      return false;
    }

    // Category filter
    if (categoryFilters.length > 0 && !categoryFilters.includes(bike.category)) {
      return false;
    }

    // Condition filter
    if (conditionFilter !== 'all' && bike.condition !== conditionFilter) {
      return false;
    }

    // Year filter
    if (yearMin && bike.year < yearMin) return false;
    if (yearMax && bike.year > yearMax) return false;

    // Price filter
    if (priceMin && bike.price < priceMin) return false;
    if (priceMax && bike.price > priceMax) return false;

    // Engine CC filter
    if (engineCC) {
      const ccValue = parseInt(engineCC);
      if (bike.engineCc !== ccValue) return false;
    }

    // Search filter
    if (searchQuery) {
      const lang = getCurrentLanguage();
      const title = getLocalizedField(bike, 'title', lang).toLowerCase();
      const model = (bike.model || '').toLowerCase();
      const brand = (bike.brand || '').toLowerCase();

      if (!title.includes(searchQuery) && !model.includes(searchQuery) && !brand.includes(searchQuery)) {
        return false;
      }
    }

    return true;
  });

  // Apply sort
  applySort(currentSort);

  // Update filter count badge
  updateFilterCount();

  // Save filters to URL
  saveFiltersToURL();
}

// Apply sort
function applySort(method) {
  currentSort = method;

  switch (method) {
    case 'price_asc':
      filteredBikes.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      filteredBikes.sort((a, b) => b.price - a.price);
      break;
    case 'year_asc':
      filteredBikes.sort((a, b) => a.year - b.year);
      break;
    case 'year_desc':
      filteredBikes.sort((a, b) => b.year - a.year);
      break;
    case 'newest':
    default:
      filteredBikes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
  }

  renderCards(filteredBikes);
}

// Debounced search
let searchTimeout;
function debounceSearch(query) {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
}

// Update results count
function updateCount(shown, total) {
  const lang = getCurrentLanguage();
  const text = lang === 'gr'
    ? `Εμφανίζονται ${shown} από ${total} μοτοσυκλέτες`
    : `Showing ${shown} of ${total} motorcycles`;
  resultsCount.textContent = text;
}

// Update filter count badge
function updateFilterCount() {
  let count = 0;

  count += document.querySelectorAll('input[name="brand"]:checked').length;
  count += document.querySelectorAll('input[name="category"]:checked').length;

  const condition = document.querySelector('input[name="condition"]:checked')?.value;
  if (condition && condition !== 'all') count++;

  if (document.getElementById('yearMin')?.value) count++;
  if (document.getElementById('yearMax')?.value) count++;
  if (document.getElementById('priceMin')?.value) count++;
  if (document.getElementById('priceMax')?.value) count++;
  if (document.getElementById('engineCCSelect')?.value) count++;
  if (searchInput?.value) count++;

  filterCount.textContent = count;
  mobileFilterCount.textContent = count;

  if (count > 0) {
    activeFilterCount.style.display = 'flex';
    mobileFilterCount.style.display = 'inline-flex';
  } else {
    activeFilterCount.style.display = 'none';
    mobileFilterCount.style.display = 'none';
  }
}

// Clear all filters
function clearAllFilters() {
  document.querySelectorAll('input[name="brand"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="category"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('input[name="condition"]').forEach(rb => rb.checked = rb.value === 'all');
  document.getElementById('yearMin').value = '';
  document.getElementById('yearMax').value = '';
  document.getElementById('priceMin').value = '';
  document.getElementById('priceMax').value = '';
  document.getElementById('engineCCSelect').value = '';
  searchInput.value = '';
  if (mobileSearchInput) mobileSearchInput.value = '';

  applyFilters();
}

// Save filters to URL
function saveFiltersToURL() {
  const params = new URLSearchParams();

  const brands = Array.from(document.querySelectorAll('input[name="brand"]:checked')).map(cb => cb.value);
  if (brands.length > 0) params.set('brand', brands.join(','));

  const categories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
  if (categories.length > 0) params.set('category', categories.join(','));

  const condition = document.querySelector('input[name="condition"]:checked')?.value;
  if (condition && condition !== 'all') params.set('condition', condition);

  const yearMin = document.getElementById('yearMin')?.value;
  if (yearMin) params.set('yearMin', yearMin);

  const yearMax = document.getElementById('yearMax')?.value;
  if (yearMax) params.set('yearMax', yearMax);

  const priceMin = document.getElementById('priceMin')?.value;
  if (priceMin) params.set('priceMin', priceMin);

  const priceMax = document.getElementById('priceMax')?.value;
  if (priceMax) params.set('priceMax', priceMax);

  const engineCC = document.getElementById('engineCCSelect')?.value;
  if (engineCC) params.set('engineCC', engineCC);

  if (searchInput?.value) params.set('search', searchInput.value);

  if (currentSort !== 'newest') params.set('sort', currentSort);

  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  window.history.replaceState({}, '', newUrl);
}

// Load filters from URL
function loadFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('brand')) {
    const brands = params.get('brand').split(',');
    brands.forEach(brand => {
      const cb = document.querySelector(`input[name="brand"][value="${brand}"]`);
      if (cb) cb.checked = true;
    });
  }

  if (params.has('category')) {
    const categories = params.get('category').split(',');
    categories.forEach(category => {
      const cb = document.querySelector(`input[name="category"][value="${category}"]`);
      if (cb) cb.checked = true;
    });
  }

  if (params.has('condition')) {
    const condition = params.get('condition');
    const rb = document.querySelector(`input[name="condition"][value="${condition}"]`);
    if (rb) rb.checked = true;
  }

  if (params.has('yearMin')) {
    const el = document.getElementById('yearMin');
    if (el) el.value = params.get('yearMin');
  }

  if (params.has('yearMax')) {
    const el = document.getElementById('yearMax');
    if (el) el.value = params.get('yearMax');
  }

  if (params.has('priceMin')) {
    const el = document.getElementById('priceMin');
    if (el) el.value = params.get('priceMin');
  }

  if (params.has('priceMax')) {
    const el = document.getElementById('priceMax');
    if (el) el.value = params.get('priceMax');
  }

  if (params.has('engineCC')) {
    const el = document.getElementById('engineCCSelect');
    if (el) el.value = params.get('engineCC');
  }

  if (params.has('search')) {
    searchInput.value = params.get('search');
    if (mobileSearchInput) mobileSearchInput.value = params.get('search');
  }

  if (params.has('sort')) {
    currentSort = params.get('sort');
    sortSelect.value = currentSort;
  }
}

// Toggle view
function toggleView(view) {
  isGridView = view === 'grid';

  if (isGridView) {
    listingsGrid.classList.remove('list-view');
    gridViewBtn.classList.add('active');
    listViewBtn.classList.remove('active');
  } else {
    listingsGrid.classList.add('list-view');
    gridViewBtn.classList.remove('active');
    listViewBtn.classList.add('active');
  }
}

// Setup event listeners
function setupEventListeners() {
  // Use event delegation for dynamic filters
  const filterSidebar = document.getElementById('filterSidebar');

  if (filterSidebar) {
    filterSidebar.addEventListener('change', (e) => {
      if (e.target.name === 'brand' || e.target.name === 'category' || e.target.name === 'condition' || e.target.name === 'engineCC') {
        applyFilters();
      }
    });

    filterSidebar.addEventListener('input', (e) => {
      if (e.target.type === 'number') {
        debounceSearch(e.target.value);
      }
    });
  }

  // Search
  searchInput?.addEventListener('input', (e) => {
    debounceSearch(e.target.value);
  });

  mobileSearchInput?.addEventListener('input', (e) => {
    searchInput.value = e.target.value;
    debounceSearch(e.target.value);
  });

  // Sort
  sortSelect?.addEventListener('change', (e) => {
    applySort(e.target.value);
    saveFiltersToURL();
  });

  // View toggle
  gridViewBtn?.addEventListener('click', () => toggleView('grid'));
  listViewBtn?.addEventListener('click', () => toggleView('list'));

  // Clear filters
  clearFiltersBtn?.addEventListener('click', clearAllFilters);
  resetFiltersBtn?.addEventListener('click', clearAllFilters);

  // Mobile filter sidebar
  mobileFilterToggle?.addEventListener('click', () => {
    filterSidebar.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  filterClose?.addEventListener('click', () => {
    filterSidebar.classList.remove('active');
    document.body.style.overflow = '';
  });

  // Filter group accordions
  document.querySelectorAll('.filter-group-header').forEach(header => {
    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      header.setAttribute('aria-expanded', !expanded);
    });
  });

  // Back to top
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ... existing helper functions ...

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

// Show error state
function showError() {
  listingsGrid.innerHTML = '';
  emptyState.style.display = 'block';
  emptyState.querySelector('h3').textContent = t('common.error');
  emptyState.querySelector('p').textContent = 'Failed to load motorcycles. Please try again later.';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
