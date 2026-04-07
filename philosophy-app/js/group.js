/**
 * Philosophia — Group Module
 * Gestion des groupes, questions quotidiennes, réflexions et historiques
 */

// ========================================
// Configuration
// ========================================
const GROUP_CONFIG = {
	QUESTION_PROMPT: `Génère UNE question philosophique pour des adolescents de 14-20 ans.
Critères : accessible, profonde, liée à leur vie quotidienne, sans jargon, ouverte, 10-20 mots.
Réponds UNIQUEMENT avec la question, sans guillemets ni ponctuation finale.`,

	ANALYSIS_PROMPT: `Tu es un professeur de philosophie bienveillant pour des adolescents (14-20 ans).

Question : "{question}"
Réponses :
{responses}

Réponds UNIQUEMENT en JSON valide, sans markdown ni backticks :
{
  "synthese": "2-3 phrases sur les tendances du groupe",
  "points_de_vue": [
    {"philosophe": "Nom", "courant": "courant", "analyse": "2 phrases simples"},
    {"philosophe": "Nom", "courant": "courant", "analyse": "2 phrases simples"},
    {"philosophe": "Nom", "courant": "courant", "analyse": "2 phrases simples"}
  ],
  "tension_principale": "1 phrase sur la tension centrale",
  "pour_aller_plus_loin": "1 question provocatrice"
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
		console.log("Raw AI response:", raw); // Debug log

		const cleaned = raw.replace(/```json|```/g, "").trim();
		console.log("Cleaned response:", cleaned); // Debug log

		let parsed;
		try {
			parsed = JSON.parse(cleaned);
		} catch (jsonError) {
			console.error("JSON parse error:", jsonError);
			console.error("Failed to parse:", cleaned.substring(0, 500) + "...");
			// Fallback: créer une analyse basique
			parsed = {
				synthese:
					"Erreur de parsing de l'analyse AI. Les réponses du groupe montrent une diversité d'opinions.",
				points_de_vue: [
					{
						philosophe: "Erreur",
						courant: "Technique",
						analyse: "L'analyse AI n'a pas pu être générée correctement.",
					},
				],
				tension_principale: "Problème technique dans la génération d'analyse",
				pour_aller_plus_loin:
					"Réessayez plus tard ou discutez directement entre vous.",
			};
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

function hasAnalysis() {
	return !!GroupState.today?.analysis;
}

// ========================================
// AI Helper (utilise le Worker existant)
// ========================================
async function callAI(prompt, maxTokens = 1000) {
	// Utilise le Worker URL configuré dans app.js
	const workerUrl =
		typeof CONFIG !== "undefined"
			? CONFIG.WORKER_URL
			: "https://philosophia-proxy.mohamedamine-khouaja.workers.dev";

	// Add timeout to prevent hanging
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for longer AI tasks

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

	const data = await response.json();

	if (data.error) {
		throw new Error(data.error.message);
	}

	// Format OpenAI (retourné par le worker)
	return data.choices?.[0]?.message?.content?.trim() || "";
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
