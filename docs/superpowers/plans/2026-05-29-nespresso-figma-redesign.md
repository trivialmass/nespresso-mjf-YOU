# Nespresso Figma Redesign — Pool BG + RSVP + Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align all blue screens with the Figma design by wiring the animated GIF background, redesigning the RSVP form as a white card on pool bg, redesigning Results as a white card with drink image placeholder, updating Tutorial and Loading screens to use the GIF, and adding phone number to the backend.

**Architecture:** A shared `PoolBg` component wraps all blue screens and provides the `POOL - BG.gif` animated background with an optional navy overlay. The RSVP and Results components are completely rewritten to match Figma's card-on-pool-bg pattern. Phone is added to the SQLite schema and saved via the existing `/api/save-result` endpoint.

**Tech Stack:** React, Vite, CSS custom properties, SQLite (better-sqlite3), existing brand.js/content.js config

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `src/components/PoolBg.jsx` | Animated GIF bg wrapper with optional navy overlay |
| Create | `src/components/PoolBg.css` | Pool bg layout (fixed, full-screen, gif + overlay + content slot) |
| Modify | `client-config/brand.js` | Export `poolBg` GIF import |
| Modify | `client-config/content.js` | Update rsvp labels to match Figma copy, add phoneLabel |
| Rewrite | `src/components/RsvpForm.jsx` | White card on PoolBg, 4 pill inputs, radio attending, pill CONFIRM |
| Rewrite | `src/components/RsvpForm.css` | Figma-accurate card layout |
| Modify | `server.js` | Add `phone` column to results table, update INSERT |
| Modify | `src/services/saveResult.js` | Add phone to request body |
| Modify | `src/App.jsx` | Add phone to initial userData state |
| Rewrite | `src/components/Results.jsx` | White card on PoolBg+overlay, drink image placeholder, no restart |
| Rewrite | `src/components/Results.css` | Figma card layout |
| Modify | `src/components/SwipeTutorial.jsx` | Replace solid navy bg with PoolBg+overlay |
| Modify | `src/components/SwipeTutorial.css` | Remove solid bg rules, keep content styles |
| Modify | `src/components/Congradulation.jsx` | Replace solid blue-band bg with PoolBg+overlay |
| Modify | `src/components/Congradulation.css` | Remove solid bg, keep spinner + text styles |

---

## Task 1 — PoolBg component + brand.js GIF export

**Files:**
- Create: `src/components/PoolBg.jsx`
- Create: `src/components/PoolBg.css`
- Modify: `client-config/brand.js`

- [ ] **Step 1: Add poolBg export to brand.js**

Replace `client-config/brand.js` entirely:
```js
// Logos — replace placeholder SVGs with actual Nespresso × MJF assets
import logoGame from './assets/logoGame.svg';
import headerBanier from './assets/headerBanier.svg';
import logoIN from './assets/logoIN.svg';
import logoOUT from './assets/logoOUT.svg';
import logoSwipe from './assets/logoSwipe.svg';
import chargingLogo from './assets/chargingLogo.svg';
// Animated pool background (Montreux Jazz Festival pool scene)
import poolBg from './assets/POOL - BG.gif';

export const clientName = 'Nespresso × MJF';
export const eventName = 'Montreux Jazz Festival 2026';
export const primaryColor = '#C93772';

export { logoGame, headerBanier, logoIN, logoOUT, logoSwipe, chargingLogo, poolBg };
```

- [ ] **Step 2: Create PoolBg.jsx**

```jsx
import React from 'react';
import './PoolBg.css';
import { poolBg } from '../../client-config/brand.js';

/**
 * Full-screen animated pool background wrapper.
 * overlay=false → blue + GIF only (RSVP screen)
 * overlay=true  → blue + GIF + navy 70% overlay (Tutorial, Loading, Results)
 */
const PoolBg = ({ overlay = false, children }) => (
  <div className="pool-bg">
    <img src={poolBg} className="pool-bg__gif" alt="" aria-hidden="true" />
    {overlay && <div className="pool-bg__overlay" />}
    <div className="pool-bg__content">
      {children}
    </div>
  </div>
);

export default PoolBg;
```

