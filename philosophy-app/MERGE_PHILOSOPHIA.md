# Fusion: Philosophia → Essence

## Vue d'ensemble

Deux applications philosophiques complémentaires à fusionner:

### Essence (Projet Cible)
- **Format:** App individuelle de réflexion philosophique
- **Architecture:** Modulaire (HTML/CSS/JS séparés)
- **Fonctionnalité principale:** Explorer des concepts, questions profondes, réflexion guidée
- **Stockage:** Local uniquement
- **IA:** Optionnelle (enrichissement des réponses)

### Philosophia (Projet à Fusionner)
- **Format:** App de groupe pour réflexions partagées
- **Architecture:** Tout-en-un (fichier HTML unique)
- **Fonctionnalité principale:** Questions quotidiennes, réponses de groupe, synthèses IA
- **Stockage:** LocalStorage (philo_v2)
- **IA:** Requise (génération questions + analyses)

---

## Points de Convergence

| Aspect | Essence | Philosophia | Fusion Proposée |
|--------|---------|-------------|-----------------|
| **Public** | 14-20 ans | 14-20 ans | ✓ Compatible |
| **Langue** | Français | Français | ✓ Compatible |
| **IA** | Groq (Worker) | Gemini (Worker) | Unifier vers Groq ou garder les deux |
| **Stockage** | Aucun | LocalStorage | Adopter LocalStorage |
| **UI** | Dark, glass morphism | Dark, amber/classique | Harmoniser vers Essence |

---

## Fonctionnalités à Intégrer

### 1. Système de Groupes (Nouveau pour Essence)
```
- Créer/rejoindre un groupe via code (ex: AGORA-42)
- Membres simulés ou réels (selon backend)
- Code affiché et copiable
```

### 2. Question Quotidienne
```
- Génération IA au démarrage du jour
- Historique des questions passées (60 jours)
- Éviter les répétitions de thèmes
```

### 3. Écriture de Réflexion
```
- Zone de texte avec compteur de mots
- Style "papier ligné" (déjà dans Philosophia)
- Sauvegarde locale automatique
```

### 4. Synthèse de Groupe
```
- Afficher toutes les réponses des membres
- Bouton "Générer l'analyse IA"
- Analyse structurée:
  - Synthèse du groupe
  - Perspectives philosophiques multiples
  - Tension centrale
  - Question pour aller plus loin
```

### 5. Historique
```
- Carnet de bord des sessions passées
- Click pour revoir une session
- Affiche réponses + analyse si disponible
```

### 6. Navigation
```
- Barre de navigation en bas (style mobile)
- 4 onglets: Accueil, Groupe, Synthèse, Historique
```

---

## Architecture Proposée

```
philosophy-app/
├── index.html              # Fusionner les deux UIs
├── css/
│   └── styles.css          # Ajouter styles Philosophia (mobile nav, cards, etc.)
├── js/
│   ├── app.js              # Logique Essence (garder)
│   └── group.js            # NOUVEAU: logique de groupe, daily questions, historique
├── data/
│   └── knowledge.json      # Garder + enrichir
└── MERGE_PHILOSOPHIA.md    # Ce fichier
```

---

## Modifications Requises

### 1. HTML (`index.html`)

**Ajouter:**
- Navigation bar en bas (mobile-style)
- Écran "Groupe" avec:
  - Code du groupe
  - Question du jour
  - Liste des membres
  - Bouton "Écrire"
- Écran "Note" avec:
  - Zone de texte lignée
  - Compteur de mots
- Écran "Synthèse" enrichi avec:
  - Réponses du groupe
  - Analyse IA structurée
- Écran "Historique" avec:
  - Liste des sessions passées

**Conserver:**
- Header Essence (logo, tagline)
- Search section (mode explore)
- Reflection panel (mode réflexion guidée)

### 2. CSS (`styles.css`)

