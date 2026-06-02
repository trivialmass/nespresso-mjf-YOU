# Invitation URL Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gate the RSVP form behind 6 clean invitation URLs that encode date and max guest count, while keeping the quiz public for all visitors.

**Architecture:** A pure JS utility parses `window.location.pathname` into `{ valid, date, maxGuests }`. `App.jsx` reads this once on mount and either renders the full RSVP+quiz flow or skips straight to the quiz. The form gains a date label and a guest count selector. Two new DB columns (`event_date`, `guest_count`) capture the context on submit.

**Tech Stack:** React, PHP/PDO/MySQL, Apache mod_rewrite, vanilla HTML email templates.

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/utils/invitation.js` | Parse pathname → `{ valid, date, maxGuests }` |
| Modify | `src/App.jsx` | Read invitation, skip form or pass to RsvpForm |
| Modify | `src/components/RsvpForm.jsx` | Date label, guest count selector, pass fields to onSubmit |
| Modify | `src/components/RsvpForm.css` | Styles for guest count selector |
| Modify | `client-config/content.js` | Guest count label strings |
| Modify | `src/services/saveResult.js` | Send `event_date` + `guest_count` |
| Modify | `php-backend/api/save-result.php` | New columns + insert logic |
| Modify | `php-backend/.htaccess` | RewriteRule for 6 invitation paths |
| Create | `assets/mails/invitation_z_july_8.html` | Email variant: July 8, 0 guests |
| Create | `assets/mails/invitation_o_july_8.html` | Email variant: July 8, 1 guest |
| Create | `assets/mails/invitation_t_july_8.html` | Email variant: July 8, 2 guests |
| Create | `assets/mails/invitation_z_july_9.html` | Email variant: July 9, 0 guests |
| Create | `assets/mails/invitation_o_july_9.html` | Email variant: July 9, 1 guest |
| Create | `assets/mails/invitation_t_july_9.html` | Email variant: July 9, 2 guests |

---

## Task 1: URL parsing utility

**Files:**
- Create: `src/utils/invitation.js`

- [ ] **Step 1: Create the utility**

```js
// src/utils/invitation.js

const PATTERNS = {
  invitation_z_july_8: { date: 'July 8', dayLabel: 'Wednesday July 8th', concerts: 'Sacha Keable & Tyla', maxGuests: 0 },
  invitation_o_july_8: { date: 'July 8', dayLabel: 'Wednesday July 8th', concerts: 'Sacha Keable & Tyla', maxGuests: 1 },
  invitation_t_july_8: { date: 'July 8', dayLabel: 'Wednesday July 8th', concerts: 'Sacha Keable & Tyla', maxGuests: 2 },
  invitation_z_july_9: { date: 'July 9', dayLabel: 'Thursday July 9th',  concerts: 'Joy Crookes & John Legend', maxGuests: 0 },
  invitation_o_july_9: { date: 'July 9', dayLabel: 'Thursday July 9th',  concerts: 'Joy Crookes & John Legend', maxGuests: 1 },
  invitation_t_july_9: { date: 'July 9', dayLabel: 'Thursday July 9th',  concerts: 'Joy Crookes & John Legend', maxGuests: 2 },
};

