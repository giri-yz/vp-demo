# VPNexues — Project Architecture & Handover Map

> **Read this first if you are new to this project.** This file explains *what runs this product, which external tools it depends on, how the pieces connect, and how to run/deploy it*. It is the single source of truth for the system map — where other docs disagree, this file wins (reflects the current state as of **23-Oct-2026**).
>
> No secrets live in this file. Real keys/credentials are only ever in git-ignored `.env` files and the Render/Firebase/Supabase/Cloudinary consoles.

---

## 0. New joiner? Start here (≈20 minutes)

Six steps take you from a fresh machine to your first safe contribution. Do them in order.

**1 — Install OpenCode (the AI coding agent this project is developed with) — watch the installation guide.** Click the thumbnail **or** the URL; both open the same video:

<a href="https://youtu.be/EH0UWu-a_jg?si=wQHI_LvGXWrbv0-J" target="_blank">
  <img src="https://i.ytimg.com/vi/EH0UWu-a_jg/hqdefault.jpg" width="480" alt="OpenCode installation guide — click to watch on YouTube">
</a>

- Watch here → **https://youtu.be/EH0UWu-a_jg?si=wQHI_LvGXWrbv0-J**
- The video covers installing OpenCode on Windows and the first-run basics (free agent, 75+ models).

**2 — Switch OpenCode to the MiMo model (the default agent for this project).** Inside the OpenCode chat run:

```text
/connect
```

then select **MiMo** (`mimo-v2.6-flash-free`). Start every session this way.

**3 — Read this file end-to-end.** It is the system map: stack in §2, external services in §6, deploy in §12, do-nots in §13, and a "which doc do I read?" index in §16. Skim once, then re-read properly — where any other document disagrees with this file, **this file wins**.

**4 — Get it running locally** (§11): backend `gradlew bootRun` on `:8080` + frontend `npm run dev` on `:5173`. Login credentials are in the root `README.md`.

**5 — Git access: create your developer access token (push & pull).** Authentication uses a *personal access token* you generate yourself: GitHub → avatar → **Settings** → **Developer settings** → **Personal access tokens** → generate (fine-grained with *Contents: Read & write*, or classic with the `repo` scope) → copy the token **once**. When git — or OpenCode running git — asks for credentials on `git pull` / `git push`, use your GitHub username and **paste the token as the password**; Windows stores it after first use. The token is personal: never share it, never commit/paste it into code, docs or chat, and revoke + regenerate it if it ever leaks or expires.

**6 — Learn the gates before your first push** (§12) and the house rules (§13). The three that bite newcomers: migrations are **append-only**, no identity/order data in browser storage, secrets never enter git.

---

## 1. What VPNexues is

A **fresh-farm grocery e-commerce platform** (shop, Small Box / Big Box builders, B2B wholesale) with a customer storefront, a full account area, and a super-admin + sub-admin (per-country) dashboard. Customers browse in their local currency, sign in with **phone OTP**, and pay **Cash on Delivery** (payment gateway integration is future work). Orders can be handed off to WhatsApp for fulfilment.

Evolution: static HTML/jQuery site → current **React SPA + Spring Boot API**.

---

## 2. Tech stack at a glance

| Layer | Technology |
|---|---|
| Frontend | React 19 · TypeScript · Vite · CSS Modules · React Router v7 · Swiper · Framer Motion · Leaflet (maps) |
| Backend | Java 17 · Spring Boot (Gradle wrapper) · Spring Web / Data JPA / Security · JWT via jjwt (httpOnly cookies) · Caffeine (rate limiting) · springdoc-openapi (Swagger, public) |
| Database | PostgreSQL (production: Supabase; local: Postgres 18 service) · Flyway migrations · `ddl-auto: validate` only |
| Auth (customer) | Firebase Phone Auth (OTP) + device-bound OTP-less login · httpOnly cookies |
| Lint/Build | oxlint · `vite build` · JUnit 5 backend tests |
| CI | GitHub Actions: `frontend-ci.yml` (lint + build + secret gate), backend CI (test → deploy) on the Render mirror repo |