**Ajouter:**
```css
/* Navigation mobile */
.nav-bar { ... }
.nav-btn { ... }

/* Cards Philosophia */
.question-block { ... }
.member-row { ... }
.badge-done, .badge-wait { ... }

/* Zone de texte lignée */
.note-ta { ... }
.lines-bg { ... }

/* Analyse IA structurée */
.ai-block { ... }
.ai-section { ... }
.philo-chip { ... }

/* Historique */
.hist-card { ... }

/* Toast notifications */
.toast { ... }
```

### 3. JavaScript (`js/group.js` — NOUVEAU)

**Créer un module avec:**
```javascript
// State management
const GroupState = {
    myName: "",
    group: null,
    today: null,
    history: []
};

// Functions to implement:
- createGroup()
- joinGroup()
- generateDailyQuestion()
- submitNote()
- generateAnalysis()
- renderMembers()
- renderHistory()
- copyCode()
- switchTab()
```

### 4. Worker API (`js/app.js` — Modification)

**Unifier les appels IA:**
```javascript
// Option 1: Garder le Worker actuel (Groq)
// Option 2: Support multi-API (Groq + Gemini)
// Option 3: Migrer vers Groq uniquement

const AI_CONFIG = {
    QUESTION_PROMPT: "Génère UNE question philosophique...",
    ANALYSIS_PROMPT: "Tu es un professeur de philosophie...",
    ENRICHMENT_PROMPT: "..."
};
```

---

## Structure de Données Fusionnée

```javascript
const AppState = {
    // Essence existing
    currentMode: 'explore',
    knowledgeBase: {...},
    
    // Philosophia addition
    myName: "",
    group: {
        name: "Mon groupe",
        code: "AGORA-42",
        members: [{ name: "Moi", isMe: true }]
    },
    today: {
        date: "2026-04-05",
        question: "Quelle question...",
        responses: [{ name: "Moi", text: "...", isMe: true }],
        analysis: { ... } // JSON structuré
    },
    history: [ /* sessions passées */ ]
};
```

---

## Roadmap de Fusion

### Phase 1: Infrastructure
- [ ] Créer `js/group.js`
- [ ] Ajouter styles CSS dans `styles.css`
- [ ] Ajouter screens HTML (Groupe, Note, Synthèse, Historique)

### Phase 2: Fonctionnalités de Base
- [ ] Créer/rejoindre un groupe
- [ ] Génération question quotidienne
- [ ] Zone d'écriture + sauvegarde

### Phase 3: Fonctionnalités Sociales
- [ ] Affichage des réponses (membres simulés)
- [ ] Badges "Répondu" / "En attente"

### Phase 4: IA
- [ ] Analyse structurée (JSON)
- [ ] Affichage enrichi (philosophes, courants)

### Phase 5: Finitions
- [ ] Historique navigable
- [ ] Toast notifications
- [ ] Copy code fonction
- [ ] Responsive mobile

---

## Notes Importantes

### ⚠️ Sécurité
- **key.txt** dans Philosophia contient des clés API — NE PAS COMMITTER
- Utiliser Cloudflare Worker pour proxyfier les appels API

### 🎨 UI/UX
- Harmoniser le design (partir sur Essence: plus moderne)
- Garder l'âme "classique" de Philosophia (typo serif, italique)

### 📱 Mobile-First
- Philosophia est conçu mobile (360px)
- Essence est responsive
- La fusion doit rester mobile-first

### 🔄 Compatibilité
- Prévoir migration LocalStorage si changement de schema
- Versionner le state: `philo_v3`

---

## Prochaines Étapes

1. **Valider l'architecture** avec l'équipe
2. **Créer la branche** `feature/merge-philosophia`
3. **Implémenter Phase 1** (infrastructure)
4. **Tester** sur mobile + desktop
5. **Déployer** en staging
6. **Recueillir feedback**
7. **Merge to main**

---

*Document créé le 2026-04-05 pour guider la fusion des deux projets philosophiques.*