export function parseInvitation(pathname = window.location.pathname) {
  const slug = pathname.replace(/^\//, '').replace(/\/$/, '');
  const match = PATTERNS[slug];
  if (!match) return { valid: false, date: null, dayLabel: null, concerts: null, maxGuests: null };
  return { valid: true, ...match };
}
```

- [ ] **Step 2: Verify manually in browser console**

Open `http://localhost:5173/invitation_t_july_9` (or whatever dev port Vite uses) and run in the console:

```js
import('/src/utils/invitation.js').then(m => console.log(m.parseInvitation()))
// Expected: { valid: true, date: 'July 9', dayLabel: 'Thursday July 9th', concerts: 'Joy Crookes & John Legend', maxGuests: 2 }
```

Also test an unknown path:
```js
m.parseInvitation('/unknown')
// Expected: { valid: false, date: null, dayLabel: null, concerts: null, maxGuests: null }
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/invitation.js
git commit -m "feat: add invitation URL parser utility"
```

---

## Task 2: Wire invitation into App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Import the utility and read invitation on mount**

Replace the top of `App.jsx` with:

```jsx
import React, { useState, useMemo } from 'react';
import './App.css';
import { logoGame } from '../client-config/brand.js';
import { quizIntro } from '../client-config/content.js';
import RsvpForm from './components/RsvpForm.jsx';
import SwipeTutorial from './components/SwipeTutorial.jsx';
import Questions from './Questions.jsx';
import { parseInvitation } from './utils/invitation.js';

function App() {
  const invitation = useMemo(() => parseInvitation(), []);
  const [step, setStep] = useState(invitation.valid ? 'rsvp' : 'quiz-intro');
  const [userData, setUserData] = useState(null);
```

- [ ] **Step 2: Pass invitation to RsvpForm**

Find the `if (step === 'rsvp')` block and update it:

```jsx
  if (step === 'rsvp') {
    return <RsvpForm invitation={invitation} onSubmit={handleRsvpSubmit} />;
  }
```

- [ ] **Step 3: Verify in browser**

- Visit `http://localhost:5173/` → should jump straight to quiz intro (no form)
- Visit `http://localhost:5173/invitation_o_july_8` → should show the RSVP form

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat: read invitation URL in App, skip form for non-invitees"
```

---

## Task 3: RsvpForm — date label + guest count selector

**Files:**
- Modify: `src/components/RsvpForm.jsx`
- Modify: `src/components/RsvpForm.css`
- Modify: `client-config/content.js`

- [ ] **Step 1: Add guest selector label to content.js**

In `client-config/content.js`, add to the `rsvp` object:

```js
export const rsvp = {
  heading: "YOU'RE INVITED",
  firstNameLabel: "First name*",
  lastNameLabel: "Last name*",
  emailLabel: "Email address*",
  phoneLabel: "Phone number",
  attendYes: "I'd be delighted to attend",
  attendNo: "I won't be able to make it this time",
  guestLabel: "How many guests are you bringing?",
  ctaLabel: "CONFIRM",
};
```

Also remove the stale TODO comment at the top of `content.js`.

- [ ] **Step 2: Update RsvpForm.jsx**

Replace the full file content:

```jsx
import React, { useState } from 'react';
import './RsvpForm.css';
import PoolBg from './PoolBg.jsx';
import { rsvp } from '../../client-config/content.js';

const RsvpForm = ({ invitation, onSubmit }) => {
  const { dayLabel, concerts, maxGuests } = invitation;

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    attending: null,
    guestCount: 0,
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAttend = (value) => setForm({ ...form, attending: value });
  const handleGuestCount = (count) => setForm({ ...form, guestCount: count });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || form.attending === null) return;
    onSubmit(form);
  };

  const isValid = form.firstName && form.lastName && form.email && form.attending !== null;

  return (
    <PoolBg overlay={false}>
      <div className="rsvp-card">
        <h1 className="rsvp-title">{rsvp.heading}</h1>
        {dayLabel && (
          <p className="rsvp-date-label">{dayLabel}<br /><span className="rsvp-concerts">{concerts}</span></p>
        )}
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
            required
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

          {form.attending === true && maxGuests > 0 && (
            <div className="rsvp-guests">
              <p className="rsvp-guests__label">{rsvp.guestLabel}</p>
              <div className="rsvp-guests__options">
                {Array.from({ length: maxGuests + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`rsvp-guests__btn${form.guestCount === i ? ' rsvp-guests__btn--selected' : ''}`}
                    onClick={() => handleGuestCount(i)}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
          )}

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

- [ ] **Step 3: Add CSS for new elements**

Append to `src/components/RsvpForm.css`:

```css
/* Date + concerts label under heading */
.rsvp-date-label {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: var(--navy);
  text-align: center;
  margin: -10px 0 20px;
  line-height: 1.5;
}

.rsvp-concerts {
  font-size: 13px;
  opacity: 0.7;
}

/* Guest count selector */
.rsvp-guests {
  margin: 8px 0 4px;
}

.rsvp-guests__label {
  font-family: Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: var(--navy);
  margin: 0 0 10px;
}

.rsvp-guests__options {
  display: flex;
  gap: 10px;
}

.rsvp-guests__btn {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 1.5px solid var(--navy);
  background: transparent;
  font-size: 18px;
  font-family: Helvetica, Arial, sans-serif;
  color: var(--navy);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.rsvp-guests__btn--selected {
  background: var(--navy);
  color: #fff;
}
```

- [ ] **Step 4: Verify in browser**

- Visit `/invitation_t_july_8` → form shows "Wednesday July 8th" and "Sacha Keable & Tyla". After clicking "I'd be delighted to attend", buttons 0 / 1 / 2 appear.
- Visit `/invitation_z_july_9` → form shows "Thursday July 9th", no guest selector.
- Visit `/invitation_o_july_9` → guest selector shows buttons 0 / 1 only.

- [ ] **Step 5: Commit**

```bash
git add src/components/RsvpForm.jsx src/components/RsvpForm.css client-config/content.js
git commit -m "feat: add date label and guest count selector to RsvpForm"
```

---

## Task 4: Pass invitation data through to save

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/services/saveResult.js`

- [ ] **Step 1: Update handleRsvpSubmit in App.jsx to carry invitation context**

In `App.jsx`, update `handleRsvpSubmit` so it stores invitation context alongside user data:

```jsx
  const handleRsvpSubmit = (formData) => {
    setUserData({ ...formData, eventDate: invitation.date, guestCount: formData.guestCount ?? 0 });
    setStep('quiz-intro');
  };
```

- [ ] **Step 2: Update saveResult.js to send new fields**

Replace the body of the `JSON.stringify` call in `src/services/saveResult.js`:

```js
export const saveResult = async (userData, answers, profile) => {
  try {
    await fetch(`${BACKEND_URL}/php-backend/api/save-result.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name:  userData?.firstName  || '',
        last_name:   userData?.lastName   || '',
        name:        `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        email:       userData?.email      || '',
        phone:       userData?.phone      || '',
        event_date:  userData?.eventDate  || '',
        guest_count: userData?.guestCount ?? 0,
        profile: profile ? JSON.stringify({ id: profile.id, drink: profile.drink, tagline: profile.tagline }) : '',
        answers: answers.map(a => ({ question: a.question?.question || a.question, answer: a.answer })),
      }),
    });
    return true;
  } catch (err) {
    console.error('Save error:', err);
    return false;
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx src/services/saveResult.js
git commit -m "feat: propagate event_date and guest_count through to save payload"
```

---

## Task 5: Backend — new DB columns + PHP handling

**Files:**
- Modify: `php-backend/api/save-result.php`

- [ ] **Step 1: Add new columns to the CREATE TABLE statement**

Find the `CREATE TABLE IF NOT EXISTS results` block and replace it:

```php
$pdo->exec("
    CREATE TABLE IF NOT EXISTS results (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        name        VARCHAR(255)  DEFAULT '',
        first_name  VARCHAR(255)  DEFAULT '',
        last_name   VARCHAR(255)  DEFAULT '',
        company     VARCHAR(255)  DEFAULT '',
        email       VARCHAR(255)  DEFAULT '',
        phone       VARCHAR(50)   DEFAULT '',
        event_date  VARCHAR(20)   DEFAULT '',
        guest_count TINYINT       DEFAULT 0,
        profile     TEXT          DEFAULT '',
        answers     TEXT          DEFAULT '',
        created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Add columns for existing tables that predate this migration
$pdo->exec("ALTER TABLE results ADD COLUMN IF NOT EXISTS event_date  VARCHAR(20)  DEFAULT ''");
$pdo->exec("ALTER TABLE results ADD COLUMN IF NOT EXISTS guest_count TINYINT      DEFAULT 0");
```

- [ ] **Step 2: Read and insert the new fields**

Find the `// ── Parse body` section and add the two new variables after `$phone`:

```php
$eventDate  = $body['event_date']  ?? '';
$guestCount = isset($body['guest_count']) ? (int)$body['guest_count'] : 0;
```

Update the `INSERT` statement:

```php
$stmt = $pdo->prepare("
    INSERT INTO results (name, first_name, last_name, company, email, phone, event_date, guest_count, profile, answers)
    VALUES (:name, :first_name, :last_name, :company, :email, :phone, :event_date, :guest_count, :profile, :answers)
");
$stmt->execute([
    'name'        => $name,
    'first_name'  => $firstName,
    'last_name'   => $lastName,
    'company'     => $company,
    'email'       => $email,
    'phone'       => $phone,
    'event_date'  => $eventDate,
    'guest_count' => $guestCount,
    'profile'     => $profile,
    'answers'     => $answers,
]);
```

- [ ] **Step 3: Verify with curl**

```bash
curl -s -X POST https://nespresso-mjf.trivialmass.com/php-backend/api/save-result.php \
  -H 'Content-Type: application/json' \
  -d '{"first_name":"Test","last_name":"User","email":"test@test.com","event_date":"July 8","guest_count":1,"answers":[]}'
# Expected: {"success":true}
```

- [ ] **Step 4: Commit**

```bash
git add php-backend/api/save-result.php
git commit -m "feat: add event_date and guest_count columns to results table"
```

---

## Task 6: .htaccess routing for invitation paths

**Files:**
- Modify: `php-backend/.htaccess`

- [ ] **Step 1: Add RewriteRule for invitation paths**

In `php-backend/.htaccess`, add inside the `<IfModule mod_rewrite.c>` block, **before** the existing `api` rule:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Serve SPA for all 6 invitation paths
    RewriteRule ^invitation_[zot]_july_[89]$ index.html [L]

    RewriteRule ^api/(.*)$ php-backend/api/$1.php [L]
</IfModule>
```

- [ ] **Step 2: Verify locally with Vite dev server**

Vite handles its own dev routing — the `.htaccess` rule only matters on the Apache server. To test locally, visit `http://localhost:5173/invitation_t_july_8` — Vite will serve `index.html` and the JS parser handles the rest. Confirm the form renders with the correct date.

- [ ] **Step 3: Commit**

```bash
git add php-backend/.htaccess
git commit -m "feat: add htaccess RewriteRule for invitation URL variants"
```

---

## Task 7: Generate 6 email HTML variants

**Files:**
- Create: `assets/mails/invitation_z_july_8.html` through `invitation_t_july_9.html`

The 6 files are identical except for 3 values: `DAY_LABEL`, `CONCERTS`, and `CTA_PATH`.

| File | DAY_LABEL | CONCERTS | CTA_PATH |
|---|---|---|---|
| `invitation_z_july_8.html` | `Wednesday July 8<sup>th</sup>` | `Sacha Keable and Tyla` | `/invitation_z_july_8` |
| `invitation_o_july_8.html` | `Wednesday July 8<sup>th</sup>` | `Sacha Keable and Tyla` | `/invitation_o_july_8` |
| `invitation_t_july_8.html` | `Wednesday July 8<sup>th</sup>` | `Sacha Keable and Tyla` | `/invitation_t_july_8` |
| `invitation_z_july_9.html` | `Thursday July 9<sup>th</sup>` | `Joy Crookes and John Legend` | `/invitation_z_july_9` |
| `invitation_o_july_9.html` | `Thursday July 9<sup>th</sup>` | `Joy Crookes and John Legend` | `/invitation_o_july_9` |
| `invitation_t_july_9.html` | `Thursday July 9<sup>th</sup>` | `Joy Crookes and John Legend` | `/invitation_t_july_9` |

- [ ] **Step 1: Copy `long-version.html` from `/mjf-oft/` as the base for each of the 6 files**

```bash
for slug in invitation_z_july_8 invitation_o_july_8 invitation_t_july_8 invitation_z_july_9 invitation_o_july_9 invitation_t_july_9; do
  cp /Users/leonardm/Documents/Projets/nespresso/mjf-oft/long-version.html \
     /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/${slug}.html
done
```

- [ ] **Step 2: Patch July 8 files — replace CTA URL**

The current `long-version.html` already has the July 8 date. Only the CTA path differs per file:

```bash
# _z_ variant: replace both CTA href occurrences
sed -i '' 's|/?key=«Invitation_Key»|/invitation_z_july_8|g' \
  /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/invitation_z_july_8.html

sed -i '' 's|/?key=«Invitation_Key»|/invitation_o_july_8|g' \
  /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/invitation_o_july_8.html

sed -i '' 's|/?key=«Invitation_Key»|/invitation_t_july_8|g' \
  /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/invitation_t_july_8.html
```

- [ ] **Step 3: Patch July 9 files — replace date line, concerts, preview text, and CTA URL**

```bash
for slug in invitation_z_july_9 invitation_o_july_9 invitation_t_july_9; do
  f="/Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/${slug}.html"

  # Preview text date
  sed -i '' 's|July 8th|July 9th|g' "$f"

  # Date line in body (the <p> with Wednesday July 8)
  sed -i '' 's|Wednesday July 8|Thursday July 9|g' "$f"

  # Concert names
  sed -i '' 's|Sacha Keable and Tyla|Joy Crookes and John Legend|g' "$f"
  # Also handle the version with ampersand
  sed -i '' 's|Sacha Keable and Tyla|Joy Crookes and John Legend|g' "$f"
done

# CTA paths
sed -i '' 's|/?key=«Invitation_Key»|/invitation_z_july_9|g' \
  /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/invitation_z_july_9.html

sed -i '' 's|/?key=«Invitation_Key»|/invitation_o_july_9|g' \
  /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/invitation_o_july_9.html

sed -i '' 's|/?key=«Invitation_Key»|/invitation_t_july_9|g' \
  /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/invitation_t_july_9.html
```

- [ ] **Step 4: Verify one July 9 file**

```bash
grep -n "July\|Keable\|Crookes\|invitation_" \
  /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU/assets/mails/invitation_t_july_9.html
# Expected: lines showing "Thursday July 9th", "Joy Crookes and John Legend", href="/invitation_t_july_9"
# Must NOT contain "July 8", "Sacha", or "Invitation_Key"
```

- [ ] **Step 5: Commit**

```bash
git add assets/mails/
git commit -m "feat: add 6 invitation email HTML variants"
```

---

## Task 8: Build and deploy

- [ ] **Step 1: Build**

```bash
cd /Users/leonardm/Documents/Projets/TrivialQuizz/nespresso-mjf-YOU && npm run build
# Expected: dist/ folder generated with no errors
```

- [ ] **Step 2: Upload via FTP**

Upload these paths to the server root:
- `dist/` → site root (replaces existing `dist/`)
- `php-backend/.htaccess` → site root `.htaccess`
- `php-backend/api/save-result.php` → `php-backend/api/save-result.php`
- `assets/mails/` → `assets/mails/` (all 6 new HTML files + existing `.htaccess`)

- [ ] **Step 3: Smoke test each variant**

```bash
for slug in invitation_z_july_8 invitation_o_july_8 invitation_t_july_8 invitation_z_july_9 invitation_o_july_9 invitation_t_july_9; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -u admin:password \
    "https://nespresso-mjf.trivialmass.com/${slug}")
  echo "${slug}: ${code}"
done
# Expected: all return 200
```

- [ ] **Step 4: Test a full submission end-to-end**

Visit `https://nespresso-mjf.trivialmass.com/invitation_t_july_8`, fill the form with a test email, select 2 guests, confirm. Then verify the row appears in the DB with `event_date = "July 8"` and `guest_count = 2`.
