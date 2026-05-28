# trivial-you-engine

The brandless quiz engine behind the *Trivial YOU* product family by [Trivialmass](https://trivialmass.ch).

## What this is

A React/Vite card-swipe quiz that generates a personalised profile from a series of swipe-left/right questions. Includes a Node.js/Express backend with SQLite result storage and a magic-link-protected admin dashboard.

**This repo is the upstream for all client forks.** Do not add client-specific content here.

## Starting a new client fork

```bash
gh repo fork trivialmass/trivial-you-engine --org trivialmass --fork-name <client>-YOU --clone=false
git clone https://github.com/trivialmass/<client>-YOU.git
cd <client>-YOU
git remote add upstream https://github.com/trivialmass/trivial-you-engine.git
```

Then edit everything in `client-config/` — that's the only directory you need to touch for branding and content.

## Pulling engine updates into a client fork

```bash
git fetch upstream
git merge upstream/main
# Conflicts will be limited to client-config/ if you haven't modified engine files
```

## client-config/ reference

| File | Purpose | Used by |
|------|---------|---------|
| `brand.js` | Logo imports, clientName, eventName, primaryColor | React/Vite |
| `content.js` | All UI copy strings | React/Vite |
| `questions.js` | Mock questions + Google Sheets config | React/Vite |
| `profiles.js` | PROFILES array + mockProfile | Node + React |
| `admin.js` | ALLOWED_DOMAINS, appName, primaryColor | Node |
| `features.js` | Feature flags (rsvp, plusOne, emailShare) | React/Vite |
| `fonts.css` | @font-face declarations | Vite |
| `assets/` | Logo SVG files | brand.js |

## Setup

```bash
cp .env.example .env
# Fill in VITE_GOOGLE_SHEETS_API_KEY, VITE_GOOGLE_SHEET_ID, SMTP_* values
npm install
npm run dev        # frontend only (uses mock data)
npm run dev:all    # frontend + backend
```
