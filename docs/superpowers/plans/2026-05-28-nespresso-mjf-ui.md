# Nespresso MJF UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 9 Figma screens for the Nespresso × MJF quiz app, replacing the generic Trivial-YOU UI with the branded Nespresso flow: RSVP → quiz intro → swipe tutorial → quiz (3 cards) → loading → result.

**Architecture:** Extend the existing React/Vite + Node/Express app. App.jsx becomes a 6-step state machine. Each screen is a focused component importing copy/assets from `client-config/`. The server-side profile matching switches from score-based to exact-key lookup, because 3 binary questions produce only 8 combinations.

**Tech Stack:** React 18, Vite, CSS modules (no CSS-in-JS), Node/Express, SQLite (better-sqlite3)

---

## Figma Color Reference

```
--bg-cream:    #F1F0E3   (page background)
--navy:        #1C2869   (headings, text)
--blue-band:   #749BD1   (loading screen bg, RSVP band)
--pink-cta:    #C93772   (primary buttons)
--overlay:     rgba(28, 40, 105, 0.7)  (quiz card dark overlay)
```

## Font Note

`// TODO: replace Georgia fallback with Gustavo_Display_Nespresso_Test once font files are provided by client`  
Add `@font-face` to `client-config/fonts.css` when fonts arrive. Until then all headings use `Georgia, serif`.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/index.css` | Modify | Add CSS color tokens, set body bg to cream |
| `client-config/fonts.css` | Modify | Add font TODO comment (no functional change yet) |
| `client-config/profiles.js` | Rewrite | 5 profiles with `traitCombinations` arrays for exact-key matching |
| `client-config/questions.js` | Rewrite | 3 questions with named traits (groove/chill, vinyl/digital, backstage/frontrow) + bg image imports |
| `client-config/content.js` | Modify | Add `rsvp` object, `quizIntro` object, update `congratsLoading` |
| `server.js` | Modify | Import PROFILES from client-config; replace score-based matching with exact-key lookup; return `{ profile: { id, drink, tagline, description } }` |
| `src/services/llmProfile.js` | Modify | Accept profile object response instead of string; update validation check |
| `src/utils/getMockProfiles.js` | Modify | Return a profile object (same shape as server response) instead of string |
| `src/components/RsvpForm.jsx` | Create | RSVP invitation form (Figma 3005-450) |
| `src/components/RsvpForm.css` | Create | RSVP form styles |
| `src/components/SwipeTutorial.jsx` | Create | Swipe left/right tutorial screen (Figma 3005-935) |
| `src/components/SwipeTutorial.css` | Create | Tutorial styles |
| `src/App.jsx` | Rewrite | 6-step state machine: rsvp → quiz-intro → tutorial → quiz → loading → result |
| `src/App.css` | Modify | Quiz-intro screen styles; remove old Trivial-YOU styles |
| `src/Questions.jsx` | Modify | Fix `./logo/` imports → `client-config/brand.js`; pass `progressLabel` prop |
| `src/components/QuestionCard.jsx` | Modify | Add BACK button, progress bar, navy overlay treatment |
| `src/components/QuestionCard.css` | Rewrite | Nespresso card: full-screen bg, navy overlay, pink IN/OUT indicators |
| `src/components/Congradulation.jsx` | Rewrite | Blue loading screen, auto-trigger on mount (no button) |
| `src/components/Congradulation.css` | Rewrite | Blue-band loading styles, CSS spin animation |
| `src/components/Results.jsx` | Rewrite | White rounded card: drink name, tagline, description, restart button |
| `src/components/Results.css` | Rewrite | Result card styles |

---

## Task 1: CSS Tokens

**Files:**
- Modify: `src/index.css`
- Modify: `client-config/fonts.css`

- [ ] **Step 1: Update `src/index.css`**

Replace the entire file content:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg-cream:   #F1F0E3;
  --navy:       #1C2869;
  --blue-band:  #749BD1;
  --pink-cta:   #C93772;
  --overlay:    rgba(28, 40, 105, 0.7);
  --primary-color: var(--pink-cta);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  background: var(--bg-cream);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

#root {
  width: 100%;
  min-height: 100vh;
}
```

- [ ] **Step 2: Add TODO comment to `client-config/fonts.css`**

Prepend to the file:

```css
/* TODO: replace Georgia fallback with Gustavo_Display_Nespresso_Test once font files are provided by client
   Add @font-face declarations here when the .woff2 files arrive. */
```

- [ ] **Step 3: Verify build compiles**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1 | tail -5
```

Expected: `✓ built in` with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.css client-config/fonts.css
git commit -m "feat: add Nespresso CSS color tokens and font TODO"
```

---

## Task 2: Profiles — exact-key matching format

**Files:**
- Rewrite: `client-config/profiles.js`

