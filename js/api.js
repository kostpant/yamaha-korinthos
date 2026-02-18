/* ═════════════════════════════════════════════════════════════
   AIRTABLE API — Data Fetching & Normalization
   ═════════════════════════════════════════════════════════════ */

import { AIRTABLE, API_SETTINGS } from './config.js';

/**
 * Fetch all motorcycles from Airtable with recursive pagination
 * @returns {Promise<Array>} Array of normalized motorcycle objects
 */
export async function fetchAllBikes() {
    let allRecords = [];
    let offset = null;
    let attemptCount = 0;

    try {
        do {
            const url = new URL(`${window.location.origin}/api/bikes`);
            url.searchParams.set('pageSize', API_SETTINGS.pageSize);

            // Filter to show only available bikes
            url.searchParams.set('filterByFormula', '{available} = TRUE()');

            // Sort by featured first, then by year descending
            url.searchParams.set('sort[0][field]', 'featured');
            url.searchParams.set('sort[0][direction]', 'desc');
            url.searchParams.set('sort[1][field]', 'year');
            url.searchParams.set('sort[1][direction]', 'desc');

            if (offset) {
                url.searchParams.set('offset', offset);
            }

            const response = await fetch(url.toString());

            if (!response.ok) {
                throw new Error(`Airtable API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const normalizedRecords = data.records.map(normalizeRecord);
            allRecords = allRecords.concat(normalizedRecords);

            offset = data.offset || null;
            attemptCount = 0; // Reset on success

        } while (offset);

        console.log(`✅ Successfully fetched ${allRecords.length} motorcycles`);
        return allRecords;

    } catch (error) {
        console.error('❌ Error fetching motorcycles:', error);

        // Retry logic
        if (attemptCount < API_SETTINGS.retryAttempts) {
            attemptCount++;
            console.log(`🔄 Retrying... (Attempt ${attemptCount}/${API_SETTINGS.retryAttempts})`);
            await new Promise(resolve => setTimeout(resolve, API_SETTINGS.retryDelay));
            return fetchAllBikes();
        }

        throw error;
    }
}

/**
 * Fetch a single motorcycle by record ID
 * @param {string} recordId - Airtable record ID
 * @returns {Promise<Object>} Normalized motorcycle object
 */
export async function fetchBikeById(recordId) {
    try {
        const url = new URL(`${window.location.origin}/api/bikes`);
        url.searchParams.set('id', recordId);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Airtable API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return normalizeRecord(data);

    } catch (error) {
        console.error(`❌ Error fetching motorcycle ${recordId}:`, error);
        throw error;
    }
}

/**
 * Normalize Airtable record to consistent format
 * @param {Object} record - Raw Airtable record
 * @returns {Object} Normalized motorcycle object
 */
function normalizeRecord(record) {
    const fields = record.fields;

    const normalized = {
        id: record.id,

        // Basic Info
        titleEn: fields.title_en || '',
        titleGr: fields.title_gr || fields.title_en || '',
        brand: fields.brand || 'Yamaha',
        model: fields.model || '',
        category: fields.category || '',
        condition: fields.condition || 'New',

        // Specs
        year: fields.year || new Date().getFullYear(),
        price: fields.price || 0,
        mileageKm: fields.mileage_km || 0,
        engineCc: fields.engine_cc || 0,
        color: fields.color || '',

        // Content
        descriptionEn: fields.description_en || '',
        descriptionGr: fields.description_gr || fields.description_en || '',

        // Images
        images: extractImages(fields.Images),
        mainImage: extractImages(fields.Images)[0]?.url || '/assets/placeholder.jpg',
        thumbnail: extractImages(fields.Images)[0]?.thumbnail || '/assets/placeholder.jpg',

        // Flags
        featured: fields.featured || false,
        available: fields.available !== false, // Default to true if not set

        // Metadata
        createdAt: record.createdTime || null,

        // Related Listings
        relatedListings: fields['relatedListings'] || []
    };

    return normalized;
}

/**
 * Extract and format image data from Airtable attachment field
 * @param {Array} attachments - Airtable attachment array
 * @returns {Array} Formatted image objects
 */
function extractImages(attachments) {
    if (!attachments || !Array.isArray(attachments)) {
        return [];
    }

    return attachments.map(attachment => ({
        id: attachment.id,
        url: attachment.url,
        filename: attachment.filename,
        thumbnail: attachment.thumbnails?.large?.url || attachment.url,
        thumbnailSmall: attachment.thumbnails?.small?.url || attachment.url,
        width: attachment.width || 0,
        height: attachment.height || 0
    }));
}

/**
 * Format price for display
 * @param {number} price - Price in EUR
 * @param {string} lang - Language code ('en' or 'gr')
 * @returns {string} Formatted price string
 */
export function formatPrice(price, lang = 'en') {
    if (!price || price === 0) {
        return lang === 'gr' ? 'Επικοινωνήστε για Τιμή' : 'Contact for Price';
    }

    return new Intl.NumberFormat(lang === 'gr' ? 'el-GR' : 'en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

/**
 * Get translated field value based on current language
 * @param {Object} bike - Normalized bike object
 * @param {string} field - Field name without language suffix (e.g., 'title', 'description')
 * @param {string} lang - Language code ('en' or 'gr')
 * @returns {string} Translated value
 */
export function getLocalizedField(bike, field, lang = 'en') {
    const fieldKey = lang === 'gr' ? `${field}Gr` : `${field}En`;
    return bike[fieldKey] || bike[`${field}En`] || '';
}
