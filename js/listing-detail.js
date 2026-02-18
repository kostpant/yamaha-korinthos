/* ═════════════════════════════════════════════════════════════
   LISTING DETAIL PAGE JAVASCRIPT
   ═════════════════════════════════════════════════════════════ */

import { fetchBikeById, fetchAllBikes, formatPrice, getLocalizedField } from './api.js';
import { initI18n, getCurrentLanguage, t } from './i18n.js';
import { setupNavbar, setupMobileMenu } from './navbar.js';

// State
let currentBike = null;
let currentImageIndex = 0;
let bikeImages = [];

// DOM Elements
const errorState = document.getElementById('errorState');
const detailLayout = document.getElementById('detailLayout');
const breadcrumbModel = document.getElementById('breadcrumbModel');
const mainImage = document.getElementById('mainImage');
const galleryThumbs = document.getElementById('galleryThumbs');
const galleryPrev = document.getElementById('galleryPrev');
const galleryNext = document.getElementById('galleryNext');
const descriptionEn = document.getElementById('descriptionEn');
const descriptionGr = document.getElementById('descriptionGr');
const tabEn = document.getElementById('tabEn');
const tabGr = document.getElementById('tabGr');
const specsTable = document.getElementById('specsTable');
const priceDisplay = document.getElementById('priceDisplay');
const conditionBadge = document.getElementById('conditionBadge');
const relatedGrid = document.getElementById('relatedGrid');
const copyLinkBtn = document.getElementById('copyLink');
const toast = document.getElementById('toast');
const backToTop = document.getElementById('backToTop');

// Initialize
async function init() {
  await initI18n();
  setupNavbar();
  setupMobileMenu();

  const bikeId = getIdFromURL();

  if (!bikeId) {
    showError();
    return;
  }

  try {
    currentBike = await fetchBikeById(bikeId);

    if (!currentBike) {
      showError();
      return;
    }

    populatePage(currentBike);
    injectSEO(currentBike);
    populatePage(currentBike);
    injectSEO(currentBike);

    // Check for specific related listings first
    if (currentBike.relatedListings && currentBike.relatedListings.length > 0) {
      await renderRelatedListings(currentBike.relatedListings);
    } else {
      // Fallback to category-based
      await fetchRelated(currentBike.category, currentBike.id);
    }

  } catch (error) {
    console.error('Failed to load listing:', error);
    showError();
  }

  setupEventListeners();
  setupScrollListener();
}

// Get ID from URL
function getIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  console.log('Motorcycle ID from URL:', id);
  return id;
}

// Populate page with bike data
function populatePage(bike) {
  const lang = getCurrentLanguage();

  // Update breadcrumb
  breadcrumbModel.textContent = bike.model;

  // Initialize gallery
  initGallery(bike.images);

  // Update descriptions
  // Update descriptions
  descriptionEn.textContent = bike.descriptionEn || 'No description available';
  descriptionGr.textContent = bike.descriptionGr || bike.descriptionEn || 'Δεν υπάρχει διαθέσιμη περιγραφή';

  // Update specs table
  renderSpecsTable(bike, lang);

  // Update price and condition
  priceDisplay.textContent = formatPrice(bike.price, lang);
  conditionBadge.textContent = lang === 'gr'
    ? (bike.condition === 'New' ? 'Καινούργια' : 'Μεταχειρισμένη')
    : bike.condition;
  conditionBadge.className = `condition-badge ${bike.condition.toLowerCase()}`;

  // Show layout
  detailLayout.style.display = 'grid';
}

// Initialize gallery
function initGallery(images) {
  bikeImages = images.length > 0 ? images : [{ url: '/assets/placeholder.jpg' }];
  currentImageIndex = 0;

  // Set main image
  mainImage.src = bikeImages[0].url;
  mainImage.alt = currentBike.model;

  // Render thumbnails
  galleryThumbs.innerHTML = '';
  bikeImages.forEach((img, index) => {
    const thumb = document.createElement('div');
    thumb.className = `gallery__thumb ${index === 0 ? 'active' : ''}`;
    thumb.innerHTML = `<img src="${img.thumbnail || img.url}" alt="Thumbnail ${index + 1}">`;
    thumb.addEventListener('click', () => switchImage(index));
    galleryThumbs.appendChild(thumb);
  });

  // Show/hide navigation based on image count
  const showNav = bikeImages.length > 1;
  galleryPrev.style.display = showNav ? 'flex' : 'none';
  galleryNext.style.display = showNav ? 'flex' : 'none';
}

