/**
 * Philosophia — Group Module
 * Gestion des groupes, questions quotidiennes, réflexions et historiques
 */

// ========================================
// Configuration
// ========================================
const GROUP_CONFIG = {
		QUESTION_PROMPT: `Agis comme un penseur humaniste et psychologue. Génère UNE question introspective pour de jeunes adultes (18-30 ans). 
Objectif : Susciter une réflexion mature et inconfortable sur la condition humaine et ses paradoxes universels (ex: liberté vs sécurité, amour vs vulnérabilité, quête de sens vs finitude).
Critères : intemporelle, psychologiquement pointue, sans lieux communs ni jargon, 10 à 20 mots maximum.
Format strict : Réponds UNIQUEMENT avec le texte de la question, sans aucun préambule, sans guillemets, et SANS AUCUNE ponctuation finale`,

	ANALYSIS_PROMPT: `Tu es un professeur de philosophie bienveillant pour des adolescents (18-30 ans).

Question : "{question}"
Réponses :
{responses}

INSTRUCTIONS IMPORTANTES:
1. Répon	
2. Ne mets PAS de backticks markdown (pas de \`\`\`json)
3. Utilise des guillemets doubles pour les chaînes
4. Échappe les guillemets dans le texte avec \\"

Structure requise:
{
  "synthese": "2-3 phrases sur les tendances du groupe",
  "points_de_vue": [
    {"philosophe": "Nom", "courant": "Courant philosophique", "analyse": "2 phrases simples"},
    {"philosophe": "Nom", "courant": "Courant philosophique", "analyse": "2 phrases simples"},
    {"philosophe": "Nom", "courant": "Courant philosophique", "analyse": "2 phrases simples"}
  ],
  "tension_principale": "1 phrase sur la tension centrale dans les réponses",
  "pour_aller_plus_loin": "1 question provocatrice pour continuer la réflexion"
}`,
};

// Codes de groupe possibles
const GROUP_CODES = [
	"LOGOS",
	"AGORA",
	"POLIS",
	"NOUS",
	"DOXA",
	"EIDOS",
	"TELOS",
	"ARCHE",
	"KALOS",
	"ETHOS",
];

// ========================================
// State Management
// ========================================
const GroupState = {
	myName: "",
	group: null,
	today: null,
	history: [],
};

// ========================================
// Storage Helpers
// ========================================
const Storage = {
	get: (key) => {
		try {
			return JSON.parse(localStorage.getItem(key));
		} catch {
			return null;
		}
	},
	set: (key, value) => {
		localStorage.setItem(key, JSON.stringify(value));
	},
};

// ========================================
// Initialization
// ========================================
function initGroupModule() {
	const saved = Storage.get("philo_v3");
	if (saved) {
		GroupState.myName = saved.myName || "";
		GroupState.group = saved.group || null;
		GroupState.today = saved.today || null;
		GroupState.history = saved.history || [];
	}

	// Vérifier si on commence un nouveau jour
	if (GroupState.group) {
		const todayKey = new Date().toISOString().split("T")[0];
		if (!GroupState.today || GroupState.today.date !== todayKey) {
			startNewDay();
		}
	}
}

function saveState() {
	Storage.set("philo_v3", {
		myName: GroupState.myName,
		group: GroupState.group,
		today: GroupState.today,
		history: GroupState.history,
	});
}

// ========================================
// Group Management
// ========================================
function generateCode() {
	const name = GROUP_CODES[Math.floor(Math.random() * GROUP_CODES.length)];
	const num = 10 + Math.floor(Math.random() * 90);
	return `${name}-${num}`;
}

function createGroup(groupName, pseudo) {
	const name = groupName || "Mon groupe";
	GroupState.myName = pseudo || "Anonyme";
	GroupState.group = {
		name,
		code: generateCode(),
		members: [{ name: GroupState.myName, isMe: true }],
	};
	GroupState.today = null;
	saveState();
	return GroupState.group;
}

