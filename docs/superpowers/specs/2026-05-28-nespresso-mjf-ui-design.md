# Nespresso × MJF — UI Implementation Design

**Date:** 2026-05-28  
**Repo:** trivialmass/nespresso-mjf-YOU  
**Figma file:** jbD1p4tBnqoo19DSEj4GeG  
**Approach:** Option A — extend existing App.jsx state machine

---

## Overview

Implement 9 Figma screens for the Nespresso × Montreux Jazz Festival quiz app. The existing Trivial-YOU engine components are updated in-place and two new components are added. All client-specific content lives in `client-config/`.

---

## App Flow

```
rsvp → quiz-intro → tutorial → quiz → loading → result
```

| Step | Component | Source | Trigger to next |
|------|-----------|--------|-----------------|
| `rsvp` | `RsvpForm` (new) | Figma 3005-450 | CONFIRM button |
| `quiz-intro` | inline in `App.jsx` | Figma 3001-585 | "DISCOVER YOUR PROFILE" button |
| `tutorial` | `SwipeTutorial` (new) | Figma 3005-935 | tap anywhere |
| `quiz` | `Questions.jsx` (existing) | Figma 3005-1352 / 3027-18 / 3027-122 | all 3 cards swiped |
| `loading` | `Congradulation.jsx` (updated) | Figma 3005-1863 | auto 3s timer |
| `result` | `Results.jsx` (updated) | Figma 3005-1958 | — |

**RSVP attend/decline:** Both "I'd be delighted to attend" and "I won't be able to make it" proceed to the quiz. The choice is stored in `userData.attending` for backend tracking.

**TODO (future):** URL-key gate — show RSVP form only to users who received an invitation. Server checks a key in the URL against the mailing list. Non-invited users skip straight to `quiz-intro`.

---

## Color Tokens

Added to `src/index.css` as CSS custom properties:

| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-cream` | `#F1F0E3` | Page background |
| `--navy` | `#1C2869` | Primary text, overlays |
| `--blue-band` | `#749BD1` | Background band, loading screen |
| `--pink-cta` | `#C93772` | Primary CTA buttons |
| `--overlay` | `rgba(28, 40, 105, 0.7)` | Card dark overlay |

---

## Typography

**TODO:** Replace fallback font with official Nespresso fonts once provided by client.

Font stack: `'Gustavo_Display_Nespresso_Test', Georgia, serif`  
Body stack: `'Gustavo', Arial, sans-serif`

Applied globally via `client-config/fonts.css` → `src/main.jsx`.

---

## New Components

### `src/components/RsvpForm.jsx` + `RsvpForm.css`

**Figma:** 3005-450 "TM Quiz - frame 1 Welcome"

Layout (390×844, cream bg):
- Top: Nespresso × MJF logo (`logoGame.svg`)
- Italic heading: *"you're invited"* in navy
- White card containing:
  - 3 outlined input fields: First name\*, Last name\*, Email address\*
  - Radio toggle: "I'd be delighted to attend" / "I won't be able to make it" (default: attend)
  - Pink CONFIRM button (full width, 60px height, 50px border-radius)
- Blue decorative band (`#749BD1`) behind card

Props: `{ onConfirm(userData) }`  
On submit: validates non-empty fields, calls `onConfirm({ firstName, lastName, email, attending })`.

### `src/components/SwipeTutorial.jsx` + `SwipeTutorial.css`

**Figma:** 3005-935 "TM Quiz - frame 10"

Layout (full screen):
- Background: `headerBanier.svg` or photo, full-cover
- Dark navy overlay `rgba(28, 40, 105, 0.7)`
- Centered content:
  - Left arrow + "OUT" label (white, Gustavo Bold 48px)
  - Right arrow + "IN" label (white, Gustavo Bold 48px)
  - "Swipe right for IN. / Swipe left for OUT." text (white, uppercase, 35px, centered)
- Tap/click anywhere → `onDismiss()`

Props: `{ onDismiss() }`

---

## Updated Components

### `src/App.jsx`

State: `const [step, setStep] = useState('rsvp')`

**`quiz-intro` screen** (inline, Figma 3001-585):
- Cream bg, full screen
- Nespresso logo top-center
- Large title: *"What's your summer blend?"* (Gustavo Bold 42px, navy, uppercase, centered, y=196)
- Body text block: "Three questions. One signature recipe…" (Gustavo Bold 22px, navy, uppercase, centered, y=295, width=327)
- Pink CTA button "DISCOVER YOUR PROFILE" (y=587, 331×60, border-radius 50px, shadow)
- Nespresso logo bottom-center (logoSwipe, y=748, 53×54)

Removes: old `showPopup` / `PopupInscription` flow (replaced by RsvpForm step).

### `src/components/QuestionCard.jsx` + `QuestionCard.css`

**Figma:** 3005-1352 (GROOVE?), 3027-18 (VINYL?), 3027-122 (BACKSTAGE?)

Visual changes:
- Full-screen background image per question (passed as `bgImage` prop — already supported)
- Dark overlay `rgba(28, 40, 105, 0.7)` covers the card
- Question text (e.g. "GROOVE?") centered, Gustavo Bold 48px, white, uppercase
- Top bar: "BACK" left (30px, white, 30px font) + progress "1/3" right (white, 30px font)
- Center arrows: swipe vector graphic (existing `logoSwipe.svg`) with "IN" right / "OUT" left labels (white, 48px)
- Remove existing desktop OUT/IN button controls (replaced by the inline labels)

Progress counter passed as `progressLabel` prop (e.g. `"1/3"`).

