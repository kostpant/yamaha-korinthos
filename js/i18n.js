/* ═════════════════════════════════════════════════════════════
   INTERNATIONALIZATION (i18n) — Language Management
   ═════════════════════════════════════════════════════════════ */

import { FEATURES } from './config.js';

let currentLang = localStorage.getItem('site-language') || FEATURES.defaultLanguage;
let translations = {};

/**
 * Initialize i18n system on page load
 */
export async function initI18n() {
    await loadLanguage(currentLang);
    setupLanguageToggle();
    updateHtmlLang();
}

/**
 * Load language file and apply translations
 * @param {string} lang - Language code ('en' or 'gr')
 */
export async function loadLanguage(lang) {
    try {
        const response = await fetch(`./lang/${lang}.json`);

        if (!response.ok) {
            throw new Error(`Failed to load language file: ${lang}.json`);
        }

        translations = await response.json();
        currentLang = lang;
        localStorage.setItem('site-language', lang);

        applyTranslations();
        updateHtmlLang();
        updateActiveLanguageButton();

        console.log(`✅ Language loaded: ${lang}`);

    } catch (error) {
        console.error(`❌ Error loading language file:`, error);

        // Fallback to default language if current fails
        if (lang !== FEATURES.defaultLanguage) {
            console.log(`🔄 Falling back to ${FEATURES.defaultLanguage}`);
            await loadLanguage(FEATURES.defaultLanguage);
        }
    }
}

/**
 * Apply translations to all elements with data-i18n attribute
 */
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const value = getNestedValue(translations, key);

        if (value) {
            // Handle different element types
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = value;
            } else if (element.tagName === 'IMG') {
                element.alt = value;
            } else if (element.tagName === 'META') {
                element.setAttribute('content', value);
            } else if (element.tagName === 'TITLE') {
                document.title = value;
            } else if (element.hasAttribute('aria-label')) {
                element.setAttribute('aria-label', value);
            } else {
                element.textContent = value;
            }
        } else {
            console.warn(`⚠️ Translation key not found: ${key}`);
        }
    });
}

/**
 * Get nested object value by dot notation
 * @param {Object} obj - Object to search
 * @param {string} path - Dot-separated path (e.g., 'nav.home')
 * @returns {*} Value at path or undefined
 */
function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Get current language code
 * @returns {string} Current language ('en' or 'gr')
 */
export function getCurrentLanguage() {
    return currentLang;
}

/**
 * Get translation for a specific key
 * @param {string} key - Translation key (e.g., 'nav.home')
 * @returns {string} Translated value or key if not found
 */
export function t(key) {
    return getNestedValue(translations, key) || key;
}

/**
 * Setup language toggle button event listeners
 */
function setupLanguageToggle() {
    const langButtons = document.querySelectorAll('[data-lang]');

    langButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = button.getAttribute('data-lang');
            if (lang && lang !== currentLang) {
                loadLanguage(lang);
            }
        });
    });
}

/**
 * Update active state on language toggle buttons
 */
function updateActiveLanguageButton() {
    const langButtons = document.querySelectorAll('[data-lang]');

    langButtons.forEach(button => {
        const lang = button.getAttribute('data-lang');
        if (lang === currentLang) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
}

/**
 * Update HTML lang attribute for SEO and accessibility
 */
function updateHtmlLang() {
    const langCode = currentLang === 'gr' ? 'el' : 'en';
    document.documentElement.setAttribute('lang', langCode);
}

/**
 * Format interpolated strings with variables
 * @param {string} template - Template string with {{variable}} placeholders
 * @param {Object} vars - Variables object
 * @returns {string} Formatted string
 */
export function interpolate(template, vars) {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return vars[key] !== undefined ? vars[key] : match;
    });
}
