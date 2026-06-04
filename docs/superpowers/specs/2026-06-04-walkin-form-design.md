# Walk-in Registration Form — Design Spec

**Date:** 2026-06-04  
**Status:** Approved

## Problem

Users who access the quiz without a valid invitation URL (`/invitation_*_july_*`) skip the RSVP form entirely. `userData` stays `null`, the DB entry has no name/email, and no confirmation mail is sent.

## Goal

Show a minimal registration form for walk-in users so their name and email are captured before they take the quiz.

## Scope

- Walk-in URL: `/` (root) — already served by the SPA catch-all in `.htaccess`
- Fields: firstName, lastName, email (+ consent checkbox — already required)
- No attending radio, no phone, no guest count, no event date
- No confirmation email for walk-ins (no event date → no relevant template)

## Changes

### 1. `RsvpForm.jsx` — `walkIn` boolean prop

When `walkIn={true}`:
- Hide: attending radio buttons, phone field, guest count
- Show: firstName, lastName, email, consent only
- Submit label: "Start the quiz" (or reuse existing CTA from `content.js`)
- Validation: `firstName && lastName && email && consent`

The component already renders inside `PoolBg` with the existing styles — no new styles needed.

### 2. `App.jsx`

```js
const [step, setStep] = useState(invitation.valid ? 'rsvp' : 'walk-in');
```

Add a `walk-in` case that renders `<RsvpForm walkIn onSubmit={handleRsvpSubmit} />`.  
`handleRsvpSubmit` already sets `userData`; `eventDate` will be `''`, `guestCount` defaults to `0`.

### 3. `save-result.php` — guard confirmation mail on known event dates

Current code has a latent bug: the `else` branch of `$eventDate === 'July 8'` defaults to `july_9`, so an empty `event_date` would wrongly trigger a July 9 confirmation mail.

Fix: only send the confirmation if `$eventDate` is exactly `'July 8'` or `'July 9'`.

```php
if ($isNewRow && $attending && $email && in_array($eventDate, ['July 8', 'July 9'], true)) {
```

### 4. `.htaccess` routing

No new route needed. The existing rules already handle walk-ins:

```
RewriteRule ^invitation_[zot]_july_[89]$ index.html [L]   # 6 known invitation paths
RewriteRule ^admin$ admin.php [L]                          # admin
RewriteRule ^api/(.*)$ php-backend/api/$1.php [L]          # API
RewriteRule ^ index.html [L]                               # catch-all → SPA
```

The catch-all is intentional: any unknown path serves the SPA. The SPA then checks the URL and shows the walk-in form for non-invitation paths. This is correct behaviour — a stale/wrong URL should gracefully land on the walk-in form rather than a 404.

## Non-goals

- No new URL slug for walk-ins (they use `/`)
- No date picker on the walk-in form
- No confirmation email for walk-ins
- No changes to the invitation flow

## Data model

Walk-in DB rows have:
- `first_name`, `last_name`, `email` populated
- `event_date` = `''`, `guest_count` = `0`, `phone` = `''`
- `profile` and `answers` populated after quiz completion (upsert by email)
