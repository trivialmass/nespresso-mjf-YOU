# Desktop UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three desktop layout/UX issues: content overflow on wide screens, swipe threshold too large on desktop, sluggish swipe animation, and non-bold CTA button fonts.

**Architecture:** Apply a single max-width constraint (440px) to the content layer of all screens. The PoolBg background gif/overlay stays full-screen; only the scrollable content area is capped. The quiz-intro screen (which doesn't use PoolBg) gets a thin inner wrapper div. Swipe threshold is changed from viewport-relative to card-relative. Animation duration reduced from 0.8s to 0.5s.

**Tech Stack:** React 18, CSS (no preprocessor), Vite

---

### Task 1: Constrain PoolBg content to 440px

**Files:**
- Modify: `src/components/PoolBg.css`

- [ ] **Step 1: Add max-width constraint to `.pool-bg__content`**

Open `src/components/PoolBg.css`. Replace the `.pool-bg__content` rule:

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
  max-width: 440px;
  margin: 0 auto;
}
```

- [ ] **Step 2: Verify in browser**

Run `npm run dev`. Open at a desktop viewport (≥900px). Visit the Tutorial screen and the Questions screen. The arrow banner and IN/OUT labels should now be capped at ~440px wide, centered in the viewport. The pool background gif should still fill the full screen behind it.

- [ ] **Step 3: Commit**

```bash
git add src/components/PoolBg.css
git commit -m "fix: cap PoolBg content to 440px on desktop"
```

---

### Task 2: Constrain quiz-intro screen to 440px

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Add inner wrapper div in `App.jsx`**

In `src/App.jsx`, find the `quiz-intro` block and wrap all inner children with a `quiz-intro-inner` div:

```jsx
if (step === 'quiz-intro') {
  return (
    <div className="quiz-intro-page">
      <div className="quiz-intro-inner">
        <div className="quiz-intro-text-block">
          <h1 className="quiz-intro-heading">{quizIntro.heading}</h1>
          <p className="quiz-intro-body-text">{quizIntro.body}</p>
        </div>
        <button className="quiz-intro-cta" onClick={handleStartQuiz}>
          {quizIntro.ctaLabel}
        </button>
        <div className="quiz-intro-logo" aria-label="Nespresso × MJF">
          <svg width="53" height="54" viewBox="0 0 53 54" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_quizintro)">
              <path d="M0 0V54H53V0H0Z" fill="#1C2869"/>
              <path d="M7.8348 12.505V12.3059C13.4886 10.2961 20.2657 11.9362 23.9538 15.605C24.5248 16.098 26.5374 18.3164 27.3237 19.2645C29.0928 21.3786 31.4611 24.7346 33.4736 27.3607V16.6574H36.3473V37.8649C33.1366 35.1914 29.8885 29.8919 27.4547 26.697C27.4547 26.697 22.737 20.2315 20.7619 17.9277C19.2361 16.0222 16.5964 13.927 14.743 13.235C12.2717 12.23 9.76309 12.0784 7.82544 12.505H7.8348Z" fill="white"/>
              <path d="M45.1651 41.6947C39.5113 43.7046 32.7342 42.0645 29.0367 38.3956C28.4657 37.9026 26.4532 35.6842 25.6763 34.7362C23.9071 32.622 21.5388 29.266 19.5263 26.64V37.3433H16.6526V16.1357C19.8633 18.8092 23.1114 24.1087 25.5358 27.3036C25.5358 27.3036 30.2536 33.7692 32.2287 36.0729C33.7545 37.9784 36.3942 40.0736 38.2382 40.7657C40.7095 41.7706 43.2181 41.9223 45.1558 41.4956V41.6947H45.1651Z" fill="white"/>
            </g>
            <defs>
              <clipPath id="clip0_quizintro">
                <rect width="53" height="54" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add `.quiz-intro-inner` CSS rule in `App.css`**

Add this block at the top of `src/App.css`, right after the `.quiz-intro-page` rule:

```css
/* Constrains absolute-positioned content to 440px, centered in the cream bg */
.quiz-intro-inner {
  position: absolute;
  top: 0;
  bottom: 0;
  width: min(100%, 440px);
  left: 50%;
  transform: translateX(-50%);
}
```

- [ ] **Step 3: Verify in browser**

At a desktop viewport, visit the quiz-intro screen ("DISCOVER YOUR PROFILE" button). The button and text should now be contained to ~440px, centered, not full-width.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx src/App.css
git commit -m "fix: constrain quiz-intro content to 440px on desktop"
```

---

### Task 3: Fix swipe threshold and animation speed

**Files:**
- Modify: `src/components/QuestionCard.jsx`
- Modify: `src/components/QuestionCard.css`

- [ ] **Step 1: Update swipe threshold in `QuestionCard.jsx`**

In `src/components/QuestionCard.jsx`, find the `handleEnd` function and replace the threshold line and the swipe-complete timeout:

```js
const handleEnd = () => {
  if (!isDragging) return;
  setIsDragging(false);

  const cardWidth = cardRef.current?.offsetWidth ?? 310;
  const threshold = cardWidth * 0.3;

  if (Math.abs(position.x) > threshold) {
    const direction = position.x > 0 ? 'right' : 'left';
    animateSwipe(direction);
    setTimeout(() => onSwipe(direction), 500);
  } else {
    setPosition({ x: 0, y: 0 });
  }
};
```

- [ ] **Step 2: Update animation duration in `QuestionCard.css`**

In `src/components/QuestionCard.css`, find the `.question-card` transition and change:

```css
.question-card {
  /* ... existing properties ... */
  transition: transform 0.5s ease, opacity 0.5s ease;
  /* ... */
}
```

- [ ] **Step 3: Verify in browser**

On both mobile emulation and desktop:
- Drag the card a short distance and release — it should snap back smoothly.
- Drag past ~1/3 of the card width — it should fly off and trigger the next card within ~0.5s.
- On desktop, a ~100px drag should be sufficient to trigger a swipe (not 430px).

- [ ] **Step 4: Commit**

```bash
git add src/components/QuestionCard.jsx src/components/QuestionCard.css
git commit -m "fix: swipe threshold uses card width, animation 0.5s"
```

---

### Task 4: Bold CTA button fonts

**Files:**
- Modify: `src/App.css`
- Modify: `src/components/RsvpForm.css`

- [ ] **Step 1: Bold the quiz-intro CTA in `App.css`**

In `src/App.css`, find `.quiz-intro-cta` and change `font-weight`:

```css
.quiz-intro-cta {
  /* ... existing properties ... */
  font-weight: 700;
  /* ... */
}
```

- [ ] **Step 2: Bold the RSVP confirm button in `RsvpForm.css`**

In `src/components/RsvpForm.css`, find `.rsvp-cta` and change `font-weight`:

```css
.rsvp-cta {
  /* ... existing properties ... */
  font-weight: 700;
  /* ... */
}
```

- [ ] **Step 3: Verify in browser**

Check both the RSVP form "CONFIRM" button and the quiz-intro "DISCOVER YOUR PROFILE" button — both should now render in bold.

- [ ] **Step 4: Commit**

```bash
git add src/App.css src/components/RsvpForm.css
git commit -m "fix: bold font-weight on quiz-intro and rsvp CTA buttons"
```

---

### Task 5: Final smoke test

- [ ] **Step 1: Full flow on desktop**

At a 1440px viewport, run through the complete flow:
1. RSVP form — card centered, "CONFIRM" bold ✓
2. Quiz-intro — content ≤440px, "DISCOVER YOUR PROFILE" bold ✓
3. Tutorial — arrow banner ≤440px, IN/OUT labels proportional ✓
4. Questions — card swipe works with ~100px drag, animation snappy ✓
5. Results — card ≤440px, centered ✓

- [ ] **Step 2: Mobile smoke test**

At 390px viewport (or mobile emulation), verify nothing regressed — all screens still fill the viewport naturally.
