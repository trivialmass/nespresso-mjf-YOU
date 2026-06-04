# Audit Report: nespresso-mjf.trivialmass.com

**Date:** 2026-06-04  
**Target:** https://nespresso-mjf.trivialmass.com  
**Scope:** Full audit — security headers, SSL/TLS, exposed resources, DNS/email, data privacy, performance  
**Technology:** Apache · PHP (Infomaniak hosting) · React/Vite (SPA) · MySQL · Node.js (admin server) · SQLite

---

## Executive Summary

The application is a well-scoped event quiz that keeps personal data on-premise with no third-party analytics. TLS is modern (Let's Encrypt, TLS 1.2+ only), and the admin panel is protected by magic-link auth. However, **a production database password is hardcoded in source code** — this is the single most urgent issue to fix. Security headers are almost entirely absent, the PHP API accepts requests from any origin, and GDPR consent wording is incomplete. No SPF/DMARC records exist for the sending domain, putting confirmation emails at spam risk.

---

## Findings

### Summary Table

| # | Severity | Finding |
|---|----------|---------|
| 1 | **Critical** | Database password hardcoded in `save-result.php` |
| 2 | **High** | PHP API CORS: `Access-Control-Allow-Origin: *` |
| 3 | **High** | `.git/` directory exists on server (403, not absent) |
| 4 | **High** | Missing `Content-Security-Policy` header |
| 5 | **High** | No rate limiting on data-submission API |
| 6 | **Medium** | Missing `X-Frame-Options` header |
| 7 | **Medium** | Missing `X-Content-Type-Options` header |
| 8 | **Medium** | No SPF or DMARC records for sending domain |
| 9 | **Medium** | No HTTP compression |
| 10 | **Medium** | GDPR consent incomplete (no link to privacy policy / T&Cs) |
| 11 | **Low** | Missing `Referrer-Policy` header |
| 12 | **Low** | Missing `Permissions-Policy` header |
| 13 | **Low** | No `Cache-Control` on static assets |
| 14 | **Low** | Confirmation email sent via PHP `mail()` (no DKIM) |
| 15 | **Info** | HSTS present but not on preload list |
| 16 | **Info** | No `security.txt` |
| 17 | **Info** | No sitemap.xml |

---

### [CRITICAL] Database password hardcoded in source code

- **File:** `php-backend/api/save-result.php` lines 22–25
- **Evidence:**
  ```php
  $host = getenv('DB_HOST') ?: '0o980.myd.infomaniak.com';
  $db   = getenv('DB_NAME') ?: '0o980_nespressoxmjf';
  $user = getenv('DB_USER') ?: '0o980_nesmjf';
  $pass = getenv('DB_PASS') ?: 'u56!jd&7~H9M?QF';
  ```
- **Impact:** The Infomaniak MySQL credentials (host, DB name, user, password) are in the source file as fallback literals. If `.git/` is ever mishandled, or the file is accidentally exposed, or the repo is made public, full DB access is exposed. The password is also committed to git history.
- **Recommendation:** Remove the hardcoded fallbacks entirely. Require env vars — fail loudly if absent. Rotate the DB password immediately. Run `git filter-repo` or BFG to scrub the password from git history.

---

### [HIGH] PHP API CORS: Access-Control-Allow-Origin: *

- **File:** `php-backend/api/save-result.php` line 3
- **Evidence:** `header('Access-Control-Allow-Origin: *');`
- **Impact:** Any website can POST data to the quiz endpoint, flooding the DB with fake registrations and triggering confirmation emails to arbitrary addresses.
- **Recommendation:** Restrict to the actual origin: `header('Access-Control-Allow-Origin: https://nespresso-mjf.trivialmass.com');`

---

### [HIGH] `.git/` directory exists on the server

- **Evidence:** `curl -sI https://nespresso-mjf.trivialmass.com/.git/` → `HTTP/2 403`
- **Impact:** A 403 confirms the directory exists. Apache is currently blocking traversal, but any misconfiguration (e.g., `.htaccess` change, Apache update) would expose full source code, secrets, and history. Combined with finding #1, this is especially dangerous.
- **Recommendation:** Add to Apache config: `<DirectoryMatch "\.git"> Require all denied </DirectoryMatch>`. Better yet, deploy only the build artifacts, not the full repo.

---

### [HIGH] Missing Content-Security-Policy header

- **Evidence:** `MISSING: content-security-policy` (all responses)
- **Impact:** No XSS mitigation. Injected scripts can exfiltrate form data (names, emails).
- **Recommendation:** Add a CSP. Minimum: `default-src 'self'; script-src 'self'; object-src 'none';`

---

### [HIGH] No rate limiting on PHP submission endpoint

- **Evidence:** `/php-backend/api/save-result.php` accepts unlimited POSTs. Each new row triggers a confirmation email via `mail()`.
- **Impact:** An attacker can flood the endpoint to spam arbitrary email addresses with confirmation emails, and fill the DB with junk.
- **Recommendation:** Add IP-based rate limiting (e.g., 5 requests/minute per IP) at the Apache level with `mod_ratelimit` or `mod_evasive`, or validate a CSRF token in the request.

---

### [MEDIUM] Missing X-Frame-Options

- **Evidence:** `MISSING: x-frame-options`
- **Impact:** The app can be embedded in an iframe on a malicious site (clickjacking). A user could be tricked into submitting their data on a spoofed page.
- **Recommendation:** Add `X-Frame-Options: DENY` or include `frame-ancestors 'none'` in CSP.

---

### [MEDIUM] Missing X-Content-Type-Options

- **Evidence:** `MISSING: x-content-type-options`
- **Impact:** Browsers may MIME-sniff responses, enabling certain content injection attacks.
- **Recommendation:** Add `X-Content-Type-Options: nosniff`

---

### [MEDIUM] No SPF or DMARC for the sending domain

- **Evidence:** `dig TXT trivialmass.com +short` → empty. `dig TXT _dmarc.trivialmass.com +short` → empty.
- **Impact:** Confirmation emails sent from `nespresso-mjf@trivialmass.com` have no SPF/DMARC protection. They are likely to land in spam, and anyone can spoof this address.
- **Recommendation:** Add SPF: `v=spf1 mx ~all` (or include your mail provider). Add DMARC: `v=DMARC1; p=quarantine; rua=mailto:dmarc@trivialmass.com`

---

### [MEDIUM] No HTTP compression

- **Evidence:** No `content-encoding` header returned despite `Accept-Encoding: gzip,br` request.
- **Impact:** The React SPA bundle is served uncompressed, increasing load time and data usage.
- **Recommendation:** Enable `mod_deflate` or `mod_brotli` in Apache config.

---

### [MEDIUM] GDPR consent incomplete

- **File:** `src/components/PopupInscription.jsx`
- **Evidence:** Consent checkbox reads "J'accepte les conditions générales" with no link. Privacy notice is a single unstyled paragraph with no detail on data retention, data controller identity, or deletion rights.
- **Impact:** Under GDPR Art. 13 and Swiss nDSG, users must be informed of: data controller identity, retention period, their right to access/rectify/delete, and a link to the full privacy policy. The current implementation is non-compliant.
- **Recommendation:**
  1. Link "conditions générales" to an actual privacy policy page.
  2. Add data controller name (Trivial Mass / Nespresso) and contact.
  3. State retention period (e.g., "données conservées jusqu'au 31 août 2026").
  4. Add a deletion request contact.

---

### [LOW] Missing Referrer-Policy

- **Recommendation:** Add `Referrer-Policy: strict-origin-when-cross-origin`

### [LOW] Missing Permissions-Policy

- **Recommendation:** Add `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### [LOW] No Cache-Control on static assets

- **Evidence:** No `cache-control` header on responses. TTFB is fast (68ms) but repeated visits re-download all assets.
- **Recommendation:** Add `Cache-Control: public, max-age=31536000, immutable` for hashed Vite assets.

### [LOW] Confirmation email sent via PHP mail() without DKIM

- **Impact:** PHP's `mail()` function does not sign emails with DKIM. Combined with missing SPF, confirmation emails have a high spam score.
- **Recommendation:** Use an SMTP relay (Infomaniak SMTP, Brevo, etc.) with DKIM signing.

---

## Strengths

| Area | Status |
|------|--------|
| TLS | ✅ Let's Encrypt, TLS 1.0/1.1 rejected, cert valid until Aug 30 2026 |
| HSTS | ✅ Present (`max-age=16000000`) |
| Admin auth | ✅ Magic-link with 15-min expiry, single-use tokens, httpOnly session cookie |
| No third-party trackers | ✅ No analytics, no CDN leaking data |
| Data on-premise | ✅ MySQL on Infomaniak, no external SaaS |
| SQL injection | ✅ PHP uses PDO prepared statements throughout |
| Sensitive paths | ✅ Almost all return 401 (behind HTTP Basic Auth) |
| `.env` in production | ✅ Returns 403 (not accessible) |
| `.env` in `.gitignore` | ✅ Present |

---

## Priority Fix Order

1. 🔴 **Rotate the DB password** and remove hardcoded credentials from `save-result.php`
2. 🔴 **Restrict CORS** to same origin in `save-result.php`
3. 🟠 **Add rate limiting** to the PHP endpoint
4. 🟠 **Add security headers** (CSP, X-Frame-Options, X-Content-Type-Options) via Apache `.htaccess`
5. 🟠 **Fix GDPR consent** — link to privacy policy, add retention info
6. 🟡 **Add SPF/DMARC** DNS records
7. 🟡 **Enable compression** in Apache
8. 🟡 **Block `.git/`** explicitly in Apache config

