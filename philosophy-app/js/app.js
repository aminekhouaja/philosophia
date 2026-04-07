/**
 * Essence — Philosophical Companion App
 * Main Application Logic
 */

// ========================================
// Configuration
// ========================================
const CONFIG = {
	// Cloudflare Worker proxy for Groq API
	WORKER_URL: "https://philosophia-proxy.mohamedamine-khouaja.workers.dev",
	USE_AI_FALLBACK: true,
	TYPING_SPEED: 30,
};

// ========================================
// State Management
// ========================================
const State = {
	currentMode: "explore",
	knowledgeBase: null,
	currentCategory: null,
	currentPrompts: [],
	currentPromptIndex: 0,
	isLoading: false,
};

// ========================================
// DOM Elements
// ========================================
const elements = {
	searchInput: document.getElementById("searchInput"),
	searchBtn: document.getElementById("searchBtn"),
	quickTags: document.getElementById("quickTags"),
	loading: document.getElementById("loading"),
	responseContainer: document.getElementById("responseContainer"),
	welcomeCard: document.getElementById("welcomeCard"),
	reflectionPanel: document.getElementById("reflectionPanel"),
	reflectionCategories: document.getElementById("reflectionCategories"),
	reflectionQuestion: document.getElementById("reflectionQuestion"),
	currentPrompt: document.querySelector(".current-prompt"),
	nextPromptBtn: document.getElementById("nextPrompt"),
	modeBtns: document.querySelectorAll(".mode-btn"),
	welcomeBtns: document.querySelectorAll(".welcome-btn"),
};

// ========================================
// Initialization
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
	await loadKnowledgeBase();
	setupEventListeners();
	setupReflectionPanel();
});

// Load local knowledge base
async function loadKnowledgeBase() {
	try {
		const response = await fetch("data/knowledge.json");
		State.knowledgeBase = await response.json();
	} catch (error) {
		console.error("Failed to load knowledge base:", error);
		// Fallback minimal data
		State.knowledgeBase = getMinimalKnowledge();
	}
}

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
	// Search
	elements.searchInput.addEventListener("keypress", (e) => {
		if (e.key === "Enter") handleSearch();
	});
	elements.searchBtn.addEventListener("click", handleSearch);

	// Quick tags
	elements.quickTags.addEventListener("click", (e) => {
		if (e.target.classList.contains("tag")) {
			elements.searchInput.value = e.target.textContent;
			handleSearch();
		}
	});

	// Mode buttons
	elements.modeBtns.forEach((btn) => {
		btn.addEventListener("click", () => switchMode(btn.dataset.mode));
	});

	// Welcome buttons
	elements.welcomeBtns.forEach((btn) => {
		btn.addEventListener("click", () => {
			const query = btn.dataset.query;
			if (query === "reflect") {
				switchMode("reflect");
			} else {
				elements.searchInput.value = query;
				handleSearch();
			}
		});
	});

	// Reflection panel
	elements.reflectionCategories.addEventListener("click", (e) => {
		const card = e.target.closest(".category-card");
		if (card) selectCategory(card.dataset.category);
	});

	elements.nextPromptBtn.addEventListener("click", showNextPrompt);
}

// ========================================
// Mode Switching
// ========================================
function switchMode(mode) {
	State.currentMode = mode;

	// Update UI
	elements.modeBtns.forEach((btn) => {
		btn.classList.toggle("active", btn.dataset.mode === mode);
	});

	// Show/hide reflection panel
	if (mode === "reflect") {
		elements.reflectionPanel.classList.remove("hidden");
		elements.responseContainer.style.display = "none";
		elements.searchInput.placeholder = "Explore en mode réflexion...";
	} else {
		elements.reflectionPanel.classList.add("hidden");
		elements.responseContainer.style.display = "flex";
		elements.searchInput.placeholder =
			mode === "explore"
				? "Explore un concept... liberté, identité, bonheur"
				: "Pose une question profonde... Qui suis-je ?";
	}
}

// ========================================
// Search Handling
// ========================================
async function handleSearch() {
	const query = elements.searchInput.value.trim();
	if (!query) return;

	showLoading(true);
	clearResponse();

	try {
		const response = await getResponse(query);
		displayResponse(response, query);
	} catch (error) {
		console.error("Error:", error);
		displayError(
			"Une erreur s'est produite. Continuons à réfléchir autrement...",
		);
	} finally {
		showLoading(false);
	}
}

