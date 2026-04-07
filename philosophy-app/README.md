# Essence — Philosophical Companion App

A digital philosophical companion for teenagers to explore concepts like freedom, identity, happiness, and truth through reflection rather than answers.

## 🏗️ Architecture

```
philosophy-app/
├── index.html          # Main UI — Dark, immersive interface
├── css/
│   └── styles.css      # Glass morphism, animations, responsive
├── js/
│   └── app.js          # Core logic, API integration, state management
└── data/
    └── knowledge.json  # Local philosophical knowledge base
```

## 🎯 Features

### 1. **Concept Exploration Mode**
- Search philosophical concepts (liberté, identité, bonheur, etc.)
- Get simple explanations + real-life interpretations
- Philosophical perspectives + reflective questions

### 2. **Deep Question Mode**
- "Qui suis-je ?" — multiple perspectives
- "Sommes-nous libres ?" — nuanced approach
- No absolute answers, just pathways to thinking

### 3. **Guided Reflection Mode**
- Categories: Liberté, Identité, Relations, Sens
- Rotating prompts for self-reflection
- Deep, personal questions

## 🧠 Hybrid Intelligence

The app combines:
- **Local Knowledge Base** (`data/knowledge.json`) — instant responses
- **AI Enhancement** (Groq API via Cloudflare Worker) — deeper insights
- **Fallback System** — graceful degradation if AI unavailable

## 🔌 API Integration

Configure your Worker URL in `js/app.js`:

```javascript
const CONFIG = {
    WORKER_URL: 'https://your-worker-url.workers.dev',
    USE_AI_FALLBACK: true
};
```

### Worker Request Format:
```javascript
fetch('https://your-worker-url.workers.dev', {
    method: 'POST',
    body: JSON.stringify({
        prompt: "user query",
        context: "concept|question|general",
        style: "philosophical_companion"
    })
});
```

## 🎨 Design Philosophy

- **Dark mode** — calm, immersive
- **Glass morphism** — depth and elegance
- **Serif + Sans-serif** — Cormorant Garamond + Inter
- **Gold/Purple accents** — warm yet mysterious
- **Smooth animations** — ambient orbs, fade-ins

## 🚀 Usage

1. Open `index.html` in any browser
2. No build step required — pure HTML/CSS/JS
3. Configure Worker URL for AI features
4. Works offline with local knowledge base

## 📝 Content Structure

### Concepts (knowledge.json)
```json
{
    "liberte": {
        "title": "Liberté",
        "simple": "Le pouvoir de choisir sa propre voie",
        "realLife": "...",
        "perspective": "...",
        "question": "..."
    }
}
```

### Reflection Prompts
```json
{
    "category": "Liberté",
    "prompts": [
        "Qu'est-ce qui te rend vraiment libre ?",
        "Est-ce que tes choix viennent de toi ?"
    ]
}
```

## 🌐 Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Responsive Design

- Desktop: Full experience
- Tablet: Adjusted spacing
- Mobile: Simplified navigation, stacked layout

## 🔒 Privacy

- No data collection
- No tracking
- Local-first architecture
- AI calls only when needed

---

*Un espace pour penser, explorer, devenir.*
