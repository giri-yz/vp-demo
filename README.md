# VPNexues

> **New developer?** Start with **[`ARCHITECTURE.md`](ARCHITECTURE.md)** — the project map: full system structure, every external service (Firebase, Supabase, Cloudinary, GeoIP detection, Render, GoDaddy…), auth/security model, pricing rules, environments, deploy flow and house rules. Where this README is older, `ARCHITECTURE.md` wins (it reflects the current state).

Grocery ordering / tracking / delivery application. Migration from a static HTML/jQuery/CSS prototype into a real React + Spring Boot application.

## Status

| Phase | Status |
|---|---|
| Phase 0 — Scaffolding & design approval | ✅ Complete |
| Phase 1 — Customer core commerce (Home, Shop, Cart, Checkout, Login) | ✅ Functionally complete — a few items deferred, see below |
| Phase 2 — Customer account section (Account hub, Orders, Addresses, FAQ, Terms, ...) | ⬜ **Not started** |
| Phase 3 — Admin / super-admin | ✅ Complete |
| Phase 4 — Marketing pages | ✅ Complete |
| Phase 5 — Design refresh (v2 tokens) + Shop/Small Box/Big Box/My Teams/Checkout | ✅ Complete |

**What's left**: Phase 2 hasn't been started (Account hub, Payment History, Personal Info, Addresses w/ map picker, Notifications, Help/Support, FAQ, Terms). A dedicated order-tracking page and wishlist remain deferred from Phase 1. Full history and reasoning: `TASKS.md`.

## Layout

- [`vpnexues-ui/`](vpnexues-ui/) — React frontend (customer + admin UI, one app). See [`vpnexues-ui/README.md`](vpnexues-ui/README.md).
- [`vpnexues-svc/`](vpnexues-svc/) — Spring Boot backend (REST API + PostgreSQL). See [`vpnexues-svc/README.md`](vpnexues-svc/README.md).
- [`design-tokens/`](design-tokens/) — standalone preview of the consolidated color/typography/spacing design tokens.

> **Doc gaps on this branch (`SunilVPN`):** `TASKS.md`, `vpnexues-ui/VPNEXUES_UI.md`, `vpnexues-svc/VPNEXUES_SVC.md` and the `vpnexues-latest-main/` static design reference are all referenced by older docs but are **not present here**. Treat [`ARCHITECTURE.md`](ARCHITECTURE.md) as the source of truth until they are restored.

The full migration plan (decisions, architecture, phasing) lives at `C:\Users\User\.claude\plans\i-am-developing-brand-zippy-cat.md`.

---

## Quick start

### Prerequisites

- Java 17
- Node.js 20+
- PostgreSQL running locally, with the `vpnexues_app` role and `vpnexues_db` database created (one-time setup — see `vpnexues-svc/VPNEXUES_SVC.md` § Local database setup)
- A `vpnexues-svc/.env` file (copy `.env.example`, fill in `DB_PASSWORD`/`JWT_SECRET`/etc.) — git-ignored, never commit it

### 1. Backend — `vpnexues-svc` (Spring Boot, port 8080)

```bash
cd vpnexues-svc
./gradlew bootRun          # Git Bash / macOS / Linux
.\gradlew.bat bootRun      # Windows PowerShell / cmd
```

`.env` is loaded automatically by the Gradle `bootRun`/`test` tasks — no manual `source .env` needed on any platform. Flyway migrates the schema automatically on first boot. Runs at **http://localhost:8080**.

### 2. Frontend (customer) — `vpnexues-ui` (Vite/React, port 5173)

```bash
cd vpnexues-ui
npm install
npm run dev
```

Runs at **http://localhost:5173**, expects the backend on `:8080` (override via `VITE_API_BASE_URL` in `vpnexues-ui/.env.local` if needed).

### 3. Frontend (admin dashboard)

Same app, same `npm run dev` process — just a different route, no separate build:

**http://localhost:5173/admin/login**

### 4. API docs (Swagger)

- Swagger UI: **http://localhost:8080/swagger-ui.html**
- Raw OpenAPI spec: **http://localhost:8080/v3/api-docs**

Both are public (no login needed to browse).

---

## Credentials

### Admin login

The first `SUPER_ADMIN` account is created automatically the first time the backend boots with an empty `admin_users` table, from `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` in `.env`. Current local dev account:

| | |
|---|---|
| URL | http://localhost:5173/admin/login |
| Email | `admin@vpnexues.com` |
| Password | `Admin@2026` |
| Role | `SUPER_ADMIN` |