- [ ] **Step 3: Create PoolBg.css**

```css
.pool-bg {
  position: fixed;
  inset: 0;
  background: var(--blue-band);
  overflow: hidden;
}

.pool-bg__gif {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.pool-bg__overlay {
  position: absolute;
  inset: 0;
  background: rgba(28, 40, 105, 0.70);
  pointer-events: none;
}

.pool-bg__content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-overflow-scrolling: touch;
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1 | tail -5
```
Expected: `✓ built in ...ms`, no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU
git add client-config/brand.js src/components/PoolBg.jsx src/components/PoolBg.css
git commit -m "feat: PoolBg component — animated POOL BG.gif wrapper with optional navy overlay

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 2 — RsvpForm redesign (Figma-accurate)

**Files:**
- Modify: `client-config/content.js`
- Rewrite: `src/components/RsvpForm.jsx`
- Rewrite: `src/components/RsvpForm.css`

- [ ] **Step 1: Update rsvp labels in content.js to match Figma**

In `client-config/content.js`, replace the `rsvp` export:
```js
export const rsvp = {
  heading: "you're invited",
  firstNameLabel: 'First name*',
  lastNameLabel: 'Last name*',
  emailLabel: 'Email address*',
  phoneLabel: 'Phone number',
  attendYes: "I'd be delighted to attend",
  attendNo: "I won't be able to make it this time",
  ctaLabel: 'CONFIRM',
};
```

- [ ] **Step 2: Rewrite RsvpForm.jsx**

```jsx
import React, { useState } from 'react';
import './RsvpForm.css';
import PoolBg from './PoolBg.jsx';
import { rsvp } from '../../client-config/content.js';

const RsvpForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    attending: null,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAttend = (value) => setForm({ ...form, attending: value });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || form.attending === null) return;
    onSubmit(form);
  };

  const isValid = form.firstName && form.email && form.attending !== null;

  return (
    <PoolBg overlay={false}>
      <div className="rsvp-card">
        <h1 className="rsvp-title">{rsvp.heading}</h1>
        <form onSubmit={handleSubmit}>
          <input
            className="rsvp-input"
            type="text"
            name="firstName"
            placeholder={rsvp.firstNameLabel}
            value={form.firstName}
            onChange={handleChange}
            required
          />
          <input
            className="rsvp-input"
            type="text"
            name="lastName"
            placeholder={rsvp.lastNameLabel}
            value={form.lastName}
            onChange={handleChange}
          />
          <input
            className="rsvp-input"
            type="email"
            name="email"
            placeholder={rsvp.emailLabel}
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            className="rsvp-input"
            type="tel"
            name="phone"
            placeholder={rsvp.phoneLabel}
            value={form.phone}
            onChange={handleChange}
          />
          <button
            type="button"
            className={`rsvp-radio${form.attending === true ? ' rsvp-radio--selected' : ''}`}
            onClick={() => handleAttend(true)}
          >
            <span className="rsvp-radio__dot" />
            {rsvp.attendYes}
          </button>
          <button
            type="button"
            className={`rsvp-radio${form.attending === false ? ' rsvp-radio--selected' : ''}`}
            onClick={() => handleAttend(false)}
          >
            <span className="rsvp-radio__dot" />
            {rsvp.attendNo}
          </button>
          <button className="rsvp-cta" type="submit" disabled={!isValid}>
            {rsvp.ctaLabel}
          </button>
        </form>
      </div>
    </PoolBg>
  );
};

export default RsvpForm;
```

- [ ] **Step 3: Rewrite RsvpForm.css**

