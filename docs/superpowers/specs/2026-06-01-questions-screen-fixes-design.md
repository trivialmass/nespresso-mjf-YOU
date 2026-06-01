# Questions Screen Fixes — Design Spec
**Date:** 2026-06-01  
**Scope:** todos.md items 1–5 (Questions screen layout, card text, swipe indicators)

---

## Root cause

`questions-arrow-wrap` (and `tutorial-arrow-wrap`) use `padding-bottom: calc(89vw * 106/347)` to preserve aspect ratio. On desktop, `89vw` is ~1280px regardless of the 440px container cap, making the arrow banner ~400px tall. This collapses into the card area, breaking vertical spacing. The `display: flex` on `.card-container` is also ineffective because all QuestionCard children are `position: absolute` (0 in-flow flex items). These two issues together cause todos 1, 2, and 5.

---

## Task A — Questions screen flex column layout
**Files:** `src/Questions.css`, `src/components/SwipeTutorial.css`  
**Fixes:** todos 1 (minimum spacing), 2 (arrow wrap height + label alignment), 5 (card vertical constraint)

### questions-frame
Convert from a pure positioning context to a flex column:
```css
.questions-frame {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 5.8% 0 0; /* Figma top offset: 49/844 */
}
```

### questions-arrow-wrap
Remove `position: absolute`, `height: 0`, `padding-bottom`. Become an in-flow flex child:
```css
.questions-arrow-wrap {
  width: 89%;        /* 347/390 — relative to container, not viewport */
  margin: 0 auto;
  aspect-ratio: 347 / 106;
  position: relative;
  flex-shrink: 0;
}
```

### questions-label (OUT / IN inside arrow)
Labels are children of `questions-arrow-wrap`. With `height: 0`, `top: 19.8%` computed to 0px. With `aspect-ratio`, the element has proper height. Fix label vertical alignment:
```css
.questions-label {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  /* keep existing: font, color, cursor, user-select */
}
```
Horizontal positions unchanged (`left: 10.4%` for OUT, `left: 74.4%` for IN).

### card-container
Replace absolute positioning with flex-grow:
```css
.card-container {
  flex: 1;
  min-height: 0;    /* critical: allows flex child to shrink below content height */
  position: relative; /* positioning context for absolute-positioned cards */
  /* remove: display: flex; align-items: center; justify-content: center */
  /* (cards use their own absolute centering) */
}
```

### questions-bottom
Replace absolute positioning with in-flow flex child. Height is content-driven (logo SVG is ~54px):
```css
.questions-bottom {
  flex-shrink: 0;
  /* keep: display: flex; align-items: center; justify-content: space-between */
  padding: 10px 7.7%; /* vertical padding for breathing room */
  /* remove: position: absolute; top: 87.7%; height */
}
```

### SwipeTutorial — tutorial-arrow-wrap
Same fix as questions-arrow-wrap. Replace padding-bottom trick with aspect-ratio:
```css
.tutorial-arrow-wrap {
  /* keep: position: absolute; left: 5.9%; top: 40.6%; width: 89% */
  aspect-ratio: 347 / 106;
  /* remove: height: 0; padding-bottom: calc(89vw * 106 / 347) */
}
```
Tutorial labels are positioned relative to `.tutorial-frame` (not the arrow wrap), so they are unaffected by this change.

---

## Task B — QuestionCard CSS fixes
**Files:** `src/components/QuestionCard.css`  
**Fixes:** todos 3 (text shrink), 4 (swipe indicators bigger + centered), 5 (card vertical constraint)

### question-card — vertical constraint (todo 5)
Add `max-height: 90%` so card cannot overflow the card-container regardless of viewport height. Modern browsers correctly shrink `width` proportionally via `aspect-ratio` when `max-height` is exceeded:
```css
.question-card {
  /* existing: position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%) */
  /* existing: width: min(313px, 80vw); aspect-ratio: 313/471 */
  max-height: 90%; /* prevents card touching arrow banner or bottom bar */
  /* CSS resolves conflict: if height > 90%, width shrinks via aspect-ratio */
}
```

### card-content h2 — text shrink (todo 3)
Lower the clamp minimum so long question texts shrink instead of overflowing. Also ensure `.card-content` clips overflow:
```css
.card-content {
  /* existing padding: 10% is sufficient */
  overflow: hidden;
}

.card-content h2 {
  font-size: clamp(14px, 12.3vw, 48px); /* was: clamp(28px, ...) */
  /* existing: font-weight, color, text-transform, line-height, word-wrap */
}
```

### swipe-indicator — bigger + centered (todo 4)
User confirmed: these are the drag-reveal IN/OUT labels. Make them much larger and center them on the card (they appear one at a time, no overlap risk):
```css
.swipe-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
  font-family: 'Gustavo_Display_Nespresso_Test', Georgia, serif;
  font-size: clamp(60px, 20vw, 90px); /* was: clamp(40px, 10vw, 64px) */
  font-weight: 700;
  pointer-events: none;
  transition: opacity 0.1s;
  white-space: nowrap;
}

/* Remove left/right offset overrides — both centered */
.swipe-indicator.right {
  color: #a5ff02;
  /* remove: right: 20px */
}

.swipe-indicator.left {
  color: #ff6a7b;
  /* remove: left: 20px */
}
```

---

## Parallelization

Tasks A and B touch different files and can run simultaneously:
- Task A: `Questions.css` + `SwipeTutorial.css`
- Task B: `QuestionCard.css`

Task A should be committed first; Task B can overlap. Both should be rebased on the current HEAD before commit.