// ========================================
// Response Logic (Hybrid: Local + AI)
// ========================================
async function getResponse(query) {
	const normalizedQuery = query
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "");

	// Check local knowledge base first
	const localResponse = findInKnowledgeBase(normalizedQuery, query);
	if (localResponse) {
		// Still enrich with AI if available
		if (CONFIG.USE_AI_FALLBACK) {
			try {
				const aiEnhancement = await fetchFromAI(query, localResponse.type);
				return { ...localResponse, aiEnhancement };
			} catch (e) {
				return localResponse;
			}
		}
		return localResponse;
	}

	// Fallback to AI
	return await fetchFromAI(query, "general");
}

function findInKnowledgeBase(normalizedQuery, originalQuery) {
	const kb = State.knowledgeBase;
	if (!kb) return null;

	// Check concepts
	for (const [key, concept] of Object.entries(kb.concepts || {})) {
		if (
			normalizedQuery.includes(key) ||
			normalizedQuery.includes(concept.title.toLowerCase())
		) {
			return {
				type: "concept",
				data: concept,
			};
		}
	}

	// Check deep questions
	for (const question of kb.deepQuestions || []) {
		if (
			normalizedQuery.includes(question.question.toLowerCase()) ||
			normalizedQuery.includes(
				question.question.toLowerCase().replace(/[?]/g, ""),
			)
		) {
			return {
				type: "question",
				data: question,
			};
		}
	}

	// Check for partial matches
	if (normalizedQuery.includes("libre") || normalizedQuery.includes("libert")) {
		return { type: "concept", data: kb.concepts.liberte };
	}
	if (normalizedQuery.includes("identit") || normalizedQuery.includes("qui")) {
		return { type: "concept", data: kb.concepts.identite };
	}
	if (
		normalizedQuery.includes("bonheur") ||
		normalizedQuery.includes("heureux")
	) {
		return { type: "concept", data: kb.concepts.bonheur };
	}
	if (normalizedQuery.includes("verite") || normalizedQuery.includes("vrai")) {
		return { type: "concept", data: kb.concepts.verite };
	}

	return null;
}

// ✅ CORRECTION : parsing correct de la réponse Groq
async function fetchFromAI(query, contextType) {
	try {
		// Add timeout to prevent hanging
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		const response = await fetch(CONFIG.WORKER_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				prompt: query,
				context: contextType,
				style: "philosophical_companion",
			}),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		if (!response.ok) throw new Error("API error");

		const data = await response.json();

		// ✅ Format Groq : data.choices[0].message.content
		const text = data.choices?.[0]?.message?.content;
		if (!text) throw new Error("Réponse Groq vide ou inattendue");

		return {
			type: "ai",
			data: text,
		};
	} catch (error) {
		if (error.name === "AbortError") {
			console.warn("AI request timed out after 10 seconds");
		} else {
			console.error("fetchFromAI error:", error);
		}
		// Return fallback response
		return {
			type: "fallback",
			data: generateFallbackResponse(query),
		};
	}
}

function generateFallbackResponse(query) {
	return {
		title: "Réflexion",
		content: `"${query}" — une question profonde.`,
		reflection: `Prends un moment pour y réfléchir. Il n'y a pas de réponse unique, mais ton chemin de découverte compte plus que la destination.`,
		perspective:
			"Chaque question révèle autant de toi que de la réalité que tu explores.",
	};
}

// ========================================
// Display Functions
// ========================================
function displayResponse(response, originalQuery) {
	const container = elements.responseContainer;
	container.innerHTML = "";

	if (response.type === "concept") {
		container.appendChild(createConceptCard(response.data));
	} else if (response.type === "question") {
		container.appendChild(createQuestionCard(response.data));
	} else if (response.type === "ai" || response.type === "fallback") {
		container.appendChild(createAICard(response.data, originalQuery));
	}
}

function createConceptCard(concept) {
	const card = document.createElement("div");
	card.className = "concept-card";
	card.innerHTML = `
        <div class="concept-header">
            <div class="concept-icon">✦</div>
            <h2 class="concept-title">${concept.title}</h2>
        </div>

        <div class="concept-section">
            <div class="section-label">En simple</div>
            <div class="section-content highlight">${concept.simple}</div>
        </div>

        <div class="concept-section">
            <div class="section-label">Dans la vie réelle</div>
            <div class="section-content">${concept.realLife}</div>
        </div>

        <div class="concept-section">
            <div class="section-label">Une perspective</div>
            <div class="section-content">${concept.perspective}</div>
        </div>

        <div class="reflection-box">
            <p>💭 ${concept.question}</p>
        </div>
    `;
	return card;
}