```css
/* Card — floats on pool bg, top:158 equivalent via margin-top */
.rsvp-card {
  margin: 158px 33px 40px;
  width: 327px;
  background: #fff;
  border-radius: 25px;
  padding: 20px 21px 30px;
  box-sizing: border-box;
  flex-shrink: 0;
}

.rsvp-title {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 34px;
  font-weight: 700;
  color: var(--navy);
  margin: 0 0 20px;
  line-height: 1.1;
}

/* Pill inputs — Figma: w:285 h:50 br:50 */
.rsvp-input {
  display: block;
  width: 285px;
  height: 50px;
  padding: 0 20px;
  margin-bottom: 12px;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  border-radius: 50px;
  background: transparent;
  font-size: 18px;
  font-family: Helvetica, Arial, sans-serif;
  color: rgba(0, 0, 0, 0.85);
  outline: none;
  box-sizing: border-box;
}

.rsvp-input::placeholder {
  color: #C0BFBF;
}

.rsvp-input:focus {
  border-color: var(--navy);
}

/* Radio-style attending buttons */
.rsvp-radio {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 285px;
  padding: 12px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-family: Helvetica, Arial, sans-serif;
  color: #000;
  text-align: left;
}

.rsvp-radio__dot {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid var(--navy);
  border-radius: 50%;
  background: transparent;
  transition: background 0.15s;
}

.rsvp-radio--selected .rsvp-radio__dot {
  background: var(--navy);
}

/* CONFIRM button — Figma: w:285 h:60 br:50 bg:#C93772 */
.rsvp-cta {
  display: block;
  width: 285px;
  height: 60px;
  margin-top: 16px;
  background: var(--pink-cta);
  color: #fff;
  border: none;
  border-radius: 50px;
  font-size: 26px;
  font-family: Helvetica, Arial, sans-serif;
  font-weight: 400;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: opacity 0.15s;
}

.rsvp-cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.rsvp-cta:not(:disabled):hover {
  opacity: 0.88;
}
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1 | tail -5
```
Expected: `✓ built in ...ms`, no errors.

- [ ] **Step 5: Commit**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU
git add client-config/content.js src/components/RsvpForm.jsx src/components/RsvpForm.css
git commit -m "feat: RsvpForm — Figma white card on pool bg, 4 pill inputs, radio attending

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 3 — Backend: phone field in SQLite + userData threading

**Files:**
- Modify: `server.js`
- Modify: `src/services/saveResult.js`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add phone column to SQLite schema in server.js**

Find the `CREATE TABLE IF NOT EXISTS results` block (around line 24) and replace it:
```sql
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT DEFAULT (datetime('now')),
  name TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  profile TEXT,
  answers TEXT
);
```

Note: `CREATE TABLE IF NOT EXISTS` won't alter an existing table. Add a migration line right after `db.exec(...)`:
```js
// Migrate: add phone column if not present (safe to run on every startup)
try { db.prepare("ALTER TABLE results ADD COLUMN phone TEXT").run(); } catch (_) {}
```

- [ ] **Step 2: Update INSERT in server.js to include phone**

Find the INSERT line (around line 157):
```js
db.prepare("INSERT INTO results (name, company, email, phone, profile, answers) VALUES (?, ?, ?, ?, ?, ?)")
  .run(body.name, body.company, body.email, body.phone || '', body.profile, JSON.stringify(body.answers));
```

- [ ] **Step 3: Add phone to saveResult.js request body**

In `src/services/saveResult.js`, add `phone` to the JSON body:
```js
body: JSON.stringify({
  name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
  company: '',
  email: userData?.email || '',
  phone: userData?.phone || '',
  profile: profile ? JSON.stringify({ id: profile.id, drink: profile.drink, tagline: profile.tagline }) : '',
  answers: answers.map(a => ({ question: a.question?.question || a.question, answer: a.answer })),
}),
```

- [ ] **Step 4: Verify build**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU
git add server.js src/services/saveResult.js
git commit -m "feat: add phone field to SQLite results table + save flow

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 4 — Results redesign (Figma white card on pool bg)

**Files:**
- Rewrite: `src/components/Results.jsx`
- Rewrite: `src/components/Results.css`