This is a throwaway local-dev credential (no real payment gateway or SMS behind it) — fine to keep as-is on your own machine. Once logged in as SUPER_ADMIN, create additional admin accounts from **Admin Users** in the sidebar.

#### Country sub-admins (the original four)

The four pre-existing country admins — these predate the access-pass feature, so they sign in with the **password alone** (leave the pass field blank):

| Country | Email | Password | Role |
|---|---|---|---|
| India (`IN`) | `india@vpnexues.com` | `India@2026` | `SUB_ADMIN` |
| USA (`US`) | `usa@vpnexues.com` | `Usa@2026` | `SUB_ADMIN` |
| UAE (`AE`) | `uae@vpnexues.com` | `Uae@2026` | `SUB_ADMIN` |
| Singapore (`SG`) | `singapore@vpnexues.com` | `Singapore@2026` | `SUB_ADMIN` |

#### One-time access pass (Feature B) — "5th sub-admin onward"

Any account added **after** those four, via **Add Sub Admin**, needs a fresh 6-digit pass from the Super Admin on *every* login (10-minute TTL, single use, 3 wrong tries lock it):

1. Add the sub-admin — **the access-pass panel opens by itself** as soon as the account is created, so the code is minted while your super-admin session is still valid. (Later re-issues: row `⋮` → **Generate access pass**.)
2. Share the code out-of-band (call / WhatsApp / in person) — it is shown once.
3. The sub-admin enters password + that code at `/admin/login`.

Scope lives in `admin_users.access_pass_required` (migration `V51`): backfilled to `FALSE` for accounts that already existed, `TRUE` by default for everything created afterwards; `SUPER_ADMIN` is never gated either way.

> ⚠️ **One admin session per browser.** Admin auth is a *single* httpOnly cookie (`vpx_admin_at`) per origin, so signing in as a sub-admin replaces the super-admin session in **every tab**. From that point Super-Admin-only calls (generating passes, Add/Edit/Delete Sub Admin) return **403** until you sign back in as the Super Admin — the page you already had open keeps rendering its stale data, which makes it look like a bug. To keep both sessions alive at once, use a **separate browser profile or an incognito window** for sub-admin logins.

#### Admin modules & permissions

`Add Sub Admin` / `Edit Sub Admin` grant two whitelisted CSV columns, `modules` and `permissions`. Anything unrecognised is silently dropped on save, so adding a **new** grant means updating the backend whitelist *and* the frontend `PERMISSION_OPTIONS` in the same change.

- **Modules** — `dashboard` · `orders` · `products` · `users` · `reports` · `payments` · `support` · `content`
- **Permissions** — `view` · `edit` · `delete` · `hide` · `export`

| Action | Needs |
|---|---|
| Read a module's data | that module, or `reports` (implies read-only everywhere) |
| Add a product / change a price | `products` + `edit` |
| **Hide or show a product on the shop** | `products` + `hide` **or** `edit` |
| Delete a product (soft delete) | `products` + `delete` |
| Manage sub-admins / mint access passes | Super Admin only |

A row with a **blank** `modules` column is *unrestricted* (full access) — that is how the four original country admins were grandfathered in, and it is why editing one of them never accidentally narrows their access.

Hiding a product is a soft, reversible switch: every **public** shop query filters `active = true`, so it drops off the storefront immediately, while the admin list keeps showing it (a new **Hidden from Shop** filter pill) so it can be brought back. It goes through its own endpoint — `PUT /api/admin/products/{id}/visibility` — which carries nothing but the flag, so a visibility change can never move a regional price.

### Customer login

There's no fixed customer account — auth is phone number + a one-time code, and since `OTP_PROVIDER=stub` (the default), the code is never actually sent anywhere: it's printed to the **backend's** terminal output instead.

1. Go to http://localhost:5173/login
2. Enter any phone number, e.g. `+6591234567`
3. Check the `vpnexues-svc` console for a line like:
   ```
   [STUB OTP] phone=+6591234567 code=072006 (expires in 5 min)
   ```
4. Enter that code on the verify screen

A `User` row is created automatically on first successful verification — no separate signup step.

---

## Auth model (read before touching auth code)

