# Desktop UI Fixes — Design Spec
_2026-06-01_

## Problem
The app is Figma-designed for 390×844 mobile. On desktop:
1. "DISCOVER YOUR PROFILE" button and "IN/OUT" tutorial banner stretch to full viewport width.
2. Swipe threshold (`window.innerWidth * 0.3`) becomes ~430px on a 1440px screen — wider than the card — making swipe nearly impossible.
3. Swipe exit animation (0.8s) feels slow.
4. CTA buttons (`quiz-intro-cta`, `rsvp-cta`) use `font-weight: 400` instead of bold.

## Solution

### 1. Desktop content constraint (Approach B)
- **PoolBg screens** (`SwipeTutorial`, `Questions`, `Results`, `Congradulation`): add `max-width: 440px; margin: 0 auto;` to `.pool-bg__content`. Background gif/overlay remain full-screen; only the content frame is capped.
- **Quiz-intro screen**: add a `.quiz-intro-inner` wrapper div (`position: absolute; inset: 0; width: min(100%, 440px); left: 50%; transform: translateX(-50%)`). Existing absolute children position relative to this constrained box.

### 2. Swipe threshold
Change from `window.innerWidth * 0.3` → `(cardRef.current?.offsetWidth ?? 310) * 0.3`.
Result: ~95px threshold on a 313px card — comfortable and proportional on any screen.

### 3. Swipe animation timing
- `QuestionCard.css`: `transition: transform 0.5s ease, opacity 0.5s ease`
- `QuestionCard.jsx` drag-release timeout: `800` → `500` ms

### 4. Bold CTA buttons
- `.quiz-intro-cta`: `font-weight: 400` → `700`
- `.rsvp-cta`: `font-weight: 400` → `700`
- `.tutorial-cta` and `.inscriptionButton` are already bold — no change needed.

## Files Changed
- `src/components/PoolBg.css`
- `src/App.css` + `src/App.jsx`
- `src/components/QuestionCard.css`
- `src/components/QuestionCard.jsx`
- `src/components/RsvpForm.css`