Figma spec:
- Pool bg + navy overlay
- White card: `w:327, min-height:631, br:32`, `margin: 54px auto 0`, centered (30px side margins on 390px screen)
- Drink image placeholder (navy): `w:100%, h:298px` — top of card, clips to card's border-radius via `overflow:hidden`
- Text block at `~325px` from card top: drink name (uppercase, navy, ~24px bold), tagline (navy, smaller)
- Description: Gustavo/Georgia, 16px, fw:700, navy
- MJF logo at bottom outside card
- No restart button

- [ ] **Step 1: Rewrite Results.jsx**

```jsx
import React from 'react';
import './Results.css';
import PoolBg from './PoolBg.jsx';
import { headerBanier } from '../../client-config/brand.js';

const Results = ({ profile }) => (
  <PoolBg overlay>
    <div className="results-card">
      {/* TODO: replace placeholder with actual drink photo from client-config/assets */}
      <div className="results-card__photo" aria-hidden="true" />
      <div className="results-card__body">
        <div className="results-card__drink-block">
          <h1 className="results-card__drink-name">{profile?.drink}</h1>
          <p className="results-card__tagline">{profile?.tagline}</p>
        </div>
        <p className="results-card__description">{profile?.description}</p>
      </div>
    </div>
    <img src={headerBanier} alt="Nespresso × MJF" className="results-footer-logo" />
  </PoolBg>
);

export default Results;
```

- [ ] **Step 2: Rewrite Results.css**

```css
/* White card — Figma: top:54 left:30 w:327 h:631 br:32 */
.results-card {
  margin: 54px 30px 0;
  width: 327px;
  min-height: 631px;
  background: #fff;
  border-radius: 32px;
  overflow: hidden;
  flex-shrink: 0;
}

/* Drink image area — Figma: h:298, full width, clipped by card radius */
.results-card__photo {
  width: 100%;
  height: 298px;
  background: var(--navy);
  /* TODO: swap for <img> with actual drink photo when assets are added:
     width: 100%; height: 298px; object-fit: cover; */
}

.results-card__body {
  padding: 27px 20px 28px;
}

.results-card__drink-block {
  margin-bottom: 18px;
}

.results-card__drink-name {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 24px;
  font-weight: 700;
  color: var(--navy);
  text-transform: uppercase;
  line-height: 1.15;
  margin: 0 0 4px;
}

.results-card__tagline {
  font-size: 14px;
  color: var(--navy);
  opacity: 0.75;
  letter-spacing: 0.04em;
  margin: 0;
}

.results-card__description {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 16px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1.6;
  margin: 0;
}

/* MJF logo outside card, bottom of scroll area */
.results-footer-logo {
  margin: 24px 0 40px;
  height: 52px;
  object-fit: contain;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU
git add src/components/Results.jsx src/components/Results.css
git commit -m "feat: Results — Figma white card on pool bg, drink placeholder, no restart

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 5 — SwipeTutorial: replace solid navy with PoolBg

**Files:**
- Modify: `src/components/SwipeTutorial.jsx`
- Modify: `src/components/SwipeTutorial.css`

Figma frame 10 shows:
- Pool bg + navy overlay
- "Swipe right for In. / Swipe left for Out." — white, fs:35, Gustavo, centered, top:229
- "OUT" (left) + "IN" (right) — white, fs:48, Gustavo, at ~top:364
- MJF logo at bottom

- [ ] **Step 1: Rewrite SwipeTutorial.jsx**

```jsx
import React from 'react';
import './SwipeTutorial.css';
import PoolBg from './PoolBg.jsx';
import { headerBanier } from '../../client-config/brand.js';

const SwipeTutorial = ({ onReady }) => (
  <PoolBg overlay>
    <div className="tutorial-content">
      <p className="tutorial-instructions">
        Swipe right<br />for In.<br /><br />Swipe left<br />for Out.
      </p>
      <div className="tutorial-inout">
        <span className="tutorial-out">OUT</span>
        <span className="tutorial-in">IN</span>
      </div>
      <button className="tutorial-cta" onClick={onReady}>
        C'est parti
      </button>
    </div>
    <img src={headerBanier} alt="Nespresso × MJF" className="tutorial-footer-logo" />
  </PoolBg>
);

