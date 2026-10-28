# Common workflows for VPNexues development

Quick recipes for recurring tasks on this repo. See `agents.md` for scope/ownership boundaries and `TASKS.md` for current status.

## Run both apps locally

```bash
# Terminal 1 — backend
cd vpnexues-svc
set -a && source .env && set +a
./gradlew bootRun          # http://localhost:8080

# Terminal 2 — frontend
cd vpnexues-ui
npm run dev                # http://localhost:5173
```

If Gradle fails with a `PKIX path building failed` SSL error, see the AVG Antivirus workaround in `vpnexues-svc/VPNEXUES_SVC.md`.

## Add a new backend entity + endpoint

1. Write the JPA entity in `entity/`.
2. Write a new Flyway migration (`V{n}__description.sql`) creating the table — never rely on `ddl-auto`.
3. Repository interface in `repository/` (Spring Data JPA).
4. DTOs in `dto/` (request/response records), mapper in `mapper/`.
5. Service in `service/` (business logic, validation).
6. Controller in `controller/`, add the route to the API table in `vpnexues-svc/VPNEXUES_SVC.md`.
7. If it's a customer-auth-required or admin-only endpoint, wire it into the correct `SecurityConfig` filter chain — don't assume it's public.

## Add a new frontend page

1. Component in `pages/{customer,account,marketing,admin}/`.
2. Route registered in `routes/{customer,admin}`.
3. If it needs data, add/extend the relevant `api/*Api.ts` module — never call `fetch`/`axios` directly from a component.
4. Style with `tokens.css` variables only — no hardcoded colors/spacing.
5. If it touches user identity, cart, or order data: confirm nothing gets written to `localStorage`/`sessionStorage` (see `VPNEXUES_UI.md`).

## Testing

- Backend: `./gradlew test` (JUnit 5). Prioritize coverage on pricing rules (Small/Big Box discounts) and the order status state machine.
- Frontend: no test runner wired up yet — flagged as pending in `TASKS.md`.

## Deploy (manual, no Docker)

See `vpnexues-svc/VPNEXUES_SVC.md` § Deployment — build frontend, copy `dist/` into the backend's static resources, `./gradlew bootJar`, run the resulting jar with a populated `.env`.

## Database changes

Never connect as the Postgres superuser for app work — use the dedicated `vpnexues_app` role (see `vpnexues-svc/VPNEXUES_SVC.md` § Local database setup). Schema changes always go through a new Flyway migration, applied automatically on next backend boot.
