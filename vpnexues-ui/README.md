# VPNexues — React Frontend (`vpnexues-ui`)

> **New developer?** Read **[`../ARCHITECTURE.md`](../ARCHITECTURE.md)** first — the full system map: services (Firebase OTP, Supabase, Cloudinary, GeoIP cascade), auth model, pricing rules, deploy flow.

- **Stack**: React 19 · TypeScript · Vite · CSS Modules · React Router v7 · Swiper · Framer Motion · Leaflet
- **Run**: `npm install && npm run dev` → http://localhost:5173 (backend on `:8080`, see `../README.md` Quick start)
- **Gates before push**: `npx oxlint src` (0 errors) · `npm run build` (OK)
- **Rules**: colours/spacing only from `src/styles/tokens.css` · no identity/order data in localStorage · all user-visible strings in all 5 i18n dictionaries (`src/i18n/translations/`) · one `*Api.ts` per backend resource — components never call Axios directly
- **Where things live**: routes `src/routes/` · pages `src/pages/` · global state `src/context/` · API layer `src/api/` · design tokens `src/styles/tokens.css` · admin scope checks (`hasModule`/`hasPermission`/`getAdminHome`) in `src/utils/adminScope.ts`
- **Admin permission options** are listed once per surface — `PERMISSION_OPTIONS` in `src/pages/admin/super/SubAdminsView.tsx` and `DEMO_PERMISSIONS` in `src/api/demo/demoAdmin.ts`. Both must be updated together with the backend whitelist whenever a grant is added (`hide` was added this way).
- More detail: [`../ARCHITECTURE.md`](../ARCHITECTURE.md) §4 (frontend structure) and §7 (auth & security model)

---

## Vite template notes (tooling)

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
