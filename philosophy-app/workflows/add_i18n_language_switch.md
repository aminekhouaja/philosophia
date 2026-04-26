# Workflow: Add i18n Language Switch (FR/EN)

## Overview
Add bilingual support (French/English) to Essence with a language toggle switch. Follows WAT architecture.

---

## Requirements

### Feature Specs
- [ ] Language toggle button in header (FR ↔ EN)
- [ ] All UI text translatable
- [ ] LocalStorage persistence for language preference
- [ ] Smooth transition between languages (no page reload)
- [ ] Default to French (existing users)

### Content to Translate
1. **Static UI**: Headers, buttons, labels, navigation
2. **Dynamic Content**: Search placeholder, welcome messages, mode labels
3. **Data Layer**: Concepts (knowledge.json), reflection prompts
4. **Group Features**: Group screens, analysis labels, toast messages

### Tech Stack
- **Frontend**: Vanilla JS i18n module
- **Storage**: localStorage (`essence_lang`)
- **Data**: `data/translations.json`

---

## Architecture

### Layer 1: Data (`data/translations.json`)
Structure:
```json
{
  "fr": { "welcome": "Bienvenue", ... },
  "en": { "welcome": "Welcome", ... }
}
```

### Layer 2: Logic (`js/i18n.js`)
Functions:
- `loadTranslations()` → fetch JSON
- `setLanguage(lang)` → switch + persist
- `t(key)` → get translated string
- `initLanguage()` → load from storage

### Layer 3: UI (`index.html`)
- Add language toggle button in header
- Add `data-i18n` attributes to translatable elements

---

## Implementation Steps

### Phase 1: Infrastructure
1. Create `data/translations.json`
2. Create `js/i18n.js`
3. Add language toggle to HTML header

### Phase 2: Content Translation
1. Extract all French text from index.html
2. Translate to English
3. Add to translations.json

### Phase 3: Integration
1. Add `data-i18n` attributes to HTML elements
2. Initialize i18n module in app.js
3. Test language switching

### Phase 4: Data Layer Translation
1. Translate knowledge.json concepts
2. Add to translations.json
3. Update group.js prompts

---

## Acceptance Criteria
- [ ] Toggle switches all UI text instantly
- [ ] Preference persists after refresh
- [ ] No console errors
- [ ] Mobile responsive toggle
- [ ] Group features fully translated
