import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Database from "better-sqlite3";

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// SQLite setup
const db = new Database(join(__dirname, "results.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT DEFAULT (datetime('now')),
    name TEXT,
    company TEXT,
    email TEXT,
    profile TEXT,
    answers TEXT
  )
`);

// Middleware
app.use(cors());
app.use(express.json());

// Serve built React frontend
app.use(express.static(join(__dirname, "dist")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// Save quiz result to SQLite
app.post("/api/save-result", (req, res) => {
  try {
    const { name, company, email, profile, answers } = req.body;
    const stmt = db.prepare(
      "INSERT INTO results (name, company, email, profile, answers) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(name || "", company || "", email || "", profile || "", JSON.stringify(answers || []));
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: "Failed to save result" });
  }
});

// List results (basic admin endpoint)
app.get("/api/results", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM results ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

// Profile definitions — each trait list matches quiz answers (descriptionQ1 or descriptionQ2)
const PROFILES = [
  {
    traits: new Set(['Classique', 'Accessible', 'Sérieuse', 'Minimaliste', 'Humaine', 'Locale', 'Traditionnelle', 'Stable', 'Émotionnelle', 'Sécurisante']),
    text: `## L'artisan local

### VOTRE TYPE D'ÉVÉNEMENT : L'APÉRITIF DE LANCEMENT

Votre marque, c'est cet apéritif où l'hôte connaît tout le monde par son prénom. Pas besoin de gros buzz : les bonnes personnes sont là, et elles reviendront.

### NOTRE PROJET POUR VOUS

› Une identité visuelle qui sent la bonne hospitalité (logo, charte, supports imprimés)
› Un site vitrine accueillant comme une porte qu'on laisse ouverte
› Un apéritif annuel pour réunir vos habitués et leur permettre d'amener leurs amis`,
  },
  {
    traits: new Set(['Innovante', 'Premium', 'Ludique', 'Expressive', 'Humaine', 'Internationale', 'Disruptive', 'Agile', 'Émotionnelle', 'Audacieuse']),
    text: `## La marque créative et premium

### VOTRE TYPE D'ÉVÉNEMENT : LA SOIRÉE D'ENTREPRISE

Votre marque, c'est cette soirée d'entreprise dont tout le monde veut une invitation : liste fermée, scénographie soignée, et on en parle encore six mois après.

### NOTRE PROJET POUR VOUS

› Une direction artistique signature, comme une scénographie qu'on prépare des mois à l'avance
› Une campagne qui crée l'événement avant même qu'il commence
› Une soirée privée millimétrée pour vos clients qui comptent`,
  },
  {
    traits: new Set(['Classique', 'Premium', 'Sérieuse', 'Minimaliste', 'Institutionnelle', 'Internationale', 'Traditionnelle', 'Stable', 'Rationnelle', 'Sécurisante']),
    text: `## La maison institutionnelle

### VOTRE TYPE D'ÉVÉNEMENT : LA CONFÉRENCE

Votre marque a la tenue d'une conférence d'experts : on s'attend au sérieux, on reste pour écouter, et on prend des notes pour la suite.

### NOTRE PROJET POUR VOUS

› Une charte corporate qui aligne toutes vos prises de parole, comme un programme bien minuté
› Un site institutionnel à la hauteur de votre stature
› Une conférence annuelle qui rassemble vos parties prenantes autour d'un sujet d'autorité`,
  },
  {
    traits: new Set(['Innovante', 'Accessible', 'Ludique', 'Expressive', 'Humaine', 'Internationale', 'Disruptive', 'Agile', 'Émotionnelle', 'Audacieuse']),
    text: `## La startup fun et accessible

### VOTRE TYPE D'ÉVÉNEMENT : LE FESTIVAL

Votre marque, c'est un festival : plusieurs scènes, une tribu qui se reconnaît, et personne ne sait à quelle heure ça finit.

### NOTRE PROJET POUR VOUS

› Une identité fun et colorée qui se reconnaît à un kilomètre
› Une stratégie réseaux taillée pour votre tribu (vidéos courtes, lives, ton direct)
› Un festival ou pop-up éphémère pour activer votre communauté sur plusieurs jours`,
  },
  {
    traits: new Set(['Innovante', 'Premium', 'Sérieuse', 'Minimaliste', 'Humaine', 'Locale', 'Traditionnelle', 'Agile', 'Rationnelle', 'Sécurisante']),
    text: `## La maison familiale qui se modernise

### VOTRE TYPE D'ÉVÉNEMENT : LES WORKSHOPS

Votre marque, c'est une série de workshops bien rodés : on transmet, on actualise, et chaque génération repart avec un outil de plus.

### NOTRE PROJET POUR VOUS

› Un refresh d'identité qui rajeunit sans renier votre histoire
› Un site qui montre vos racines ET votre modernité, comme un atelier ouvert au public
› Une série de workshops pour transmettre votre savoir-faire à vos clients et à leurs équipes`,
  },
];

// Extract chosen traits — answer now directly contains the trait (traitRight or traitLeft)
function getChosenTraits(answers) {
  return answers.map(({ answer }) => answer);
}

// Find the best matching profile by counting overlapping traits
function findBestProfile(answers) {
  const chosenTraits = getChosenTraits(answers);
  console.log('Chosen traits:', chosenTraits);

  let best = PROFILES[0];
  let bestScore = -1;
  for (const profile of PROFILES) {
    const score = chosenTraits.filter(t => profile.traits.has(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = profile;
    }
  }
  console.log(`Best profile score: ${bestScore}/10 →`, best.text.split('\n')[0]);
  return best;
}

// Profile matching endpoint
app.post("/api/generate-profile", (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid request: answers array required" });
    }

    const profile = findBestProfile(answers);
    res.json({ profile: profile.text });
  } catch (error) {
    console.error("Error in generate-profile endpoint:", error);
    res.status(500).json({ error: "Failed to generate profile", message: error.message });
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
