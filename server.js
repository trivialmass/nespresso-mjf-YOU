import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve built React frontend
app.use(express.static(join(__dirname, "dist")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Proxy endpoint for Infomaniak AI API
app.post("/api/generate-profile", async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ error: "Invalid request: answers array required" });
    }

    const INFOMANIAK_API_TOKEN = process.env.VITE_INFOMANIAK_API_TOKEN;
    const INFOMANIAK_PRODUCT_ID = process.env.VITE_INFOMANIAK_PRODUCT_ID;

    if (!INFOMANIAK_API_TOKEN || !INFOMANIAK_PRODUCT_ID) {
      return res.status(500).json({
        error: "Server configuration error: Missing Infomaniak credentials",
      });
    }

    const INFOMANIAK_API_URL = `https://api.infomaniak.com/2/ai/${INFOMANIAK_PRODUCT_ID}/openai/v1/chat/completions`;

    // Create prompt from answers
    const answerText = answers
      .map((a, i) => `${i + 1}. ${a.question} → ${a.answer.toUpperCase()}`)
      .join("\n");

    const systemPrompt =
      "You are a witty, insightful personality analyst who creates fun, engaging personality profiles. Be creative, humorous, and positive.";

    const userPrompt = `Tu es un stratège de marque créatif et un analyste de personnalité perspicace.

Ta mission est d’interpréter les réponses à un quiz et de générer QUATRE éléments :

1. un profil de la personne
2. un profil de son entreprise
3. un résumé stratégique de positionnement
4. le super-pouvoir de la marque

Les réponses proviennent d’un quiz basé sur des traits opposés
(par exemple : Classique vs Innovante, Accessible vs Premium, Sérieuse vs Ludique, etc.).

RÉSULTATS DU QUIZ :
${answerText}

Ton objectif :
Analyser les traits sélectionnés et en déduire :

* la personnalité de la personne
* la personnalité et l’énergie de son entreprise
* les grandes tendances de son positionnement stratégique
* le super-pouvoir principal de la marque

Style d’écriture :

* ludique mais pertinent
* imaginatif et métaphorique
* clair et concis
* positif et engageant
* éviter les descriptions génériques

Utilise des métaphores inspirées de situations de la vie réelle
(par exemple : un dîner entre amis, un atelier créatif, un café animé, un road trip, une équipe qui construit quelque chose ensemble).

Règles :

* NE PAS répéter directement les réponses
* NE PAS expliquer le quiz
* Faire des descriptions vivantes et spécifiques
* Chaque résultat doit sembler unique
* Répondre en français

Retourne EXACTEMENT ce format :

## 👤 [Emoji] [Titre du profil personne]

[2 phrases décrivant la personnalité de la personne de manière imagée.]

Votre vibe : [emoji] [trait] • [emoji] [trait] • [emoji] [trait]

---

## 🏢 [Emoji] [Titre du profil entreprise]

[3–4 phrases décrivant l’entreprise avec une scène ou une métaphore concrète.]

Votre vibe : [emoji] [trait] • [emoji] [trait] • [emoji] [trait]

**Prédiction :** [Une prédiction ou conseil stratégique fun.]

---

## 🧭 Positionnement stratégique

Innovation : [faible / moyen / élevé]
Accessibilité : [faible / moyen / élevé]
Émotion : [faible / moyen / élevé]
Disruption : [faible / moyen / élevé]
Relation humaine : [faible / moyen / élevé]

[1 phrase expliquant l’énergie globale du positionnement.]

---

## ✨ Super-pouvoir de marque

[Titre court du super-pouvoir]

[2 phrases expliquant ce qui rend cette marque naturellement forte ou différente.]

Symbole : [emoji]
`;

    // Call Infomaniak API
    const response = await fetch(INFOMANIAK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${INFOMANIAK_API_TOKEN}`,
      },
      body: JSON.stringify({
        model: "qwen3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_completion_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message ||
        `Infomaniak API error: ${response.statusText}`,
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content;

    if (!generatedText) {
      throw new Error("No content generated");
    }

    res.json({ profile: generatedText });
  } catch (error) {
    console.error("Error in generate-profile endpoint:", error);
    res.status(500).json({
      error: "Failed to generate profile",
      message: error.message,
    });
  }
});

// Fallback: serve React app for all non-API routes
app.get("/{*path}", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/generate-profile`);
});