---

## 3. Repositories & branches (this trips up every new dev)

| Repo | What it holds | Branch we work on |
|---|---|---|
| `libinvpnexues-star/vpnreactsource` | **Daily work**: `vpnexues-ui/` (React) + `vpnexues-svc/` (Spring Boot) + CI workflows | **`SunilVPN`** (kept equal to `main`) |
| `hemaanthvpnexues/VPNexues-Backend-Server-Render` | **Backend deploy mirror**: `vpnexues-svc/` + `render.yaml` + Docker glue → Render auto-deploys this | `main` |
| `libinvpnexues-star/vpnexues-latest` | The **static HTML** project (original design source, served on port 1000) | `sunil` (lowercase) |

**Note:** `sunil` (lowercase) exists only in the HTML repo; the react repo's Sunil branch is **`SunilVPN`**.

Local folder map on the dev machine:

```
D:\vp nexues\vpnreactsource   ← daily dev (frontend + backend)
D:\vp nexues\Render           ← backend deploy mirror only (push → Render redeploys)
D:\vp nexues\GitRpo           ← static HTML project
```

Deploy glue (Dockerfile, start-render.sh, env.render.example) lives **only** in the Render mirror — intentionally absent from `vpnreactsource`.

---

## 4. Frontend structure — `vpnexues-ui/`

```
src/
  routes/{customer,admin}      page routing (React Router v7)
  pages/{customer,account,marketing,admin}   page components
  components/{common,checkout,pricing,addresses,admin}
  context/   AuthContext · AdminAuthContext · CartContext · CountryContext · WishlistContext · AddressContext
  api/       one *Api.ts per backend resource (Axios — never call fetch/axios from components)
  types/     TS interfaces mirroring backend DTOs
  hooks/ utils/ styles/tokens.css
  i18n/translations/           5 dictionaries: en · ta · hi · ms · si
```

- **Old page → route map**: `shop.html→/shop`, `pricing tabs→/pricing/{small-box,big-box,b2b}`, `account.*→/account/*`, `admin-login→/admin/login`, `admin-dashboard→/admin/{orders,products,...}`, etc.
- **Design rules**: base CSS = mobile, desktop via `@media (min-width: 768px)`; colours/spacing only from `src/styles/tokens.css` (no hardcoded hex in new code); pixel source-of-truth is the original `shop.html` design.
- **Dev servers**: Vite on `:5173` (also allows `:5174`); API base via `VITE_API_BASE_URL` in `.env.local` (proxy `/api` → `:8080`).

---

## 5. Backend structure — `vpnexues-svc/`

```
src/main/java/com/vpnexues/svc/
  config/       SecurityConfig, CorsConfig, cookie/JWT setup
  security/     JWT filter chains + OriginVerificationFilter (CSRF compensating control)
  auth/         OtpProvider (stub | Twilio | Firebase), admin login, trusted-device login
  controller/   REST controllers
  service/      business logic (each service owns its private toDto())
  repository/   Spring Data JPA
  entity/       JPA entities
  dto/          request/response records
  exception/    GlobalExceptionHandler → {success:false,message} envelope
src/main/resources/db/migration/   Flyway V1…V52 + R__Seed_data.sql
```

- **Migrations are append-only**: never edit an applied `V*`; `R__*` is the only in-place-editable file and must stay idempotent.
- **Package layout rule**: no mapper/ layer — services map DTOs themselves.
- Key entities: `Product (+ProductPriceOverride)`, `Cart/CartItem` (`weightKg` for Big Box), `User` (phone-based), `Address`, `Order (+channel SHOP/SMALL_BOX/BIG_BOX/B2B)`, `OrderItem`, `Payment`, `Coupon`, `AdminUser`, `AdminAccessPass`, `Category`, `InventoryItem`, `B2BEnquiry`, `Testimonial`, `ContactMessage`, `StoreSettings`, `TeamMember`, `NewsArticle`, `UserDevice` (trusted devices).

---

## 6. External services & tools (the "who does what" table)