### `src/components/Congradulation.jsx` + `Congradulation.css`

**Figma:** 3005-1863 "TM Quiz - frame 13"

Visual changes:
- Background: `#749BD1` (blue-band), full screen
- Remove "FÉLICITATIONS" / emoji / "Voir mon profil" button
- Auto-trigger result save + transition on mount (no user interaction needed)
- "YOUR RESULT IS LOADING" text (Gustavo Bold 20px, white, centered, y=333)
- CSS spin animation replacing Font Awesome sync icon (white, 40px circle)
- Progress "3/3" top-right + "BACK" top-left (white, 30px)
- 3s delay then → Results

### `src/components/Results.jsx` + `Results.css`

**Figma:** 3005-1958 "TM Quiz - frame 14"

Visual changes:
- Cream bg full screen
- Blue band top (749BD1)
- White rounded card (border-radius 32px, 327×631, x=30, y=54)
- Top half of card: coffee drink photo (downloaded from Figma, `client-config/assets/result-drink.png`)
- Bottom half: profile name large (Gustavo Bold 32px, navy) + description text (16px, navy, centered)
- Bottom bar: "BACK" left + "3/3" right (white on blue band)

---

## client-config Changes

### `client-config/brand.js`

Add imports:
```js
import grooveBg from './assets/groove.png';
import vinylBg from './assets/vinyl.jpg';
import backstageBg from './assets/backstage.png';
export { grooveBg, vinylBg, backstageBg };
```

### `client-config/content.js`

Add/update:
```js
export const quizTitle = "What's your summer blend?";
export const quizSubtitle = "Three questions. One signature recipe. Attending or not? Your summer blend is yours to keep.";
export const discoverCta = "DISCOVER YOUR PROFILE";
export const rsvp = {
  heading: "you're invited",
  attendLabel: "I'd be delighted to attend",
  declineLabel: "I won't be able to make it this time",
  confirmCta: "CONFIRM",
};
```

### `client-config/questions.js`

Replace mockQuestions with 3 Nespresso MJF questions:
```js
export const mockQuestions = [
  { question: 'GROOVE?',    traitRight: 'IN', traitLeft: 'OUT', bgImage: grooveBg },
  { question: 'VINYL?',     traitRight: 'IN', traitLeft: 'OUT', bgImage: vinylBg },
  { question: 'BACKSTAGE?', traitRight: 'IN', traitLeft: 'OUT', bgImage: backstageBg },
];
```

Note: bg images imported in `questions.js` from `./assets/` — Vite-safe (client-side only).

---

## Asset Downloads

- **Result drink photo** — download from Figma node `3027:255` (imageRef `70ef25a6611277d225b10d6422453b78c3d179a5`) → save as `client-config/assets/result-drink.png`

---

## Quiz Questions & Profile Matching

### Questions (`client-config/questions.js`)

Each question uses named traits (not generic IN/OUT) so the profile matching algorithm can distinguish combinations. The UI still shows "IN"/"OUT" as swipe labels (from QuestionCard).

| # | Question | traitRight | traitLeft |
|---|----------|-----------|----------|
| 1 | GROOVE?    | `groove`   | `chill`   |
| 2 | VINYL?     | `vinyl`    | `digital` |
| 3 | BACKSTAGE? | `backstage`| `frontrow`|

Background images: `groove.png`, `vinyl.jpg`, `backstage.png` from `client-config/assets/`.

### Profiles (`client-config/profiles.js`)

5 profiles. The server.js trait-matching algorithm counts overlapping traits; highest score wins (first in array breaks ties).

| Profile | Trait Set | Wins on |
|---------|-----------|---------|
| Ice Yuzu Tonic — **Bold** | `{groove, vinyl, backstage}` | 3× IN |
| Ice Yuzu Tonic — **Electric** | `{groove, vinyl, frontrow}` | 2× IN (groove+vinyl) |
| Ice Piña Colada | `{chill, vinyl, frontrow}` | OUT-IN-OUT, OUT-IN-IN |
| Nespresso Martini — **Classic** | `{groove, digital, frontrow}` | IN-OUT-OUT |
| Nespresso Martini — **Pure** | `{chill, digital, frontrow}` | 3× OUT |

### Profile Text Content

```
Ice Yuzu Tonic — Bold, fearless, all-in.
Espresso meets yuzu over iced tonic, with a twist of gin — bold, unapologetic, one of a kind.
You don't test the water. You dive in. And the pool is always warm.

Ice Yuzu Tonic — Electric, exclusive, unexpected.
Espresso meets yuzu over iced tonic, with a twist of gin.
You're the one who finds the hidden door at the Nespresso Terrasse — and orders something that sparks.

Ice Piña Colada — Smooth, exotic, effortless.
Espresso, coconut, pineapple — three islands, one cup.
You drift into the Pool Universe like you own it.

Nespresso Martini — Classic, refined, timeless.
Under warm lights and deep basslines, you choose the essence.
Espresso shaken with vodka and coffee liqueur — pure, iconic, no compromise.
You don't chase trends, you set the tone.

Nespresso Martini — Pure, Open, Undefined.
Espresso, vodka, coffee liqueur — shaken, not overthought.
No label needed. The best nights are the ones you didn't plan.
```

---

## Out of Scope

- Backend RSVP storage (userData already passed to `saveQuizResult` — extend there when needed)
- URL-key invitation gating (TODO)
- Nespresso brand fonts (TODO — add `@font-face` to `client-config/fonts.css` when fonts received)
- Email sharing / +1 features (feature flags in `client-config/features.js` — not implemented yet)