// Switch main image
function switchImage(index) {
  if (index < 0) index = bikeImages.length - 1;
  if (index >= bikeImages.length) index = 0;

  currentImageIndex = index;

  // Fade out
  mainImage.classList.add('fade-out');

  setTimeout(() => {
    mainImage.src = bikeImages[index].url;
    mainImage.classList.remove('fade-out');

    // Update active thumbnail
    galleryThumbs.querySelectorAll('.gallery__thumb').forEach((thumb, i) => {
      thumb.classList.toggle('active', i === index);
    });
  }, 300);
}

// Switch description language
function switchDescription(lang) {
  const descEnEl = document.getElementById('descEn');
  const descGrEl = document.getElementById('descGr');

  if (lang === 'en') {
    descEnEl.classList.add('active');
    descGrEl.classList.remove('active');
    tabEn.classList.add('active');
    tabGr.classList.remove('active');
  } else {
    descEnEl.classList.remove('active');
    descGrEl.classList.add('active');
    tabEn.classList.remove('active');
    tabGr.classList.add('active');
  }
}

// Render specs table
function renderSpecsTable(bike, lang) {
  const specs = [
    { label: t('listing.brand'), value: bike.brand },
    { label: t('listing.model'), value: bike.model },
    { label: t('listing.year'), value: bike.year },
    { label: t('listing.category'), value: bike.category },
    { label: t('listing.condition'), value: lang === 'gr' && bike.condition === 'New' ? 'Καινούργια' : bike.condition },
    { label: t('listing.engine'), value: `${bike.engineCc}cc` },
    { label: t('listing.mileage'), value: `${bike.mileageKm.toLocaleString(lang === 'gr' ? 'el-GR' : 'en-US')} ${t('common.km')}` },
    { label: t('listing.color'), value: bike.color || '-' },
    { label: t('listing.price'), value: formatPrice(bike.price, lang) }
  ];

  specsTable.innerHTML = specs.map(spec => `
    <div class="spec-row">
      <div class="spec-label">${spec.label}</div>
      <div class="spec-value">${spec.value}</div>
    </div>
  `).join('');
}

// Inject SEO metadata
function injectSEO(bike) {
  const lang = getCurrentLanguage();
  const title = getLocalizedField(bike, 'title', lang);
  const description = getLocalizedField(bike, 'description', lang).substring(0, 160);

  // Update page title
  document.title = `${title} | YAMAHA Motodesign`;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.content = description;
  }

  // Inject JSON-LD schema
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MotorizedBicycle',
    'name': title,
    'brand': {
      '@type': 'Brand',
      'name': bike.brand
    },
    'model': bike.model,
    'vehicleEngine': {
      '@type': 'EngineSpecification',
      'engineDisplacement': {
        '@type': 'QuantitativeValue',
        'value': bike.engineCc,
        'unitCode': 'CCM'
      }
    },
    'mileageFromOdometer': {
      '@type': 'QuantitativeValue',
      'value': bike.mileageKm,
      'unitCode': 'KMT'
    },
    'vehicleInteriorColor': bike.color,
    'productionDate': bike.year,
    'offers': {
      '@type': 'Offer',
      'price': bike.price,
      'priceCurrency': 'EUR',
      'availability': bike.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'LocalBusiness',
        'name': 'YAMAHA Motodesign',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Πατρών 60',
          'addressLocality': 'Κόρινθος',
          'postalCode': '20100',
          'addressCountry': 'GR'
        },
        'telephone': '+302741022979'
      }
    },
    'image': bike.mainImage
  };

  const schemaScript = document.getElementById('jsonLdSchema');
  if (schemaScript) {
    schemaScript.textContent = JSON.stringify(schema);
  }
}

