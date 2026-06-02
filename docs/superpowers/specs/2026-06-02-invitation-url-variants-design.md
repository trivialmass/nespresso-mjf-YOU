# Design: Invitation URL Variants

**Date:** 2026-06-02  
**Status:** Approved

## Overview

The RSVP form is gated behind 6 clean invitation URLs that encode both the event date and the maximum number of additional guests the invitee may bring. The quiz remains fully public — the invitation URL only unlocks and configures the RSVP form.

---

## 1. URL Scheme

6 valid paths, each served by the same SPA:

| Path | Date | Max guests |
|---|---|---|
| `/invitation_z_july_8` | July 8 | 0 |
| `/invitation_o_july_8` | July 8 | 1 |
| `/invitation_t_july_8` | July 8 | 2 |
| `/invitation_z_july_9` | July 9 | 0 |
| `/invitation_o_july_9` | July 9 | 1 |
| `/invitation_t_july_9` | July 9 | 2 |

Letters: `z` = zero, `o` = one, `t` = two additional guests allowed.

Any other path → quiz only, no RSVP form (no error state).

---

## 2. URL Parsing Utility

**File:** `src/utils/invitation.js`

Reads `window.location.pathname` and returns:

```js
// valid invitation
{ valid: true, date: 'July 8', maxGuests: 2 }

// unknown path — quiz only
{ valid: false, date: null, maxGuests: null }
```

No external dependencies. Pure string matching against the 6 known patterns.

---

## 3. .htaccess Routing

6 `RewriteRule` entries added to `php-backend/.htaccess` (deployed to site root), each mapping an invitation path to `index.html` so the SPA handles routing:

```apache
RewriteRule ^invitation_[zot]_july_[89]$ index.html [L]
```

A single regex rule covers all 6 variants.

---

## 4. RsvpForm Adaptations

The `RsvpForm` component receives `{ date, maxGuests }` from the parsed invitation context.

**Changes:**
- Date displayed below the "YOU'RE INVITED" heading:
  - July 8 → *"Wednesday July 8th — Sacha Keable & Tyla"*
  - July 9 → *"Thursday July 9th — Joy Crookes & John Legend"*
- If `maxGuests > 0`: a guest count selector appears — buttons or a simple counter letting the user choose from `0` to `maxGuests`
- If `maxGuests === 0`: guest selector is hidden entirely
- Primary fields unchanged: first name, last name, email, attending yes/no

No guest personal details collected — only the count.

---

## 5. Backend & Database

**New columns** added to the `results` table (auto-migrated via `ALTER TABLE … ADD COLUMN IF NOT EXISTS`):

| Column | Type | Description |
|---|---|---|
| `event_date` | `VARCHAR(20)` | `"July 8"` or `"July 9"` |
| `guest_count` | `TINYINT` | `0`, `1`, or `2` |

**`saveResult.js`** sends `event_date` and `guest_count` alongside existing fields.  
**`save-result.php`** reads and inserts the two new fields.

---

## 6. Email Templates

6 HTML files generated from `long-version.html`, saved in `/mjf-oft/`:

| File | Date line | Concerts | CTA URL |
|---|---|---|---|
| `invitation_z_july_8.html` | Wednesday July 8th | Sacha Keable & Tyla | `/invitation_z_july_8` |
| `invitation_o_july_8.html` | Wednesday July 8th | Sacha Keable & Tyla | `/invitation_o_july_8` |
| `invitation_t_july_8.html` | Wednesday July 8th | Sacha Keable & Tyla | `/invitation_t_july_8` |
| `invitation_z_july_9.html` | Thursday July 9th | Joy Crookes & John Legend | `/invitation_z_july_9` |
| `invitation_o_july_9.html` | Thursday July 9th | Joy Crookes & John Legend | `/invitation_o_july_9` |
| `invitation_t_july_9.html` | Thursday July 9th | Joy Crookes & John Legend | `/invitation_t_july_9` |

Only three things differ per file: the date line, the concert names, and the CTA button href. Everything else (logo, copy, styles, bg.gif) is identical.

---

## Out of Scope

- Per-person key / identity tracking
- Guest personal details (name, email)
- Rate limiting or abuse prevention on invitation URLs