| Service | What we use it for | Where it's wired |
|---|---|---|
| **Firebase** (`Phone Auth`) | **The production OTP provider.** Signup OTP via Phone Auth + reCAPTCHA; authorized domains: localhost, `*.firebaseapp.com`, `*.web.app`, 127.0.0.1, `vpnexues.com`, `www.vpnexues.com` (missing `www` once broke Safari signups) | Frontend `src/config/firebase.ts`, `src/api/authApi.ts`; backend verifies the Firebase ID token (`FirebaseAuthService`, JWKS) |
| **Supabase** | **Production PostgreSQL** (Mumbai, PG 17) + **Storage buckets** for the HTML project (`product-images`, `site-assets`, `javascript-assets`) + the older project's storage. DB pooler URL in backend `.env` | Backend `DB_URL/DB_USERNAME/DB_PASSWORD`; HTML project uses public bucket URLs |
| **Cloudinary** | React **product image CDN** (URLs built from DB `image_url`; Monika designs folder for Beverages). Local fallback copies live in `public/images/products/` | Backend `.env` creds; frontend `src/utils/imageUrls.ts` |
| **GeoIP cascade** | Country detection for currency/pricing: **browser GPS first**, then IP via `ipapi.co → ipwho.is → geojs.io → ipinfo.io` (each is a fallback if the previous fails) | Frontend `src/utils/geoDetect.ts` + `CountryContext` (result cached in localStorage `vpnexues_detected_country`) |
| **Country flags** | Self-hosted SVGs in `public/images/*.svg` (flagcdn removed — it was blocked/third-party) | `src/utils/flags.ts flagSrc()` |
| **Twilio Verify** | Alternative `OTP_PROVIDER` (trial-limited: only verified caller IDs) — **not active**; default provider is `stub` locally / Firebase in production | backend `.env` `OTP_PROVIDER`, `TWILIO_VERIFY_SERVICE_SID` |
| **SMTP email** | Contact-form, career-application and B2B-enquiry notifications (auto-reply + team inbox) | backend `SMTP_*` env vars, `app.contact.mail.receiver` |
| **WhatsApp** | Order-success handoff to `wa.me` (shopping number) with a prefilled order message; popup-based delivery flow | `src/utils/whatsappPopup.ts`, `OrderSuccess.tsx`, `B2B.tsx` |
| **Leaflet + OpenStreetMap (Photon geocoding)** | Address map picker (pin required), delivery map preview in checkout | `AddressModal.tsx`, `CheckoutTemp.tsx` |
| **Font Awesome** | Self-hosted (`public/fontawesome/`, FA 6.5.1) — CDN removed to kill third-party requests + Edge console errors | `index.html` |
| **GitHub Actions** | Frontend CI: oxlint + `vite build` + **secret gate** (fails the build if `service_role` appears in source/bundle); Backend CI on the deploy mirror: test → deploy | `.github/workflows/frontend-ci.yml`, mirror repo `backend-ci.yml` |
| **Render** | Hosts the Spring Boot API as a Docker service, auto-deploy on push to the deploy mirror's `main` | live API `https://vpnexues-api.onrender.com` (free tier — cold starts 60–100 s) |
| **GoDaddy** | Hosts the built SPA on `www.vpnexues.com` (SPA rewrite via `.htaccess`) | `public_html` upload of the production zip |

---

## 7. Auth & security model (read before touching auth code)