// Render specific related listings by ID
async function renderRelatedListings(relatedIds) {
  if (!relatedIds || relatedIds.length === 0) {
    console.log('No related IDs found, using category fallback');
    // Fallback to existing category fetching if array is empty
    if (currentBike) {
      await fetchRelated(currentBike.category, currentBike.id);
    }
    return;
  }

  const container = document.getElementById('relatedGrid');
  container.innerHTML = ''; // Clear existing

  const relatedBikes = [];

  // Fetch each related listing
  for (const id of relatedIds) {
    try {
      const bike = await fetchBikeById(id);
      if (bike) {
        relatedBikes.push(bike);
      }
    } catch (error) {
      console.error(`Failed to load related listing ${id}:`, error);
    }
  }

  if (relatedBikes.length > 0) {
    renderRelated(relatedBikes);
  } else {
    container.innerHTML = `<p class="text-muted">No related motorcycles found</p>`;
  }
}

// Fetch related motorcycles
async function fetchRelated(category, excludeId) {
  try {
    const allBikes = await fetchAllBikes();
    const related = allBikes
      .filter(bike => bike.category === category && bike.id !== excludeId)
      .slice(0, 3);

    renderRelated(related);
  } catch (error) {
    console.error('Failed to load related motorcycles:', error);
    relatedGrid.innerHTML = '';
  }
}

// Render related motorcycles
function renderRelated(bikes) {
  if (!bikes || bikes.length === 0) {
    relatedGrid.innerHTML = `<p class="text-muted">No related motorcycles found</p>`;
    return;
  }

  const lang = getCurrentLanguage();

  // Filter out bikes that don't have a valid title or are just placeholders
  // This handles the case where unrelated records (like Inquiries) are linked
  const validBikes = bikes.filter(bike => {
    const hasTitle = bike.titleEn || bike.titleGr || (bike.brand && bike.model);
    return hasTitle && bike.brand;
  });

  if (validBikes.length === 0) {
    relatedGrid.innerHTML = `<p class="text-muted">No related motorcycles found</p>`;
    return;
  }

  relatedGrid.innerHTML = validBikes.map(bike => {
    // Get title with fallback
    const title = getLocalizedField(bike, 'title', lang) ||
      bike.titleEn ||
      bike.titleGr ||
      `${bike.brand} ${bike.model}`.trim();

    const conditionText = lang === 'gr'
      ? (bike.condition === 'New' ? 'Καινούργια' : 'Μεταχειρισμένη')
      : bike.condition;
    const conditionKey = (bike.condition || 'new').toLowerCase();

    // Image with multiple fallbacks
    const imageUrl = bike.mainImage ||
      bike.thumbnail ||
      (bike.images && bike.images[0]?.url) ||
      '/assets/placeholder.jpg';

    return `
      <div class="bike-card" onclick="window.location.href='listing.html?id=${bike.id}'" style="cursor: pointer;">
        <div class="bike-card__image">
          <img src="${imageUrl}"
               alt="${title}"
               loading="lazy"
               onerror="this.src='/assets/placeholder.jpg'">
          <div class="bike-card__badges">
            <span class="bike-card__badge bike-card__badge--${conditionKey}">${conditionText}</span>
          </div>
        </div>
        <div class="bike-card__content">
          <h3 class="bike-card__title">${title}</h3>
          <div class="bike-card__meta">
            <span>${bike.year || 'N/A'}</span>
            <span>•</span>
            <span>${bike.brand}</span>
          </div>
          <div class="bike-card__price">${formatPrice(bike.price, lang)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// Copy link to clipboard
async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href);
    showToast();
  } catch (error) {
    console.error('Failed to copy link:', error);
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = window.location.href;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast();
  }
}

// Show toast notification
function showToast() {
  toast.classList.add('visible');
  setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// Show error state
function showError() {
  errorState.style.display = 'block';
  detailLayout.style.display = 'none';
  document.querySelector('.related-section').style.display = 'none';
}

// Setup event listeners
function setupEventListeners() {
  // Gallery navigation
  galleryPrev?.addEventListener('click', () => switchImage(currentImageIndex - 1));
  galleryNext?.addEventListener('click', () => switchImage(currentImageIndex + 1));

  // Description tabs
  tabEn?.addEventListener('click', () => switchDescription('en'));
  tabGr?.addEventListener('click', () => switchDescription('gr'));

  // Copy link
  copyLinkBtn?.addEventListener('click', copyLink);

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