export default SwipeTutorial;
```

- [ ] **Step 2: Rewrite SwipeTutorial.css**

```css
.tutorial-content {
  margin-top: 229px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  text-align: center;
  padding: 0 24px;
}

.tutorial-instructions {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 35px;
  font-weight: 700;
  color: #fff;
  line-height: 1.25;
  margin: 0 0 40px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.tutorial-inout {
  display: flex;
  justify-content: space-between;
  width: 100%;
  max-width: 320px;
  margin-bottom: 48px;
}

.tutorial-out,
.tutorial-in {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 48px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.03em;
}

.tutorial-cta {
  padding: 16px 48px;
  background: var(--pink-cta);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: opacity 0.15s, transform 0.15s;
}

.tutorial-cta:hover {
  opacity: 0.88;
  transform: scale(1.02);
}

.tutorial-cta:focus {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.tutorial-cta:active {
  transform: scale(0.97);
}

.tutorial-footer-logo {
  margin: auto 0 40px;
  height: 52px;
  object-fit: contain;
  flex-shrink: 0;
}
```

- [ ] **Step 3: Verify build**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU
git add src/components/SwipeTutorial.jsx src/components/SwipeTutorial.css
git commit -m "feat: SwipeTutorial — use PoolBg, Figma layout (swipe text + IN/OUT labels)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 6 — Congradulation: replace solid blue with PoolBg

**Files:**
- Modify: `src/components/Congradulation.jsx`
- Modify: `src/components/Congradulation.css`

- [ ] **Step 1: Update Congradulation.jsx to use PoolBg**

Replace the `<div className="loading-page">` root with `<PoolBg overlay>`:

```jsx
import React, { useEffect } from 'react';
import './Congradulation.css';
import PoolBg from './PoolBg.jsx';
import { congratsLoading } from '../../client-config/content.js';
import { saveResult } from '../services/saveResult.js';

const Congradulation = ({ profile, answers, userData, onShowResults }) => {
  useEffect(() => {
    const run = async () => {
      const saved = await saveResult(userData, answers, profile);
      if (!saved) console.warn('Quiz result save failed, proceeding to show results');
      // Minimum 2s display so the loader feels intentional
      await new Promise(resolve => setTimeout(resolve, 2000));
      onShowResults();
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PoolBg overlay>
      <div className="loading-body">
        <div className="loading-spinner" aria-label="Loading" />
        <p className="loading-text">{congratsLoading}</p>
      </div>
    </PoolBg>
  );
};

export default Congradulation;
```

- [ ] **Step 2: Update Congradulation.css**

The root `loading-page` fixed positioning is now handled by PoolBg. Replace with:

```css
/* PoolBg handles the fixed full-screen bg — these styles handle the content inside */
.loading-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 32px;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #fff;
  text-align: center;
  max-width: 280px;
  line-height: 1.5;
}
```

- [ ] **Step 3: Update PoolBg.css to support flex-1 children**

In `src/components/PoolBg.css`, ensure `.pool-bg__content` supports `flex: 1` for the loading body:
```css
.pool-bg__content {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  -webkit-overflow-scrolling: touch;
}
```
(No change needed — already correct from Task 1.)

- [ ] **Step 4: Verify build**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU
git add src/components/Congradulation.jsx src/components/Congradulation.css
git commit -m "feat: Congradulation — use PoolBg+overlay, keep spinner and loading text

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---

## Task 7 — Final verify + push

- [ ] **Step 1: Check for any stale imports or dead references**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU
grep -r "rsvp\.eyebrow\|rsvp\.subheading\|rsvp\.attendYes\|rsvp\.attendNo\|results-restart\|loading-page" src/ --include="*.jsx" --include="*.css"
```
Expected: no matches (old props removed).

- [ ] **Step 2: Full build**

```bash
npm run build 2>&1
```
Expected: clean build, no warnings about undefined variables.

- [ ] **Step 3: Git log sanity check**

```bash
git log --oneline -8
```

- [ ] **Step 4: Push**

```bash
git push origin main
```