- [ ] **Step 1: Replace `client-config/profiles.js` entirely**

```js
/**
 * Nespresso × MJF — Coffee profiles
 *
 * traitCombinations: each entry is an array of 3 trait values [backstage/frontrow, groove/chill, vinyl/digital]
 * Matching is exact (not scored): the 3 answers are sorted and joined, then looked up against sorted combos.
 */

export const PROFILES = [
  {
    id: 'bold',
    drink: 'Ice Yuzu Tonic',
    tagline: 'Bold, fearless, all-in.',
    description: 'Espresso meets yuzu over iced tonic, with a twist of gin — bold, unapologetic, one of a kind. You don\'t test the water. You dive in. And the pool is always warm.',
    traitCombinations: [
      ['backstage', 'groove', 'vinyl'],   // IN IN IN
    ],
  },
  {
    id: 'electric',
    drink: 'Ice Yuzu Tonic',
    tagline: 'Electric, exclusive, unexpected.',
    description: 'Espresso meets yuzu over iced tonic, with a twist of gin. You\'re the one who finds the hidden door at the Nespresso Terrasse — and orders something that sparks.',
    traitCombinations: [
      ['backstage', 'groove', 'digital'], // IN IN OUT
      ['frontrow', 'groove', 'digital'],  // OUT IN OUT
    ],
  },
  {
    id: 'pincolada',
    drink: 'Ice Piña Colada',
    tagline: 'Smooth, exotic, effortless.',
    description: 'Espresso, coconut, pineapple — three islands, one cup. You drift into the Pool Universe like you own it.',
    traitCombinations: [
      ['backstage', 'chill', 'digital'],  // IN OUT OUT
      ['frontrow', 'groove', 'vinyl'],    // OUT IN IN
    ],
  },
  {
    id: 'classic',
    drink: 'Nespresso Martini',
    tagline: 'Classic, refined, timeless.',
    description: 'Under warm lights and deep basslines, you choose the essence. Espresso shaken with vodka and coffee liqueur — pure, iconic, no compromise. You don\'t chase trends, you set the tone.',
    traitCombinations: [
      ['backstage', 'chill', 'vinyl'],    // IN OUT IN
      ['frontrow', 'chill', 'vinyl'],     // OUT OUT IN
    ],
  },
  {
    id: 'pure',
    drink: 'Nespresso Martini',
    tagline: 'Pure, open, undefined.',
    description: 'Espresso, vodka, coffee liqueur — shaken, not overthought. No label needed. The best nights are the ones you didn\'t plan.',
    traitCombinations: [
      ['frontrow', 'chill', 'digital'],   // OUT OUT OUT
    ],
  },
];

// Used in dev mode (llmProfile.js falls back to this)
export const mockProfile = PROFILES[0];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add client-config/profiles.js
git commit -m "feat: Nespresso profiles with exact trait-combination matching"
```

---

## Task 3: Questions with named traits

**Files:**
- Rewrite: `client-config/questions.js`

- [ ] **Step 1: Replace `client-config/questions.js` entirely**

```js
import grooveBg from './assets/groove.png';
import vinylBg from './assets/vinyl.jpg';
import backstageBg from './assets/backstage.png';

export const sheetConfig = {
  apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY,
  sheetId: import.meta.env.VITE_GOOGLE_SHEET_ID,
  range: 'A2:D',
};

/**
 * Quiz questions.
 * traitRight = answer stored when user swipes RIGHT (IN)
 * traitLeft  = answer stored when user swipes LEFT  (OUT)
 *
 * Q1: GROOVE?    → right: groove   / left: chill
 * Q2: VINYL?     → right: vinyl    / left: digital
 * Q3: BACKSTAGE? → right: backstage/ left: frontrow
 */
export const mockQuestions = [
  {
    question: 'GROOVE?',
    traitRight: 'groove',
    traitLeft: 'chill',
    bgImage: grooveBg,
  },
  {
    question: 'VINYL?',
    traitRight: 'vinyl',
    traitLeft: 'digital',
    bgImage: vinylBg,
  },
  {
    question: 'BACKSTAGE?',
    traitRight: 'backstage',
    traitLeft: 'frontrow',
    bgImage: backstageBg,
  },
];
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add client-config/questions.js
git commit -m "feat: Nespresso quiz questions with named traits and bg images"
```

---

## Task 4: Content strings

**Files:**
- Modify: `client-config/content.js`

- [ ] **Step 1: Replace `client-config/content.js` entirely**