function createQuestionCard(question) {
	const card = document.createElement("div");
	card.className = "question-card";
	card.innerHTML = `
        <h2 class="question-title">${question.question}</h2>
        <p class="question-approach">${question.approach}</p>

        <ul class="angles-list">
            ${question.angles.map((angle) => `<li>${angle}</li>`).join("")}
        </ul>

        <div class="reflection-summary">
            "${question.reflection}"
        </div>
    `;
	return card;
}

function createAICard(data, query) {
	const card = document.createElement("div");
	card.className = "concept-card";

	const content =
		typeof data === "string"
			? data
			: data.content || data.response || JSON.stringify(data);

	card.innerHTML = `
        <div class="concept-header">
            <div class="concept-icon">🌙</div>
            <h2 class="concept-title">Réflexion sur "${query}"</h2>
        </div>
        <div class="concept-section">
            <div class="section-content">${content}</div>
        </div>
    `;
	return card;
}

function displayError(message) {
	elements.responseContainer.innerHTML = `
        <div class="concept-card" style="text-align: center; padding: 3rem;">
            <div class="concept-icon" style="margin: 0 auto 1rem;">🌙</div>
            <p style="color: var(--text-secondary);">${message}</p>
            <p style="color: var(--text-muted); margin-top: 1rem; font-size: 0.9rem;">
                Essaye avec : liberté, identité, bonheur, ou "Qui suis-je ?"
            </p>
        </div>
    `;
}

// ========================================
// Reflection Panel
// ========================================
function setupReflectionPanel() {
	const kb = State.knowledgeBase;
	if (!kb || !kb.reflectionPrompts) return;

	elements.reflectionCategories.innerHTML = kb.reflectionPrompts
		.map(
			(cat) => `
        <div class="category-card" data-category="${cat.category}">
            <div class="category-name">${cat.category}</div>
            <div class="category-count">${cat.prompts.length} questions</div>
        </div>
    `,
		)
		.join("");
}

function selectCategory(categoryName) {
	const kb = State.knowledgeBase;
	if (!kb) return;

	State.currentCategory = categoryName;
	State.currentPrompts =
		kb.reflectionPrompts.find((p) => p.category === categoryName)?.prompts ||
		[];
	State.currentPromptIndex = 0;

	// Update active state
	document.querySelectorAll(".category-card").forEach((card) => {
		card.classList.toggle("active", card.dataset.category === categoryName);
	});

	// Show first prompt
	showCurrentPrompt();
}

function showCurrentPrompt() {
	if (State.currentPrompts.length === 0) return;

	const prompt = State.currentPrompts[State.currentPromptIndex];
	elements.currentPrompt.textContent = prompt;
	elements.nextPromptBtn.classList.remove("hidden");
}

function showNextPrompt() {
	State.currentPromptIndex =
		(State.currentPromptIndex + 1) % State.currentPrompts.length;
	showCurrentPrompt();
}

// ========================================
// Utility Functions
// ========================================
function showLoading(show) {
	State.isLoading = show;
	elements.loading.classList.toggle("hidden", !show);
}

function clearResponse() {
	elements.responseContainer.innerHTML = "";
}

function getMinimalKnowledge() {
	return {
		concepts: {
			liberte: {
				title: "Liberté",
				simple: "Le pouvoir de choisir sa propre voie",
				realLife: "C'est quand tu choisis ce qui te ressemble.",
				perspective: "La vraie liberté est intérieure.",
				question: "Qu'est-ce qui te rend vraiment libre ?",
			},
		},
		deepQuestions: [],
		reflectionPrompts: [
			{
				category: "Général",
				prompts: [
					"Que signifie être soi-même ?",
					"Qu'est-ce qui donne du sens à ta vie ?",
				],
			},
		],
	};
}

// ========================================
// Smooth Scroll for internal links
// ========================================
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener("click", function (e) {
		e.preventDefault();
		document.querySelector(this.getAttribute("href")).scrollIntoView({
			behavior: "smooth",
		});
	});
});