- **No PII in browser storage.** Sessions are httpOnly Secure cookies set by the backend; the frontend never reads/persists a token. **Only** country/currency/lang preference, guest cart/addresses and coupon state may live in localStorage.
- **Cookies**: `vpx_at` (customer) · `vpx_admin_at` (admin) · `vpx_dv` (trusted device, 180-day rolling, max 5 devices LRU) · guest-session cookie for cart.
- **Two independent Spring Security filter chains**: admin `@Order(1)` on `/api/admin/**`, customer `@Order(2)` for the rest; the JWT `type` claim keeps tokens non-interchangeable. Admin role is read from the **DB row**, not the token.
- **OTP flow**: signup = Firebase Phone Auth (server verifies the Firebase ID token and enforces its `phone_number` claim matches the request). Login = OTP-less when the number is known **and** the device holds a valid `vpx_dv` cookie; otherwise falls back to Firebase OTP. Rate limit: Caffeine 5/number + 30/IP per 5 min → 429.
- **CSRF (current decision)**: token validation is **disabled on both chains**; the compensating control is `OriginVerificationFilter` — any state-changing request whose `Origin`/`Referer` is outside `CORS_ALLOWED_ORIGINS` is rejected (covers non-preflighting form CSRF). JSON-only writes + httpOnly cookies complete the picture. Older docs describing `X-XSRF-TOKEN` headers are historical.
- **CORS**: explicit allow-list (`CORS_ALLOWED_ORIGINS`) + `allowCredentials(true)`, never `*`. Production: `www.vpnexues.com`, `vpnexues.com`, `localhost:5173`, `localhost:5174`.
- **Admin bootstrap**: first `SUPER_ADMIN` is created from `ADMIN_BOOTSTRAP_EMAIL`/`ADMIN_BOOTSTRAP_PASSWORD` env vars when `admin_users` is empty.
- **Sub-admin delegation.** Each `AdminUser` row carries two whitelisted CSV columns — `modules` (`dashboard`/`orders`/`products`/`users`/`reports`/`payments`/`support`/`content`) and `permissions` (`view`/`edit`/`delete`/`hide`/`export`). Anything unrecognised is silently dropped on save, so a **new grant has to be added in both places** — the backend whitelists (`AdminAccessService`, `AdminUserManagementService`) and the frontend `PERMISSION_OPTIONS`. A **blank** `modules` column means unrestricted: that is how the four original country admins are grandfathered, and why editing one of them never narrows their access by accident. Enforced in `AdminAccessService` (`requireRead` / `requirePermission` / `requireAnyPermission`); `AdminUserManagementController` and `AdminAccessPassController` are `SUPER_ADMIN`-only at class level.
- **One-time access pass (Feature B).** Accounts created *after* the original four must present a 6-digit pass at every login: minted by the Super Admin, single use, 10-minute TTL, killed after 3 wrong tries. `create()` defaults `access_pass_required = true`; `V51` backfilled `false` for the pre-existing rows and `SUPER_ADMIN` is never gated. The passcode is stored SHA-256 hashed (`admin_access_passes`), and the plaintext is returned exactly once — at generation.
- **Product visibility** has its own endpoint: `PUT /api/admin/products/{id}/visibility` accepts `hide` **or** `edit` and writes *only* `active`. It is deliberately separate from `PUT /api/admin/products/{id}` (which requires `edit` and carries prices), so a visibility change can never create or move a `ProductPriceOverride`. Every **public** product query filters `active = true`; the admin list does not, so hidden rows stay visible and restorable. `DELETE /api/admin/products/{id}` is the soft delete (`active = false`) — orders reference products, so a hard delete would violate the FK.

---

## 8. Country & pricing system (core business logic)

- **4 markets**: IN (₹, rate 62) · SG ($, rate 1) · US ($, rate 0.74) · AE (د.إ, rate 2.72). **Base prices are SGD**; regional prices come from `ProductPriceOverride` rows (18 manual INR overrides exist). Price Manager admin edits per region.
- **Country source**: browser GPS first, then the GeoIP cascade; the choice persists and drives currency, flags, phone validation and delivery thresholds.
- **Small Box**: first 10 units standard price, units 11+ ×1.15.
- **Big Box**: weight-priced (0.5 kg steps); once total weight ≥ 10 kg the **entire subtotal gets 12% off** (a cliff, not marginal).
- **Delivery** (single source: frontend `src/utils/delivery.ts`, mirrored in backend `OrderService`): fee IN ₹40 / SG S$5 / US $5 / AE د.إ15; free-delivery thresholds IN ₹1000 / SG $20 / US $15 / AE د.إ60.
- **Phone validation** per country (IN 10 digits starting 6–9, SG 8, US 10, AE 9 …).
- ⚠️ Tests for the pricing rules and the order-status state machine are the highest-value backend tests — run `gradlew test` after any pricing change.