function joinGroup(code, pseudo) {
	if (!code) {
		throw new Error("Le code du groupe est requis");
	}
	GroupState.myName = pseudo || "Anonyme";
	GroupState.group = {
		name: `Groupe ${code}`,
		code,
		members: [
			{ name: "Yasmine", isMe: false },
			{ name: "Karim", isMe: false },
			{ name: GroupState.myName, isMe: true },
		],
	};
	GroupState.today = null;
	saveState();
	return GroupState.group;
}

function getGroup() {
	return GroupState.group;
}

function getMemberCount() {
	return GroupState.group?.members?.length || 0;
}

function getMembers() {
	return GroupState.group?.members || [];
}

// ========================================
// Daily Question
// ========================================
async function startNewDay() {
	const todayKey = new Date().toISOString().split("T")[0];

	// Archiver l'ancien jour
	if (GroupState.today && GroupState.today.date !== todayKey) {
		GroupState.history.unshift(GroupState.today);
		if (GroupState.history.length > 60) {
			GroupState.history.pop();
		}
	}

	GroupState.today = {
		date: todayKey,
		question: null,
		responses: [],
		analysis: null,
	};
	saveState();

	// Générer la nouvelle question
	await generateDailyQuestion();
}

async function generateDailyQuestion() {
	// Éviter les répétitions
	const past = GroupState.history
		.map((h) => h.question)
		.filter(Boolean)
		.slice(0, 10);
	const avoid = past.length
		? `\nNe répète pas ces thèmes : ${past.join(" / ")}`
		: "";

	const prompt = GROUP_CONFIG.QUESTION_PROMPT + avoid;

	try {
		const question = await callAI(prompt, 150);
		const cleaned = question
			.replace(/^["«»"]+|["«»"]+$/g, "")
			.replace(/\?$/, "");
		GroupState.today.question = cleaned;
		saveState();
		return cleaned;
	} catch (error) {
		console.error("Erreur génération question:", error);
		throw error;
	}
}

function getToday() {
	return GroupState.today;
}

function getQuestion() {
	return GroupState.today?.question || null;
}

function getHistory() {
	return GroupState.history;
}

// ========================================
// Response Management
// ========================================
function submitNote(text) {
	if (!text || !text.trim()) {
		throw new Error("La réflexion ne peut pas être vide");
	}

	// Supprimer l'ancienne réponse si elle existe
	GroupState.today.responses = GroupState.today.responses.filter(
		(r) => !r.isMe,
	);

	// Ajouter la nouvelle réponse
	GroupState.today.responses.push({
		name: GroupState.myName || "Moi",
		text: text.trim(),
		isMe: true,
		timestamp: new Date().toISOString(),
	});

	saveState();
	return GroupState.today.responses;
}

function getResponses() {
	return GroupState.today?.responses || [];
}

function hasResponded() {
	return GroupState.today?.responses?.some((r) => r.isMe) || false;
}

function getMyResponse() {
	return GroupState.today?.responses?.find((r) => r.isMe);
}

