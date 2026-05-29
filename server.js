import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import Database from "better-sqlite3";
import nodemailer from "nodemailer";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import { PROFILES } from './client-config/profiles.js';

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.VITE_BACKEND_URL || `http://localhost:${PORT}`;
const ALLOWED_DOMAINS = ["trivialmass.com", "trivialmass.ch"];

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
  );
  CREATE TABLE IF NOT EXISTS magic_links (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
`);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Serve built React frontend
app.use(express.static(join(__dirname, "dist")));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Backend server is running" });
});

// ── Magic link auth ──────────────────────────────────────────────────────────

// Step 1: request a magic link
app.post("/api/admin/request-link", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });

  const domain = email.split("@")[1]?.toLowerCase();
  if (!ALLOWED_DOMAINS.includes(domain)) {
    return res.status(403).json({ error: "Email domain not authorized" });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min

  db.prepare("INSERT INTO magic_links (token, email, expires_at) VALUES (?, ?, ?)").run(token, email, expiresAt);

  const link = `${BASE_URL}/api/admin/verify/${token}`;

  try {
    await transporter.sendMail({
      from: `"Trivial YOU" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Votre lien d'accès Trivial YOU",
      html: `
        <p>Bonjour,</p>
        <p>Voici votre lien d'accès aux résultats du quiz Trivial YOU :</p>
        <p><a href="${link}" style="background:#a5ff02;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;color:#000">Accéder aux résultats</a></p>
        <p style="color:#999;font-size:12px">Ce lien expire dans 15 minutes et ne peut être utilisé qu'une seule fois.</p>
      `,
    });
    res.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

// Step 2: verify magic link → set session cookie → redirect to admin page
app.get("/api/admin/verify/:token", (req, res) => {
  const { token } = req.params;
  const link = db.prepare("SELECT * FROM magic_links WHERE token = ?").get(token);

  if (!link || link.used || new Date(link.expires_at) < new Date()) {
    return res.status(401).send(`
      <html><body style="font-family:sans-serif;text-align:center;padding:60px">
        <h2>Lien invalide ou expiré.</h2>
        <p><a href="/admin">Demander un nouveau lien</a></p>
      </body></html>
    `);
  }

  db.prepare("UPDATE magic_links SET used = 1 WHERE token = ?").run(token);

  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h
  db.prepare("INSERT INTO sessions (token, email, expires_at) VALUES (?, ?, ?)").run(sessionToken, link.email, expiresAt);

  res.cookie("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "lax",
  });
  res.redirect("/admin");
});

// Middleware to protect admin routes
function requireSession(req, res, next) {
  const token = req.cookies?.admin_session;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const session = db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);
  if (!session || new Date(session.expires_at) < new Date()) {
    return res.status(401).json({ error: "Session expired" });
  }
  req.adminEmail = session.email;
  next();
}

// ── Results endpoints ─────────────────────────────────────────────────────────

// Save quiz result to SQLite
app.post("/api/save-result", (req, res) => {
  try {
    const { name, company, email, profile, answers } = req.body;
    const stmt = db.prepare(
      "INSERT INTO results (name, company, email, profile, answers) VALUES (?, ?, ?, ?, ?)"
    );
    stmt.run(name || "", company || "", email || "", JSON.stringify(profile) || "", JSON.stringify(answers || []));
    res.json({ success: true });
  } catch (error) {
    console.error("Error saving result:", error);
    res.status(500).json({ error: "Failed to save result" });
  }
});

// Protected: list all results
app.get("/api/results", requireSession, (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM results ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch results" });
  }
});

/**
 * Exact-key profile matching.
 * Sorts the 3 answer traits alphabetically, joins them, then looks up the key
 * against each profile's traitCombinations. Falls back to the last profile.
 */
function findBestProfile(answers) {
  const traitKey = answers.map(({ answer }) => answer).sort().join(',');
  console.log('Trait key:', traitKey);

  for (const profile of PROFILES) {
    for (const combo of profile.traitCombinations) {
      if ([...combo].sort().join(',') === traitKey) {
        console.log(`Matched profile: ${profile.id} — ${profile.drink}`);
        return profile;
      }
    }
  }

  console.warn('No exact match for key:', traitKey, '— falling back to:', PROFILES[PROFILES.length - 1].id);
  return PROFILES[PROFILES.length - 1];
}