---

## 9. Data & image flows

```
React shop  →  listProducts()  →  backend  →  Supabase DB (image_url)  →  Cloudinary CDN
                                                              ↘ fallback: public/images/products/*
HTML site   →  direct Supabase Storage public URLs (3 buckets)  +  LOCAL_IMG fallback
Banners     →  local assets (public/images/banners, page-banner-*.jpg)
```

Orders: `channel` = SHOP | SMALL_BOX | BIG_BOX | B2B; each order stores country, currency snapshot and discount amounts server-side. **The server always recomputes payable amounts** — never trust totals from the client.

---

## 10. Environments

| Env | Frontend | Backend | Database |
|---|---|---|---|
| Local dev | `localhost:5173` (Vite) | `localhost:8080` (`gradlew bootRun`) | local Postgres 18 (`vpnexues_app` / `vpnexues_db`) |
| Production | `www.vpnexues.com` (GoDaddy, SPA `.htaccess`) | `https://vpnexues-api.onrender.com` (Render, Docker) | Supabase PostgreSQL (Mumbai pooler) |

- Backend env vars (all in git-ignored `.env`, see `.env.example`): `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `SMTP_HOST/PORT/USERNAME/PASSWORD`, `CORS_ALLOWED_ORIGINS`, `OTP_PROVIDER`, `SERVER_PORT`, `ADMIN_BOOTSTRAP_EMAIL/PASSWORD`, `TWILIO_VERIFY_SERVICE_SID`, `UPLOAD_DIR`, `app.trusted-device.ttl-days`, `app.contact.mail.receiver`.
- Frontend: `VITE_API_BASE_URL` in `.env.local` / `.env.production`.
- Swagger UI is intentionally **public**: `http://localhost:8080/swagger-ui.html`.

---

## 11. Run it locally

```bash
# Terminal 1 — backend (port 8080)
cd vpnexues-svc && .\gradlew.bat bootRun      # NOT "boot run" (ambiguous task)

# Terminal 2 — frontend (port 5173/5174)
cd vpnexues-ui && npm run dev
```

- One-time DB setup + local admin/customer login flows: see the root `README.md` (Quick start + Credentials).
- Gradle `PKIX path building failed` on Windows = antivirus HTTPS interception → set `GRADLE_OPTS` truststore flags.

---

## 12. Build & deploy

1. **Frontend**: `npm run build` → `dist/` → packaged as the GoDaddy zip (must include the hidden `.htaccess`; **zip must be built with forward-slash entries** — use `tar -a -cf`, never PowerShell `Compress-Archive`, which writes backslash paths that break Linux unzip) → **gate the zip: `powershell -File vpnexues-ui/check-zip.ps1 <zip>` must print ALL GREEN** → upload + extract into `public_html`.
2. **Backend**: code is copied from `vpnreactsource/vpnexues-svc/` into the Render mirror repo, committed **after diff review + permission**, pushed → CI tests → Render Docker auto-deploy → smoke-test `/api/health`.
3. **Never push without explicit permission.** Never commit `.env`, secrets, or session-log `.md` files (this `ARCHITECTURE.md` is the agreed, one-time exception — it is meant to be in the repo).
4. **Gates before any push**: `npx oxlint src` (0 errors) · `npm run build` (OK — `postbuild` runs `rewrite-media-urls` + `verify-api-base`, which fails the build on a doubled/missing API base **or** a deploy build without the Firebase web key) · backend `gradlew test` (green) · staged-diff secrets scan · zips: `check-zip.ps1` ALL GREEN.

---

## 13. House rules (enforced by review + CI)

