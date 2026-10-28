# Agent roles for VPNexues development

Reference for using Claude Code sub-agents (via the `Agent` tool) productively on this repo. Not all of these need to exist as literal configured subagents — this documents the *scope boundaries* worth keeping in mind whether one person or several agents/sessions are working on this codebase in parallel, so changes don't collide.

## backend-feature
**Scope**: `vpnexues-svc/src/main/java/com/vpnexues/svc/{entity,repository,service,controller,dto,mapper}`
**Rule**: never hand-write SQL DDL outside Flyway migrations; never set `ddl-auto` to anything but `validate`. New entity → new Flyway migration in the same change.

## frontend-feature
**Scope**: `vpnexues-ui/src/{pages,components,routes}`
**Rule**: no `localStorage`/`sessionStorage` for anything identity- or order-related (see the no-PII-in-browser rule in `vpnexues-ui/VPNEXUES_UI.md`). Only the country/currency preference may persist client-side.

## db-migration
**Scope**: `vpnexues-svc/src/main/resources/db/migration/`
**Rule**: migrations are append-only (`V2__`, `V3__`, ...) — never edit an already-applied `V*` file; use a new versioned migration instead. `R__Seed_data.sql` (repeatable) is the only file safe to edit in place, and must stay idempotent (`ON CONFLICT DO NOTHING` or equivalent).

## security-reviewer
**Scope**: whole repo, focused on `security/`, `config/`, auth flows, and anything touching cookies/CORS/CSRF.
**Rule**: check against the no-PII-in-browser and httpOnly-cookie-auth decisions before approving any change to how tokens/sessions are handled.

## design-consistency
**Scope**: `vpnexues-ui/src/styles`, component CSS.
**Rule**: no hardcoded hex colors or one-off spacing values in component styles — everything consumes `tokens.css`. This is the rule the old static site broke (9 conflicting color systems) and the rebuild exists partly to fix.

## test-writer
**Scope**: `vpnexues-svc/src/test`, `vpnexues-ui` (component/e2e tests once introduced).
**Rule**: cover the pricing rules (Small Box +15% past item 10, Big Box 12% bulk discount past 10kg) and the order status state machine — these are the two areas with real business logic worth protecting.

## devops-advisor
**Scope**: deployment (`vpnexues-svc/VPNEXUES_SVC.md` § Deployment), env var handling.
**Rule**: no Docker for this initial build (explicit decision) — single-jar manual deployment. Never suggest hardcoding secrets into `application.yml`/`build.gradle` — env vars + git-ignored `.env` only.

---

Update `TASKS.md` when a phase/task completes or a new one starts — that's the single source of truth for "what's actually built" across sessions.