```js
// TODO: URL-key invitation gating — before showing the RSVP form, validate a URL param (e.g. ?key=xxx)
// against the mailing list server-side. Only invited guests see the RSVP; quiz can be open to all.

export const rsvp = {
  eyebrow: 'NESPRESSO × MONTREUX JAZZ FESTIVAL',
  heading: 'VOUS ÊTES INVITÉ·E',
  subheading: 'Confirmez votre présence pour accéder à l\'expérience.',
  firstNameLabel: 'Prénom',
  lastNameLabel: 'Nom',
  emailLabel: 'Email',
  attendYes: 'Je serai présent·e',
  attendNo: 'Je ne pourrai pas venir',
  ctaLabel: 'Découvrir mon profil café',
};

export const quizIntro = {
  eyebrow: 'NESPRESSO × MONTREUX JAZZ FESTIVAL',
  heading: 'QUEL EST\nVOTRE PROFIL\nCAFÉ ?',
  body: 'Trois questions. Swipez à droite pour IN, à gauche pour OUT. Découvrez votre cocktail café signature.',
  ctaLabel: 'C\'est parti',
};

export const congratsLoading = 'YOUR RESULT IS LOADING';

export const privacy =
  'Vos données sont utilisées uniquement dans le cadre de cet événement Nespresso × MJF. Elles ne sont ni exploitées commercialement ni transmises à des tiers.';

export const resultsEmailSent = 'Votre profil café vous a été envoyé par email.';

export const resultsFooterLink = {
  label: 'nespresso.com',
  href: 'https://www.nespresso.com',
};
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 3: Commit**

```bash
git add client-config/content.js
git commit -m "feat: Nespresso content strings — RSVP, quiz-intro, loading"
```

---

## Task 5: Server — exact profile matching

**Files:**
- Modify: `server.js` (lines ~1-10 for imports, ~177-270 for PROFILES + matching)

The goal: remove the hardcoded PROFILES array and score-based finder from server.js; import from client-config; use exact-key lookup; return a profile object instead of a text string.

- [ ] **Step 1: Add import at the top of server.js**

After the existing imports block (around line 10), add:

```js
import { PROFILES } from './client-config/profiles.js';
```

- [ ] **Step 2: Delete the hardcoded PROFILES const (lines ~177–249)**

Remove everything from `const PROFILES = [` through the closing `];` — the entire 5-profile array that ends just before the `getChosenTraits` function. This is approximately lines 177–249 in the current file.

- [ ] **Step 3: Replace `getChosenTraits` and `findBestProfile` with exact-key lookup**

Replace the two functions (lines ~250–271) with:

```js
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
```

- [ ] **Step 4: Update the generate-profile endpoint to return the profile object**

Find the line `res.json({ profile: profile.text });` inside the `/api/generate-profile` handler and replace it with:

```js
res.json({
  profile: {
    id: profile.id,
    drink: profile.drink,
    tagline: profile.tagline,
    description: profile.description,
  },
});
```

- [ ] **Step 5: Update the admin page profile display (line ~333)**

Find `const profile = r.profile?.split("\n")[0]?.replace(/^##\s*/, "") || "";` and replace with:

```js
const profileData = typeof r.profile === 'string' ? JSON.parse(r.profile) : r.profile;
const profile = profileData?.drink ? `${profileData.drink} — ${profileData.tagline}` : (r.profile || '');
```

Also update the save-result handler so `profile` is stored as JSON string. Find where it does:
```js
stmt.run(name || "", company || "", email || "", profile || "", JSON.stringify(answers || []));
```
And replace `profile || ""` with `JSON.stringify(profile) || ""`.

- [ ] **Step 6: Verify server starts**

```bash
node server.js &
sleep 2 && curl -s -X POST http://localhost:3001/api/generate-profile \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"answer":"groove"},{"answer":"vinyl"},{"answer":"backstage"}]}' | node -e "process.stdin|>JSON.parse|>console.log" 2>/dev/null || \
curl -s -X POST http://localhost:3001/api/generate-profile \
  -H "Content-Type: application/json" \
  -d '{"answers":[{"answer":"groove"},{"answer":"vinyl"},{"answer":"backstage"}]}' && kill %1
```

Expected: JSON with `profile.drink: "Ice Yuzu Tonic"` and `profile.tagline: "Bold, fearless, all-in."`

- [ ] **Step 7: Commit**

```bash
git add server.js
git commit -m "feat: server exact-key profile matching, return profile object"
```

---

## Task 6: Frontend profile service — accept profile object

**Files:**
- Modify: `src/services/llmProfile.js`
- Modify: `src/utils/getMockProfiles.js`

- [ ] **Step 1: Update `src/services/llmProfile.js`**

Replace the validation check `if (!data.profile || data.profile.length < 50)` with an object check:

```js
if (!data.profile || !data.profile.drink) {
  console.warn("Backend response missing profile data, using mock");
  return getMockProfile(answers);
}
```

Keep everything else the same. The function now returns `data.profile` which is `{ id, drink, tagline, description }`.

- [ ] **Step 2: Update `src/utils/getMockProfiles.js`**

Replace the entire file:

```js
import { mockProfile } from '../../client-config/profiles.js';

// Returns the first profile as mock (same shape as server response)
const getMockProfile = (_answers) => ({
  id: mockProfile.id,
  drink: mockProfile.drink,
  tagline: mockProfile.tagline,
  description: mockProfile.description,
});

export default getMockProfile;
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/services/llmProfile.js src/utils/getMockProfiles.js
git commit -m "feat: frontend profile service accepts {drink, tagline, description} object"
```

---

## Task 7: RsvpForm component

**Files:**
- Create: `src/components/RsvpForm.jsx`
- Create: `src/components/RsvpForm.css`

Design reference: Figma 3005-450. Cream background, navy text, blue band header with "VOUS ÊTES INVITÉ·E", form fields, two attending buttons (YES / NO), pink CTA "Découvrir mon profil café".

- [ ] **Step 1: Create `src/components/RsvpForm.jsx`**

```jsx
import React, { useState } from 'react';
import './RsvpForm.css';
import { rsvp } from '../../client-config/content.js';

const RsvpForm = ({ onSubmit }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    attending: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAttend = (value) => {
    setForm({ ...form, attending: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.email || form.attending === null) return;
    onSubmit(form);
  };

  const isValid = form.firstName && form.email && form.attending !== null;

  return (
    <div className="rsvp-page">
      <div className="rsvp-band">
        <p className="rsvp-eyebrow">{rsvp.eyebrow}</p>
        <h1 className="rsvp-heading">{rsvp.heading}</h1>
      </div>
      <form className="rsvp-form" onSubmit={handleSubmit}>
        <p className="rsvp-subheading">{rsvp.subheading}</p>
        <div className="rsvp-fields">
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
        </div>
        <div className="rsvp-attend-buttons">
          <button
            type="button"
            className={`rsvp-attend ${form.attending === true ? 'selected' : ''}`}
            onClick={() => handleAttend(true)}
          >
            {rsvp.attendYes}
          </button>
          <button
            type="button"
            className={`rsvp-attend ${form.attending === false ? 'selected' : ''}`}
            onClick={() => handleAttend(false)}
          >
            {rsvp.attendNo}
          </button>
        </div>
        <button className="rsvp-cta" type="submit" disabled={!isValid}>
          {rsvp.ctaLabel}
        </button>
      </form>
    </div>
  );
};

export default RsvpForm;
```

- [ ] **Step 2: Create `src/components/RsvpForm.css`**

```css
.rsvp-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-cream);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rsvp-band {
  width: 100%;
  background: var(--blue-band);
  padding: 32px 24px 28px;
  text-align: center;
}

.rsvp-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--navy);
  margin-bottom: 10px;
}

.rsvp-heading {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test once provided */
  font-size: 36px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1.1;
}

.rsvp-form {
  width: 100%;
  max-width: 440px;
  padding: 32px 24px 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rsvp-subheading {
  font-size: 14px;
  color: var(--navy);
  line-height: 1.5;
  margin-bottom: 4px;
}

.rsvp-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rsvp-input {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--navy);
  border-radius: 8px;
  background: transparent;
  font-size: 15px;
  color: var(--navy);
  outline: none;
}

.rsvp-input::placeholder {
  color: rgba(28, 40, 105, 0.45);
}

.rsvp-input:focus {
  border-color: var(--pink-cta);
}

.rsvp-attend-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rsvp-attend {
  width: 100%;
  padding: 14px 16px;
  border: 1.5px solid var(--navy);
  border-radius: 8px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--navy);
  cursor: pointer;
  text-align: left;
  transition: background 0.15s, color 0.15s;
}

.rsvp-attend.selected {
  background: var(--navy);
  color: #fff;
}

.rsvp-cta {
  margin-top: 8px;
  width: 100%;
  padding: 16px;
  background: var(--pink-cta);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  transition: opacity 0.15s;
}

.rsvp-cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/components/RsvpForm.jsx src/components/RsvpForm.css
git commit -m "feat: RsvpForm component — invitation form screen"
```

---

## Task 8: SwipeTutorial component

**Files:**
- Create: `src/components/SwipeTutorial.jsx`
- Create: `src/components/SwipeTutorial.css`

Design reference: Figma 3005-935. Full-screen dark overlay over a photo background, left arrow (OUT / grey), right arrow (IN / green), big prompt text, "C'est parti" button.

- [ ] **Step 1: Create `src/components/SwipeTutorial.jsx`**

```jsx
import React from 'react';
import './SwipeTutorial.css';
import { logoIN, logoOUT, logoSwipe } from '../../client-config/brand.js';

const SwipeTutorial = ({ onReady }) => {
  return (
    <div className="tutorial-page">
      <div className="tutorial-overlay" />
      <div className="tutorial-content">
        <div className="tutorial-arrows">
          <div className="tutorial-side tutorial-left">
            <img src={logoOUT} alt="OUT" className="tutorial-arrow-img" />
            <span className="tutorial-label out">OUT</span>
          </div>
          <img src={logoSwipe} alt="Swipe" className="tutorial-swipe-icon" />
          <div className="tutorial-side tutorial-right">
            <span className="tutorial-label in">IN</span>
            <img src={logoIN} alt="IN" className="tutorial-arrow-img" />
          </div>
        </div>
        <p className="tutorial-hint">Swipez pour répondre</p>
        <button className="tutorial-cta" onClick={onReady}>
          C'est parti
        </button>
      </div>
    </div>
  );
};

export default SwipeTutorial;
```

- [ ] **Step 2: Create `src/components/SwipeTutorial.css`**

```css
.tutorial-page {
  position: fixed;
  inset: 0;
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
}

.tutorial-overlay {
  position: absolute;
  inset: 0;
  background: var(--overlay);
  z-index: 0;
}

.tutorial-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 40px 24px;
  text-align: center;
}

.tutorial-arrows {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.tutorial-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tutorial-arrow-img {
  width: 56px;
  height: auto;
  filter: brightness(0) invert(1);
}

.tutorial-label {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.tutorial-label.out {
  color: #fff;
}

.tutorial-label.in {
  color: #a5ff02;
}

.tutorial-swipe-icon {
  width: 72px;
  height: auto;
  filter: brightness(0) invert(1);
  opacity: 0.85;
}

.tutorial-hint {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.06em;
}

.tutorial-cta {
  margin-top: 8px;
  padding: 16px 48px;
  background: var(--pink-cta);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/components/SwipeTutorial.jsx src/components/SwipeTutorial.css
git commit -m "feat: SwipeTutorial component — IN/OUT swipe instructions"
```

---

## Task 9: App.jsx — 6-step state machine

**Files:**
- Rewrite: `src/App.jsx`
- Modify: `src/App.css` (remove old styles, add quiz-intro styles)

Steps: `rsvp` → `quiz-intro` → `tutorial` → `quiz` → `loading` → `result`

- [ ] **Step 1: Replace `src/App.jsx` entirely**

```jsx
import React, { useState } from 'react';
import './App.css';
import { logoGame } from '../client-config/brand.js';
import { quizIntro } from '../client-config/content.js';
import RsvpForm from './components/RsvpForm.jsx';
import SwipeTutorial from './components/SwipeTutorial.jsx';
import Questions from './Questions.jsx';

// TODO: URL-key invitation gating — read ?key=<token> from URL, validate against mailing list
// before rendering RsvpForm. Users without a valid key see only the quiz (no form).

function App() {
  const [step, setStep] = useState('rsvp'); // rsvp | quiz-intro | tutorial | quiz | result
  const [userData, setUserData] = useState(null);

  const handleRsvpSubmit = (formData) => {
    setUserData(formData);
    setStep('quiz-intro');
  };

  const handleStartQuiz = () => setStep('tutorial');
  const handleTutorialReady = () => setStep('quiz');
  const handleRestart = () => {
    setUserData(null);
    setStep('rsvp');
  };

  if (step === 'rsvp') {
    return <RsvpForm onSubmit={handleRsvpSubmit} />;
  }

  if (step === 'quiz-intro') {
    return (
      <div className="quiz-intro-page">
        <div className="quiz-intro-band">
          <p className="quiz-intro-eyebrow">{quizIntro.eyebrow}</p>
        </div>
        <div className="quiz-intro-body">
          <h1 className="quiz-intro-heading">{quizIntro.heading}</h1>
          <p className="quiz-intro-text">{quizIntro.body}</p>
          <button className="quiz-intro-cta" onClick={handleStartQuiz}>
            {quizIntro.ctaLabel}
          </button>
        </div>
        <img src={logoGame} alt="Nespresso × MJF" className="quiz-intro-logo" />
      </div>
    );
  }

  if (step === 'tutorial') {
    return <SwipeTutorial onReady={handleTutorialReady} />;
  }

  if (step === 'quiz' || step === 'result') {
    return (
      <Questions
        userData={userData}
        onRestart={handleRestart}
      />
    );
  }

  return null;
}

export default App;
```

- [ ] **Step 2: Replace `src/App.css` with quiz-intro styles**

```css
/* Quiz intro screen */
.quiz-intro-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-cream);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quiz-intro-band {
  width: 100%;
  background: var(--blue-band);
  padding: 20px 24px;
  text-align: center;
}

.quiz-intro-eyebrow {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--navy);
}

.quiz-intro-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 32px 32px;
  gap: 24px;
  text-align: center;
}

.quiz-intro-heading {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 48px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1.1;
  white-space: pre-line;
}

.quiz-intro-text {
  font-size: 15px;
  color: var(--navy);
  line-height: 1.6;
  max-width: 320px;
  opacity: 0.8;
}

.quiz-intro-cta {
  margin-top: 16px;
  padding: 16px 56px;
  background: var(--pink-cta);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.quiz-intro-logo {
  width: 120px;
  height: auto;
  margin: 24px auto 40px;
  opacity: 0.6;
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/App.css
git commit -m "feat: App.jsx 6-step state machine — rsvp → quiz-intro → tutorial → quiz → result"
```

---

## Task 10: Questions.jsx — fix logo imports, pass progressLabel

**Files:**
- Modify: `src/Questions.jsx`

- [ ] **Step 1: Replace the four `./logo/` import lines**

Find:
```js
import headerBanier from './logo/headerBanier.svg';
import logoIN from './logo/logoIN.svg';
import logoOUT from './logo/logoOUT.svg';
import logoSwipe from './logo/logoSwipe.svg';
```

Replace with:
```js
import { headerBanier, logoIN, logoOUT, logoSwipe } from '../client-config/brand.js';
```

- [ ] **Step 2: Add progressLabel to QuestionCard**

Find the `<QuestionCard` JSX in Questions.jsx (around line 225). Add the `progressLabel` prop:

```jsx
progressLabel={`${currentIndex + 1}/3`}
```

So the QuestionCard line becomes:
```jsx
<QuestionCard
  key={index}
  ref={currentCardRef}
  question={questions[index]}
  bgImage={questions[index]?.bgImage}
  progressLabel={`${currentIndex + 1}/3`}
  onSwipe={handleSwipe}
  stackIndex={index - currentIndex}
  pointEvents={index === currentIndex ? 'auto' : 'none'}
  resetPosition={resetPosition}
/>
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/Questions.jsx
git commit -m "fix: Questions.jsx imports logos from client-config/brand, adds progressLabel"
```

---

## Task 11: QuestionCard — Nespresso design

**Files:**
- Modify: `src/components/QuestionCard.jsx`
- Rewrite: `src/components/QuestionCard.css`

Design reference: Figma 3005-1352 / 3027-18 / 3027-122. Full-screen bg photo, navy overlay (`--overlay`), question text centered, BACK button top-left, progress top-right (e.g. "2/3"), IN/OUT indicators on drag.

- [ ] **Step 1: Add `progressLabel` prop to QuestionCard**

Find the `forwardRef(({ question, bgImage, onSwipe, stackIndex = 0, pointEvents, resetPosition` signature and add `progressLabel = ''`:

```jsx
const QuestionCard = forwardRef(({ question, bgImage, onSwipe, stackIndex = 0, pointEvents, resetPosition, progressLabel = '' }, ref) => {
```

- [ ] **Step 2: Update the JSX return in QuestionCard**

Replace the entire `return (` block with:

```jsx
return (
  <div
    ref={cardRef}
    className={`question-card${bgImage ? ' has-bg' : ''}${isDragging ? ' dragging' : ''}`}
    style={{
      '--bg-image': bgImage ? `url(${bgImage})` : 'none',
      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) rotate(${position.x * 0.03}deg)`,
      zIndex: 10 - stackIndex,
      pointerEvents: pointEvents,
      opacity: stackIndex === 0 ? 1 : 0.85 - stackIndex * 0.1,
    }}
    onMouseDown={handleMouseDown}
    onMouseMove={handleMouseMove}
    onMouseUp={handleMouseUp}
    onMouseLeave={handleMouseUp}
    onTouchStart={handleTouchStart}
    onTouchMove={handleTouchMove}
    onTouchEnd={handleTouchEnd}
  >
    {progressLabel && (
      <span className="card-progress">{progressLabel}</span>
    )}

    {/* IN indicator — shown when dragging right */}
    <span
      className="swipe-indicator right"
      style={{ opacity: position.x > 20 ? Math.min((position.x - 20) / 80, 1) : 0 }}
    >
      IN
    </span>
    {/* OUT indicator — shown when dragging left */}
    <span
      className="swipe-indicator left"
      style={{ opacity: position.x < -20 ? Math.min((-position.x - 20) / 80, 1) : 0 }}
    >
      OUT
    </span>

    <div className="card-content">
      <h2>{question?.question}</h2>
    </div>

    <div className="button-controls">
      <button
        className="control-button no-button"
        onClick={() => !disabledButton && handleButtonClick('left')}
        disabled={disabledButton}
      >
        OUT
      </button>
      <button
        className="control-button yes-button"
        onClick={() => !disabledButton && handleButtonClick('right')}
        disabled={disabledButton}
      >
        IN
      </button>
    </div>
  </div>
);
```

- [ ] **Step 3: Replace `src/components/QuestionCard.css` entirely**

```css
.question-card {
  position: absolute;
  width: 90vw;
  max-width: 420px;
  height: 520px;
  border-radius: 20px;
  cursor: grab;
  touch-action: none;
  user-select: none;
  transition: transform 0.8s ease, opacity 0.8s ease;
  transform: translate(-50%, -50%);
  overflow: hidden;
  background: var(--navy);
}

