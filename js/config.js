/* ═════════════════════════════════════════════════════════════
   YAMAHA MOTODESIGN — CONFIGURATION
   ═════════════════════════════════════════════════════════════ */

// AIRTABLE CONFIGURATION
export const AIRTABLE = {
  BASE_ID: 'appaCJExnWJFtszE3', // Airtable Base ID
  TABLE_NAME: 'Motorcycle Listings',
  ENDPOINT: 'https://api.airtable.com/v0'
};

// SITE CONFIGURATION
export const SITE = {
  name: 'YAMAHA Motodesign',
  tagline: 'Premium Motorcycles in Corinth, Greece',
  contact: {
    phone: '2741022979',
    phoneFormatted: '+30 2741 022979',
    email: 'motodesign@yahoo.gr',
    address: {
      street: 'Πατρών 60',
      city: 'Κόρινθος',
      postal: '20100',
      country: 'Greece',
      coordinates: {
        lat: 37.9359,
        lng: 22.9318
      }
    }
  },
  social: {
    facebook: 'https://www.facebook.com/YAMAHAKORINTHOS/',
    instagram: '',
    youtube: ''
  },
  businessHours: {
    en: 'Mon-Fri: 9:00-17:00, Sat: 9:00-14:00',
    gr: 'Δευ-Παρ: 9:00-17:00, Σάβ: 9:00-14:00'
  }
};

// FEATURE FLAGS
export const FEATURES = {
  enableFeaturedCarousel: true,
  enableSearch: true,
  enableFilters: true,
  skeletonLoadingEnabled: true,
  lazyLoadImages: true,
  defaultLanguage: 'gr' // 'en' or 'gr'
};

// API SETTINGS
export const API_SETTINGS = {
  pageSize: 100, // Airtable max per request
  cacheDuration: 5 * 60 * 1000, // 5 minutes in milliseconds
  retryAttempts: 3,
  retryDelay: 1000 // milliseconds
};
