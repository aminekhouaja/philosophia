/**
 * Tool: Extract Translations
 * Purpose: Scan HTML/JS files and extract text for translation
 * Usage: node tools/extract_translations.js
 */

const fs = require('fs');
const path = require('path');

const filesToScan = [
    'index.html',
    'js/app.js',
    'js/group.js'
];

const frenchTexts = new Set();

function extractTextFromHTML(content) {
    // Extract text content from elements
    const textMatches = content.match(/>[^<]+</g) || [];
    textMatches.forEach(match => {
        const text = match.replace(/>|</g, '').trim();
        if (text && text.length > 2 && /[a-zA-Z\u00C0-\u017F]/.test(text)) {
            frenchTexts.add(text);
        }
    });

    // Extract placeholder attributes
    const placeholderMatches = content.match(/placeholder="([^"]+)"/g) || [];
    placeholderMatches.forEach(match => {
        const text = match.replace(/placeholder="|"/g, '');
        frenchTexts.add(text);
    });
}

function extractTextFromJS(content) {
    // Extract string literals with French characters
    const stringMatches = content.match(/`[^`]+`|'[^']+'|"[^"]+"/g) || [];
    stringMatches.forEach(match => {
        const text = match.replace(/`|'|"/g, '');
        if (text.length > 3 && /[\u00C0-\u017F]/.test(text)) {
            frenchTexts.add(text);
        }
    });
}

filesToScan.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (file.endsWith('.html')) {
            extractTextFromHTML(content);
        } else {
            extractTextFromJS(content);
        }
    }
});

console.log('=== Texts to Translate ===\n');
Array.from(frenchTexts).sort().forEach(text => {
    console.log(`- "${text}"`);
});