// ========================================
// AI Analysis
// ========================================
async function generateAnalysis() {
	const responses = GroupState.today?.responses;

	if (!responses || responses.length === 0) {
		throw new Error("Aucune réponse à analyser");
	}

	if (!GroupState.today?.question) {
		throw new Error("Aucune question pour l'analyse");
	}

	// Formater les réponses pour le prompt
	const rt = responses.map((r) => `- ${r.name} : "${r.text}"`).join("\n");

	const prompt = GROUP_CONFIG.ANALYSIS_PROMPT.replace(
		"{question}",
		GroupState.today.question,
	).replace("{responses}", rt);

	try {
		const raw = await callAI(prompt, 1000);
		console.log("[generateAnalysis] Raw AI response:", raw);

		// Essayer d'extraire JSON de la réponse
		let cleaned = raw;

		// Enlever les blocs markdown
		cleaned = cleaned.replace(/```json\s*/g, "");
		cleaned = cleaned.replace(/```\s*/g, "");
		cleaned = cleaned.trim();

		// Si la réponse contient du texte avant/après le JSON, extraire juste le JSON
		const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			cleaned = jsonMatch[0];
		}

		console.log("[generateAnalysis] Cleaned JSON:", cleaned);

		let parsed;
		try {
			parsed = JSON.parse(cleaned);
			// Vérifier que la structure est complète
			if (!parsed.synthese || !parsed.points_de_vue || !Array.isArray(parsed.points_de_vue)) {
				throw new Error("Structure JSON invalide");
			}
		} catch (jsonError) {
			console.error("[generateAnalysis] JSON parse error:", jsonError);
			console.error("[generateAnalysis] Failed content:", cleaned.substring(0, 500));

			// Fallback: créer une analyse basique à partir du texte brut
			parsed = createFallbackAnalysis(raw, GroupState.today.question, responses);
		}

		GroupState.today.analysis = parsed;
		saveState();
		return parsed;
	} catch (error) {
		console.error("Erreur génération analyse:", error);
		throw new Error(`Erreur de génération d'analyse: ${error.message}`);
	}
}

function getAnalysis() {
	return GroupState.today?.analysis || null;
}

// ========================================
// Fallback Analysis Generator
// ========================================
function createFallbackAnalysis(rawText, question, responses) {
	console.log("[createFallbackAnalysis] Creating fallback from raw text");

	// Compter les philosophes mentionnés dans le texte
	const philosopherPatterns = [
		{ name: "Socrate", courant: "Socratique" },
		{ name: "Platon", courant: "Platonicien" },
		{ name: "Aristote", courant: "Aristotélicien" },
		{ name: "Descartes", courant: "Cartésien" },
		{ name: "Kant", courant: "Kantien" },
		{ name: "Nietzsche", courant: "Nietzschéen" },
		{ name: "Sartre", courant: "Existentialiste" },
		{ name: "Camus", courant: "Absurde" },
		{ name: "Epicure", courant: "Epicurien" },
		{ name: "Stoïciens", courant: "Stoïcisme" },
		{ name: "Heidegger", courant: "Phénoménologie" },
	];

	const foundPhilosophers = [];
	philosopherPatterns.forEach(p => {
		if (rawText.toLowerCase().includes(p.name.toLowerCase())) {
			foundPhilosophers.push(p);
		}
	});

	// Si aucun philosophe trouvé, en ajouter des génériques
	if (foundPhilosophers.length === 0) {
		foundPhilosophers.push(
			{ name: "Socrate", courant: "Socratique" },
			{ name: "Epicure", courant: "Epicurien" },
			{ name: "Camus", courant: "Absurde" }
		);
	}

	// Créer une synthèse basée sur les réponses réelles
	const responseTexts = responses.map(r => r.text.substring(0, 50)).join("; ");
	const synthese = `Les membres du groupe ont exploré "${question}" avec des perspectives variées. ${responses.length} réponses montrent une richesse de réflexion sur ce thème.`;

	// Extraire des phrases du texte brut pour les analyses
	const sentences = rawText.split(/[.!?]+/).filter(s => s.length > 20 && s.length < 200);

	return {
		synthese: synthese,
		points_de_vue: foundPhilosophers.slice(0, 3).map((p, i) => ({
			philosophe: p.name,
			courant: p.courant,
			analyse: sentences[i] || `Selon ${p.name}, cette question révèle des aspects profonds de notre condition humaine.`
		})),
		tension_principale: "La tension entre les différentes perspectives du groupe révèle la complexité de la question.",
		pour_aller_plus_loin: `Comment votre groupe pourrait-il approfondir la réflexion sur "${question}" dans vos échanges futurs ?`
	};
}

function hasAnalysis() {
	return !!GroupState.today?.analysis;
}