- **No PII in browser storage.** Auth is httpOnly, Secure, SameSite=Lax cookies set by the backend — the frontend JS never reads or stores a token. `vpx_at` = customer session, `vpx_admin_at` = admin session, on two independent Spring Security filter chains with different JWT `type` claims — a customer token can never authenticate an admin endpoint or vice versa.
- **CSRF.** Every state-changing request (`POST`/`PUT`/`DELETE`) needs an `X-XSRF-TOKEN` header matching the `XSRF-TOKEN` cookie, fetched first via `GET /api/csrf-token`. The frontend's `httpClient.ts` handles this automatically for every page in the app.
- **Roles.** Admin accounts are `ADMIN` or `SUPER_ADMIN`. SUPER_ADMIN-only: Admin Users management, and (once wired to a real provider) Settings → Email/Payment.
- ⚠️ **Cross-origin gotcha, worth knowing if you build another client**: dev frontend (`:5173`) and backend (`:8080`) are different origins, so axios needs `withXSRFToken: true` set explicitly — otherwise it silently drops the CSRF header on every request and everything 403s. Already set in `httpClient.ts`; this bit us once already (see `TASKS.md`'s 2026-08-08 entry) — a curl-based client sets headers manually so this only bites real browser clients.

---

## Sample API requests

All examples use `curl` with a cookie jar to carry the session/CSRF cookies between calls.

### Public / customer

**Get a CSRF token first** (needed before any state-changing call):
```bash
curl -c cookies.txt http://localhost:8080/api/csrf-token
CSRF=$(grep XSRF-TOKEN cookies.txt | awk '{print $NF}')
```

**Browse products:**
```bash
curl "http://localhost:8080/api/products?country=SG&page=0&size=10"
```

**Customer login — send OTP:**
```bash
curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"phone":"+6591234567"}' \
  http://localhost:8080/api/auth/otp/send
# then read the code from the vpnexues-svc console
```

**Customer login — verify OTP:**
```bash
curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"phone":"+6591234567","code":"072006"}' \
  http://localhost:8080/api/auth/otp/verify
```

**Add an item to cart** (works as guest too, via an httpOnly guest-session cookie):
```bash
curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"productId":"<a product id from /api/products>","qty":2}' \
  http://localhost:8080/api/cart/items
```

**Submit a contact message** (no auth needed — lands in the admin Contact Messages inbox):
```bash
curl -b cookies.txt -c cookies.txt -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"name":"Jane Doe","email":"jane@example.com","subject":"Delivery question","message":"Do you deliver on weekends?"}' \
  http://localhost:8080/api/contact-messages
```

### Admin

**Admin login:**
```bash
curl -c admin-cookies.txt http://localhost:8080/api/csrf-token
CSRF=$(grep XSRF-TOKEN admin-cookies.txt | awk '{print $NF}')
curl -b admin-cookies.txt -c admin-cookies.txt -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"email":"admin@vpnexues.com","password":"Admin@2026"}' \
  http://localhost:8080/api/admin/auth/login
```

**List orders** (filters are all optional — `status`, `channel`, `country`, `dateFrom`, `dateTo`, `page`, `size`):
```bash
curl -b admin-cookies.txt "http://localhost:8080/api/admin/orders?status=PLACED&page=0&size=20"
```

**Create a product:**
```bash
curl -b admin-cookies.txt -c admin-cookies.txt -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $CSRF" \
  -d '{"name":"Organic Honey 500g","category":"Groceries","basePrice":9.90,"unit":"500g","sku":"HONEY-500"}' \
  http://localhost:8080/api/admin/products
```
(`category` must match an existing category name — see `GET /api/admin/categories` — and `slug`/`sku` must be unique.)

**Update an order's status:**
```bash
curl -b admin-cookies.txt -c admin-cookies.txt -H "Content-Type: application/json" -H "X-XSRF-TOKEN: $CSRF" \
  -X PUT -d '{"status":"CONFIRMED"}' \
  http://localhost:8080/api/admin/orders/<order-id>/status
```

Full endpoint list and exact request/response shapes for every controller: **Swagger UI** (above) — more reliable than this list as the API grows.

---

## Documentation map

- [`ARCHITECTURE.md`](ARCHITECTURE.md) — system map: services, auth model, pricing, environments, deploy flow, house rules. The authoritative doc where others disagree
- [`agents.md`](agents.md) — scope boundaries for working on this repo across multiple sessions/agents
- [`skills.md`](skills.md) — reusable skill definitions
- [`vpnexues-ui/README.md`](vpnexues-ui/README.md) · [`vpnexues-svc/README.md`](vpnexues-svc/README.md) — per-package quick reference