// Profile matching endpoint
app.post("/api/generate-profile", (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: "Invalid request: answers array required" });
    }

    const profile = findBestProfile(answers);
    res.json({
      profile: {
        id: profile.id,
        drink: profile.drink,
        tagline: profile.tagline,
        description: profile.description,
      },
    });
  } catch (error) {
    console.error("Error in generate-profile endpoint:", error);
    res.status(500).json({ error: "Failed to generate profile", message: error.message });
  }
});

// Admin page
app.get("/admin", (req, res) => {
  const session = req.cookies?.admin_session
    ? db.prepare("SELECT * FROM sessions WHERE token = ?").get(req.cookies.admin_session)
    : null;
  const isAuth = session && new Date(session.expires_at) > new Date();

  if (!isAuth) {
    return res.send(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Admin — Trivial YOU</title>
<style>
  body{font-family:Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#111;color:#fff}
  .box{background:#1a1a1a;padding:48px;border-radius:16px;width:360px;text-align:center}
  h1{font-size:22px;margin-bottom:8px}
  p{color:#999;font-size:14px;margin-bottom:24px}
  input{width:100%;box-sizing:border-box;padding:12px 16px;border-radius:8px;border:none;font-size:15px;margin-bottom:16px}
  button{width:100%;padding:14px;background:#a5ff02;border:none;border-radius:8px;font-weight:700;font-size:16px;cursor:pointer}
  .msg{margin-top:16px;font-size:14px;min-height:20px}
</style></head>
<body><div class="box">
  <h1>Trivial YOU — Admin</h1>
  <p>Entrez votre adresse @trivialmass pour recevoir un lien d'accès.</p>
  <input type="email" id="email" placeholder="vous@trivialmass.ch" />
  <button onclick="requestLink()">Envoyer le lien</button>
  <div class="msg" id="msg"></div>
</div>
<script>
async function requestLink() {
  const email = document.getElementById('email').value;
  const msg = document.getElementById('msg');
  msg.textContent = 'Envoi en cours…';
  const res = await fetch('/api/admin/request-link', {
    method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({email})
  });
  const data = await res.json();
  msg.textContent = res.ok ? '✅ Lien envoyé ! Vérifiez votre boîte mail.' : '❌ ' + (data.error || 'Erreur');
}
</script></body></html>`);
  }

  const rows = db.prepare("SELECT * FROM results ORDER BY created_at DESC").all();
  const tableRows = rows.map(r => {
    const answers = JSON.parse(r.answers || "[]").map(a => `${a.question}: ${a.answer}`).join("<br>");
    const profileData = typeof r.profile === 'string' ? JSON.parse(r.profile) : r.profile;
    const profile = profileData?.drink ? `${profileData.drink} — ${profileData.tagline}` : (r.profile || '');
    return `<tr>
      <td>${r.created_at?.slice(0,16).replace("T"," ")}</td>
      <td>${r.name}</td>
      <td>${r.company}</td>
      <td>${r.email}</td>
      <td>${profile}</td>
      <td style="font-size:12px">${answers}</td>
    </tr>`;
  }).join("");

  res.send(`<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Résultats — Trivial YOU</title>
<style>
  body{font-family:Helvetica,sans-serif;padding:32px;background:#111;color:#fff}
  h1{font-size:24px;margin-bottom:4px}
  p{color:#999;font-size:14px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#a5ff02;color:#000;padding:10px 12px;text-align:left}
  td{padding:10px 12px;border-bottom:1px solid #222;vertical-align:top}
  tr:hover td{background:#1a1a1a}
</style></head>
<body>
  <h1>Résultats du quiz</h1>
  <p>${rows.length} participant${rows.length !== 1 ? "s" : ""} · connecté en tant que ${session.email}</p>
  <table>
    <thead><tr><th>Date</th><th>Nom</th><th>Entreprise</th><th>Email</th><th>Profil</th><th>Réponses</th></tr></thead>
    <tbody>${tableRows || "<tr><td colspan='6' style='color:#666'>Aucun résultat.</td></tr>"}</tbody>
  </table>
</body></html>`);
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