1. Mobile-first: base styles = mobile, desktop via `@media (min-width: 768px)`; header ≈ 80 px sticky.
2. **No hardcoded hex/one-off spacing** in component CSS — consume `styles/tokens.css`.
3. **No identity/order data in browser storage** (see §7).
4. Pure React — no plain HTML/CSS/JS patches inside the React app.
5. Product data always comes from the backend API, never embedded in components.
6. One `*Api.ts` per backend resource — components never touch Axios directly.
7. New backend entity ⇒ new Flyway migration in the same change; append-only.
8. i18n: any user-visible string goes into **all 5 dictionaries** (en/ta/hi/ms/si) — verify UTF-8 (console garbles Tamil/Hindi; validate files with a UTF-8-safe script).
9. Repo status conventions: 3 local markdown logs (`AGENTS.md`, `DAILY_LOG.md`, `COMMIT_LOG.md`) stay **local-only**; `TASKS.md` tracks what's actually built.

---

## 14. Known open items (as of 23-Oct-2026)

- ~~**Deploy mirror is behind `SunilVPN`.**~~ **RESOLVED 23-Oct-2026**: the Render mirror was synced (`cb55be7`, carrying `R__Seed_data.sql` + `V7` + `V58` and everything before), Backend CI went green (tests from an empty Postgres 17) and Render auto-deployed. Production migrations are current through `V58`. **Standing rule:** after any backend change lands on `SunilVPN`, copy `vpnexues-svc/` into the mirror repo and push — CI tests gate the deploy.
- **GoDaddy frontend deploy is manual** (no CI path): the built zip must pass `vpnexues-ui/check-zip.ps1` (ALL GREEN) before it is extracted into `public_html` — see §12.
- Backend admin country-scoping for payments/customers/contact-messages (orders already scope server-side).
- Cart optimistic-update race hardening (temp-id queue semantics).
- Admin honesty gaps: customer detail modal orders load, super-admin Users CRUD demo-store removal, settings placebo buttons.
- i18n parity backlog (~292 keys exist only in English; falls back to English safely).
- FIRST200 promo discount: needs a product decision (server-side eligibility vs local fallback).
- Supabase `service_role` key rotation (manual console action from the QA audit).
- `npm run typecheck` (`tsc -b`) fails with ~162 pre-existing errors (unused vars, stale union types) and is **not** wired into CI — only oxlint + `vite build` gate the frontend.
- Docs referenced but absent from this branch: `TASKS.md`, `vpnexues-ui/VPNEXUES_UI.md`, `vpnexues-svc/VPNEXUES_SVC.md` (all three are linked from the READMEs).
- Full QA findings + fix status live in the QA reports (ask the QA owner for `QA-Remediation-Report-2026-10-14.html`).

---

## 15. Team

| Role | Name |
|---|---|
| Head | Venkateshan |
| Team Lead (Dev) | Libin K |
| Frontend UI Dev | Sunil Kumar R |
| Web Dev | Sathish R · Hemaanth Kumar T N · Jagadeeswaran · Arun |
| QA | AI agent (20+ yr persona) + manual testing |

---

## 16. Which doc for what

| Question | Read |
|---|---|
| **"I'm new here — where do I start?"** | **§0 at the top of this file** + the shareable `ONBOARDING.html` guide (same repo root) |
| **"What is this system and which tools does it use?"** | **This file (`ARCHITECTURE.md`)** |
| Quick start, credentials, admin permissions, sample API calls | root `README.md` |
| Frontend stack, gates, where things live | `vpnexues-ui/README.md` |
| Backend stack, tests, migrations, deploy | `vpnexues-svc/README.md` |
| Agent/scope boundaries for parallel work | `agents.md` |
| Recurring-task recipes | `skills.md` |

> `TASKS.md`, `vpnexues-ui/VPNEXUES_UI.md` and `vpnexues-svc/VPNEXUES_SVC.md` are still named in `agents.md` / `skills.md`, but they do not exist on this branch — see §14.

---

*Maintained as part of the 14-Oct-2026 QA/handover pass; refreshed 23-Oct-2026 (new-joiner quickstart §0, deploy-mirror sync status, zip-gate rules). Update this file whenever a service, flow or deploy step changes — a stale map is worse than no map.*