// ========================================
// AI Helper (utilise le Worker existant)
// ========================================
async function callAI(prompt, maxTokens = 5000) {
	// Utilise le Worker URL configuré dans app.js
	const workerUrl =
		typeof CONFIG !== "undefined" && CONFIG.WORKER_URL
			? CONFIG.WORKER_URL
			: "https://philosophia-proxy.mohamedamine-khouaja.workers.dev";

	console.log(`[callAI] Calling worker with ${maxTokens} max tokens...`);

	try {
		// Add timeout to prevent hanging
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 15000);

		const response = await fetch(workerUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				prompt: prompt,
				max_tokens: maxTokens,
			}),
			signal: controller.signal,
		});

		clearTimeout(timeoutId);

		// Check HTTP status
		if (!response.ok) {
			const errorText = await response.text().catch(() => 'Unknown error');
			throw new Error(`HTTP ${response.status}: ${errorText}`);
		}

		const data = await response.json();

		// Check for API errors
		if (data.error) {
			console.error('[callAI] API Error:', data.error);
			throw new Error(data.error.message || 'API Error');
		}

		// Check for valid response structure
		if (!data.choices || !data.choices[0] || !data.choices[0].message) {
			console.error('[callAI] Invalid response structure:', data);
			throw new Error('Invalid response from AI service');
		}
//AI response is expected to be in data.choices[0].message.content
		const content = data.choices[0].message.content?.trim() || "";
		console.log(`[callAI] Success, received ${content.length} chars`);
		return content;

	} catch (error) {
		console.error('[callAI] Failed:', error);

		// Provide user-friendly error messages
		if (error.name === 'AbortError') {
			throw new Error('La requête a pris trop de temps. Veuillez réessayer.');
		}
		if (error.message?.includes('429')) {
			throw new Error('Trop de requêtes. Attendez quelques secondes et réessayez.');
		}
		if (error.message?.includes('401') || error.message?.includes('403')) {
			throw new Error('Problème d\'authentification API. Contactez l\'administrateur.');
		}
		if (error.message?.includes('fetch') || error.message?.includes('network')) {
			throw new Error('Problème de connexion. Vérifiez votre internet.');
		}

		throw error;
	}
}

// ========================================
// View Helpers
// ========================================
function isMemberDone(memberName) {
	return (
		GroupState.today?.responses?.some((r) => r.name === memberName) || false
	);
}

function getDoneCount() {
	if (!GroupState.group) return 0;
	return GroupState.group.members.filter((m) =>
		GroupState.today?.responses?.some((r) => r.name === m.name),
	).length;
}

function getTodayDateFormatted() {
	if (!GroupState.today?.date) return "";
	return new Date(GroupState.today.date).toLocaleDateString("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function copyCode() {
	if (!GroupState.group?.code) return false;
	navigator.clipboard.writeText(GroupState.group.code);
	return true;
}

// ========================================
// History Management
// ========================================
function getHistoryItem(index) {
	return GroupState.history[index] || null;
}

function openHistorySession(index) {
	const session = getHistoryItem(index);
	if (!session) return null;

	// Charger la session dans today pour affichage
	GroupState.today = { ...session };
	return GroupState.today;
}

function getHistoryCount() {
	return GroupState.history.length;
}

// ========================================
// Export Public API
// ========================================
window.GroupModule = {
	// Init
	init: initGroupModule,

	// Group
	createGroup,
	joinGroup,
	getGroup,
	getMemberCount,
	getMembers,

	// Daily
	startNewDay,
	getToday,
	getQuestion,
	getHistory,

	// Responses
	submitNote,
	getResponses,
	hasResponded,
	getMyResponse,

	// Analysis
	generateAnalysis,
	getAnalysis,
	hasAnalysis,

	// Helpers
	isMemberDone,
	getDoneCount,
	getTodayDateFormatted,
	copyCode,

	// History
	getHistoryItem,
	openHistorySession,
	getHistoryCount,

	// State
	getState: () => GroupState,
};