.question-card.dragging {
  cursor: grabbing;
  transition: none;
}

/* Full-screen background image */
.question-card::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: var(--bg-image);
  background-size: cover;
  background-position: center;
  z-index: 0;
}

/* Navy overlay */
.question-card.has-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--overlay);
  z-index: 1;
}

/* Progress label — top right */
.card-progress {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.7);
}

/* IN / OUT drag indicators */
.swipe-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 64px;
  font-weight: 700;
  letter-spacing: 0.05em;
  pointer-events: none;
  transition: opacity 0.1s;
}

.swipe-indicator.right {
  right: 24px;
  color: #a5ff02;
}

.swipe-indicator.left {
  left: 24px;
  color: #ff6a7b;
}

/* Question text */
.card-content {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.card-content h2 {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 40px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

/* IN/OUT buttons (desktop) */
.button-controls {
  position: absolute;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 10;
}

.control-button {
  width: 96px;
  height: 48px;
  border-radius: 24px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.12);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.08em;
  cursor: pointer;
  color: #fff;
  transition: background 0.15s;
}

.no-button:hover { background: rgba(255, 106, 123, 0.5); }
.yes-button:hover { background: rgba(165, 255, 2, 0.3); }

@media (max-width: 768px) {
  .button-controls { display: none; }
  .question-card { height: 440px; }
}
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add src/components/QuestionCard.jsx src/components/QuestionCard.css
git commit -m "feat: QuestionCard Nespresso design — full-screen bg, navy overlay, progress, IN/OUT"
```

---

## Task 12: Congradulation — blue loading screen, auto-trigger

**Files:**
- Rewrite: `src/components/Congradulation.jsx`
- Rewrite: `src/components/Congradulation.css`

Design reference: Figma 3005-1863. Blue-band background, spinning circle animation (CSS only — no Font Awesome), "YOUR RESULT IS LOADING" text. Auto-triggers save + transition on mount (no user button click).

- [ ] **Step 1: Replace `src/components/Congradulation.jsx` entirely**

```jsx
import React, { useEffect } from 'react';
import './Congradulation.css';
import { congratsLoading } from '../../client-config/content.js';
import { saveQuizResult } from '../services/googleSheetsSave.js';

const Congradulation = ({ profile, answers, userData, onShowResults }) => {
  useEffect(() => {
    const run = async () => {
      await saveQuizResult(userData, answers, profile);
      // Minimum 2s display so the loader feels intentional
      await new Promise(resolve => setTimeout(resolve, 2000));
      onShowResults();
    };
    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="loading-page">
      <div className="loading-spinner" aria-label="Loading" />
      <p className="loading-text">{congratsLoading}</p>
    </div>
  );
};

export default Congradulation;
```

- [ ] **Step 2: Replace `src/components/Congradulation.css` entirely**

```css
.loading-page {
  position: fixed;
  inset: 0;
  background: var(--blue-band);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

- [ ] **Step 3: Update `googleSheetsSave.js` — fix userData shape**

The service currently accesses `userData?.userData[0]?.email`. With the new RsvpForm, `userData` is `{ firstName, lastName, email, attending }` directly. Find `src/services/googleSheetsSave.js` and update the body:

```js
body: JSON.stringify({
  name: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
  company: '',
  email: userData?.email || '',
  profile: profile ? JSON.stringify({ id: profile.id, drink: profile.drink, tagline: profile.tagline }) : '',
  answers: answers.map(a => ({ question: a.question?.question || a.question, answer: a.answer })),
}),
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add src/components/Congradulation.jsx src/components/Congradulation.css src/services/googleSheetsSave.js
git commit -m "feat: Congradulation — auto-trigger blue loading screen, fix userData shape"
```

---

## Task 13: Questions.jsx — wire Congradulation with new props

**Files:**
- Modify: `src/Questions.jsx`

The Congradulation component now receives `onShowResults` instead of relying on its own internal `showResults` state (which was triggered by a button). Results.jsx is now rendered from Questions.jsx after the loading screen triggers `onShowResults`.

- [ ] **Step 1: Update `showCongradulation` handling in Questions.jsx**

Add a `showResults` state alongside `showCongradulation`:

```js
const [showResults, setShowResults] = useState(false);
```

- [ ] **Step 2: Update the Congradulation JSX in Questions.jsx**

Find the `<Congradulation` element. Replace the props to match the new component signature:

```jsx
<Congradulation
  profile={profile}
  answers={answers}
  userData={userData}
  onShowResults={() => setShowResults(true)}
/>
```

- [ ] **Step 3: Add Results rendering after loading**

Find where Results.jsx is rendered in Questions.jsx (it was previously rendered from Congradulation). Now render it directly in Questions.jsx:

After the `{showCongradulation && !showResults && <Congradulation ... />}` block, add:

```jsx
{showResults && (
  <Results
    profile={profile}
    answers={answers}
    userData={userData}
    onRestart={onRestart}
  />
)}
```

Make sure `Results` is imported at the top of Questions.jsx:
```js
import Results from './components/Results.jsx';
```

- [ ] **Step 4: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add src/Questions.jsx
git commit -m "fix: Questions.jsx wires Congradulation onShowResults, renders Results directly"
```

---

## Task 14: Results — white card with drink, tagline, description

**Files:**
- Rewrite: `src/components/Results.jsx`
- Rewrite: `src/components/Results.css`

Design reference: Figma 3005-1958. Cream background, centered white rounded card. Drink name in large navy serif, tagline in smaller navy serif italic, description paragraph, restart button in pink, footer link.

- [ ] **Step 1: Replace `src/components/Results.jsx` entirely**

```jsx
import React from 'react';
import './Results.css';
import { resultsEmailSent, resultsFooterLink } from '../../client-config/content.js';

const Results = ({ profile, onRestart }) => {
  return (
    <div className="results-page">
      <div className="results-card">
        <p className="results-drink-name">{profile?.drink}</p>
        <p className="results-tagline">{profile?.tagline}</p>
        <p className="results-description">{profile?.description}</p>
        <button className="results-restart" onClick={onRestart}>
          Recommencer
        </button>
      </div>
      <div className="results-footer">
        <p>{resultsEmailSent}</p>
        <a href={resultsFooterLink.href} target="_blank" rel="noopener noreferrer">
          {resultsFooterLink.label}
        </a>
      </div>
    </div>
  );
};

export default Results;
```

- [ ] **Step 2: Replace `src/components/Results.css` entirely**

```css
.results-page {
  width: 100%;
  min-height: 100vh;
  background: var(--bg-cream);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px 40px;
  gap: 24px;
}

.results-card {
  width: 100%;
  max-width: 440px;
  background: #fff;
  border-radius: 24px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 40px rgba(28, 40, 105, 0.12);
  text-align: center;
}

.results-drink-name {
  font-family: Georgia, serif;
  /* TODO: replace with Gustavo_Display_Nespresso_Test */
  font-size: 32px;
  font-weight: 700;
  color: var(--navy);
  line-height: 1.1;
}

.results-tagline {
  font-family: Georgia, serif;
  font-size: 16px;
  font-style: italic;
  color: var(--navy);
  opacity: 0.7;
  line-height: 1.4;
}

.results-description {
  font-size: 15px;
  color: var(--navy);
  line-height: 1.7;
  opacity: 0.85;
  margin-top: 8px;
}

.results-restart {
  margin-top: 24px;
  padding: 14px 48px;
  background: var(--pink-cta);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
}

.results-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--navy);
  opacity: 0.5;
}

.results-footer a {
  color: var(--navy);
  text-decoration: underline;
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | tail -5
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Results.jsx src/components/Results.css
git commit -m "feat: Results card — drink name, tagline, description, pink restart button"
```

---

## Task 15: Final verification + push

- [ ] **Step 1: Full build check**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build 2>&1
```

Expected: no errors. If there are import errors, check that all `./logo/` references have been updated to `../client-config/brand.js` or `../../client-config/brand.js` (one `..` from `src/`, two from `src/components/`).

- [ ] **Step 2: Check for remaining `./logo/` imports**

```bash
grep -r "from './logo/" src/ --include="*.jsx" --include="*.js"
grep -r "from '../logo/" src/ --include="*.jsx" --include="*.js"
```

Expected: no matches. Fix any remaining ones by importing the named export from `client-config/brand.js`.

- [ ] **Step 3: Push to origin**

```bash
git push origin main
```

- [ ] **Step 4: Verify remote**

```bash
git log --oneline origin/main | head -5
```

Expected: latest commits visible.

---

## Open TODOs (tracked in code comments)

1. **Nespresso brand fonts** — add `@font-face` to `client-config/fonts.css` when `.woff2` files arrive. Replace all `Georgia, serif` fallbacks.
2. **Invitation URL-key gating** — before showing RsvpForm, read `?key=<token>` from URL, validate against mailing list server-side. Users without key skip RSVP and go straight to quiz.
3. **Result drink photo** — Figma node `3027:255` has a coffee drink image (imageRef `70ef25a6611277d225b10d6422453b78c3d179a5`). Download from Figma and add to `client-config/assets/result-drink.png` when client approves visual.
