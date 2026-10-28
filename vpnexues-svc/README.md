# VPNexues — Spring Boot Backend (`vpnexues-svc`)

> **New developer?** Read **[`../ARCHITECTURE.md`](../ARCHITECTURE.md)** first — the full system map: services (Firebase OTP verification, Supabase PostgreSQL, Cloudinary, GeoIP cascade), auth/security model, pricing rules, deploy flow.

- **Stack**: Java 17 · Spring Boot (Gradle wrapper) · Spring Web / Data JPA / Security · JWT via jjwt (httpOnly cookies) · Caffeine rate limits · springdoc-openapi (Swagger, public) · PostgreSQL + Flyway
- **Run**: `.\gradlew.bat bootRun` (one word — **not** `boot run`) → http://localhost:8080 · Swagger: `/swagger-ui.html` · health: `/api/health`
- **Tests**: `.\gradlew test` (JUnit 5, loads `.env` automatically, needs a running Postgres) — pricing rules + order-status state machine are the highest-value suites, alongside the admin access/permission ones (`AdminAccessPassServiceTest`, `AdminProductVisibilityTest`, `AdminUserManagementServiceDeleteTest`)
- **Config**: git-ignored `.env` (copy `.env.example`) — DB, `JWT_SECRET`, SMTP, `CORS_ALLOWED_ORIGINS`, `OTP_PROVIDER`, `ADMIN_BOOTSTRAP_*`. **Never** hardcode secrets in `application.yml`/`build.gradle`.
- **Migrations**: `src/main/resources/db/migration/` — append-only `V*` (currently through `V52`; never edit an applied one); `R__Seed_data.sql` is the only in-place-editable file and must stay idempotent. `ddl-auto` is `validate` only — schema changes go through Flyway.
- **Package layout**: `config/ security/ auth/ controller/ service/ repository/ entity/ dto/ exception/` — no mapper layer (services own their `toDto()`).
- **Deploy**: code is copied to the Render mirror repo (`VPNexues-Backend-Server-Render`) after diff review + permission → CI tests → Render Docker auto-deploy → smoke `/api/health`. Deploy glue (Dockerfile etc.) lives only in that mirror, not in this repo. ⚠️ The mirror is currently **behind `SunilVPN`** — see `../ARCHITECTURE.md` §14.
- More detail: [`../ARCHITECTURE.md`](../ARCHITECTURE.md) §5 (backend structure) and §7 (auth & security model)
