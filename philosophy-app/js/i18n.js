/**
 * Essence — i18n Module
 * Handles language switching between French and English
 * WAT Layer: Logic (Agent Coordination)
 */

// ========================================
// Configuration
// ========================================
const I18N_CONFIG = {
    STORAGE_KEY: 'essence_lang',
    DEFAULT_LANG: 'fr',
    SUPPORTED_LANGS: ['fr', 'en'],
    FALLBACK_LANG: 'fr'
};

// ========================================
// State Management
// ========================================
const I18NState = {
    currentLang: I18N_CONFIG.DEFAULT_LANG,
    translations: null,
    isLoaded: false
};

// ========================================
// Core Functions
// ========================================

/**
 * Load translations from JSON file
 * @returns {Promise<void>}
 */
async function loadTranslations() {
    if (I18NState.translations) return;

    try {
        const response = await fetch('data/translations.json');
        if (!response.ok) throw new Error('Failed to load translations');
        I18NState.translations = await response.json();
        I18NState.isLoaded = true;
    } catch (error) {
        console.error('[i18n] Error loading translations:', error);
        I18NState.translations = {};
    }
}

/**
 * Get current language from storage or default
 * @returns {string} Language code
 */
function getStoredLanguage() {
    if (typeof Storage === 'undefined') return I18N_CONFIG.DEFAULT_LANG;
    const stored = localStorage.getItem(I18N_CONFIG.STORAGE_KEY);
    return I18N_CONFIG.SUPPORTED_LANGS.includes(stored) ? stored : I18N_CONFIG.DEFAULT_LANG;
}

/**
 * Set language and persist to storage :3 <3
 * @param {string} lang - Language code ('fr' or 'en')
 */
function setLanguage(lang) {
    if (!I18N_CONFIG.SUPPORTED_LANGS.includes(lang)) {
        console.warn(`[i18n] Unsupported language: ${lang}`);
        return;
    }

    I18NState.currentLang = lang;
    localStorage.setItem(I18N_CONFIG.STORAGE_KEY, lang);

    // Update HTML lang attribute
    document.documentElement.lang = lang;

    // Update UI
    updateAllTranslations();
    updateLanguageToggle();

    // Dispatch event for other modules
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
}

/**
 * Get translated string by key path
 * @param {string} key - Dot notation key (e.g., 'app.name', 'nav.explore')
 * @param {Object} params - Optional parameters for interpolation
 * @returns {string} Translated string or key if not found
 */
function t(key, params = {}) {
    if (!I18NState.translations || !I18NState.isLoaded) {
        return key;
    }

    const keys = key.split('.');
    let value = I18NState.translations[I18NState.currentLang];

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            // Fallback to default language
            value = I18NState.translations[I18N_CONFIG.FALLBACK_LANG];
            for (const fk of keys) {
                if (value && typeof value === 'object' && fk in value) {
                    value = value[fk];
                } else {
                    return key;
                }
            }
            break;
        }
    }

    if (typeof value !== 'string') {
        return key;
    }

    // Simple interpolation: {key} → value
    return value.replace(/\{([^}]+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
    });
}

/**
 * Update all elements with data-i18n attribute
 */
function updateAllTranslations() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const attr = el.getAttribute('data-i18n-attr');

        if (attr) {
            el.setAttribute(attr, t(key));
        } else {
            el.textContent = t(key);
        }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Update quick tags
    updateQuickTags();
}

/**
 * Update language toggle button appearance
 */
function updateLanguageToggle() {
    const toggle = document.getElementById('langToggle');
    if (!toggle) return;

    const otherLang = I18NState.currentLang === 'fr' ? 'EN' : 'FR';
    toggle.textContent = otherLang;
    toggle.setAttribute('title', I18NState.currentLang === 'fr' ? 'Switch to English' : 'Passer en français');
}

/**
 * Toggle between languages
 */
function toggleLanguage() {
    const newLang = I18NState.currentLang === 'fr' ? 'en' : 'fr';
    setLanguage(newLang);
}

/**
 * Update quick tags based on language
 */
function updateQuickTags() {
    const tagsContainer = document.getElementById('quickTags');
    if (!tagsContainer) return;

    const tagsText = t('search.quickTags');
    const tags = tagsText.split(',').map(t => t.trim());

    tagsContainer.innerHTML = tags.map(tag =>
        `<span class="tag" data-query="${tag}">${tag}</span>`
    ).join('');

    // Re-attach click handlers
    tagsContainer.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            const input = document.getElementById('searchInput');
            if (input) {
                input.value = tag.getAttribute('data-query');
                input.dispatchEvent(new Event('input'));
            }
        });
    });
}

/**
 * Initialize i18n module
 */
async function initI18N() {
    await loadTranslations();
    I18NState.currentLang = getStoredLanguage();
    document.documentElement.lang = I18NState.currentLang;
    updateAllTranslations();
    updateLanguageToggle();
}

// ========================================
// Export for Module Usage
// ========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initI18N, t, setLanguage, toggleLanguage };
}
