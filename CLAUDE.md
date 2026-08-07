# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

CAF web application ("Concentrado de Aprobación de Facturas"/solicitudes CAF) for MPA Group. Internal tool to create, route and approve contracting requests (solicitudes CAF). Two independent apps in one repo:

- `frontend/` — React 19 + TypeScript SPA (Create React App), served under base path `/mpa-webapp-caf`.
- `backend/` — FastAPI + SQLAlchemy + pyodbc against SQL Server (MS SQL).

The repo root `package.json` only wires up deploy tooling (`mpa-deploy-tools`) and Husky hooks; it is **not** where the app code lives.

## Commands

### Backend (run from `backend/`)
- Dev server: `uvicorn main:app --host 0.0.0.0 --port 8003 --reload` (see `start_backend_dev.bat`; `main.py`'s `__main__` block uses 8002, but deploy/IIS proxies to **8003** via `web.config`).
- `start_backend.bat` is what the NSSM service `Backend-WebappCAF` runs in production — **no `--reload`**. The deploy watcher restarts the service itself (`nssm restart`), so the reloader is unnecessary and only causes mid-traffic restarts. Don't add it back.
- Install deps: `pip install -r requirements.txt` (use the local `venv/` or `.venv/`).
- Run all tests: `pytest` (from `backend/`).
- Run one test file: `pytest tests/test_caf_solicitud.py`
- Run one test: `pytest tests/test_caf_solicitud.py::<test_name>`
- Standalone observer-pattern smoke test: `python test_observer_pattern.py`

### Frontend (run from `frontend/`)
- Dev server: `npm start` (http://localhost:3000)
- Build (production): `npm run build` → outputs to `frontend/build/`
- Tests: `npm test` (react-scripts / Jest watch mode)

### Repo-level deploy tooling (run from root)
- `npm test` → runs `mpa-deploy-tools` deploy-config check (NOT app tests).
- `npm run deploy:dry-run` → `mpa-deploy-tools/build-agent.js`.
- Husky `pre-commit` runs `npm run precommit`; `pre-push` runs `npm run prepush` (build-agent). Deploy targets are defined in `deploy.config.yml` (SharePoint storage + IIS/NSSM service `Backend-WebappCAF`).

## Backend architecture

FastAPI app (`backend/main.py`) mounts a single router tree under `/api/v1` (`app/api/main.py`). On startup it calls `initialize_observers()` to wire the Observer pattern.

Layering: **api → services → (models / repositories / events)**.

- `app/core/database.py` — SQLAlchemy engine for SQL Server. Auto-detects the best installed ODBC driver and always uses SQL auth (`MASTER_DB_*` env vars) with `TrustServerCertificate=yes`. `get_db()` is the FastAPI session dependency. The database is **`WH_QA_Macquarie`** — despite the "QA" in the name, this is the one real database the deployed app uses.
- `app/core/config.py` — `settings` singleton reading env (SharePoint `SP_*`, Microsoft Graph `GRAPH_*`, `FRONTEND_BASE_URL`). Loaded from `backend/.env`.
- `app/models/` — SQLAlchemy ORM. Central table is `TBL_CAF_Solicitud` (`caf_solicitud.py`); plus catalogs (`building`, `tipo_contratacion`, `tipo_trabajo`, `vendor`, `elegibilidad_usuario`).
- `app/services/` — business logic. `caf_solicitud_service.py` is the core; `user_service.py` / `vendor_service.py` query Microsoft Graph + DB; `email_service.py` sends mail via Microsoft Graph; `mri_connector_service.py` for MRI integration.
- `app/repositories/elegibilidad_repository.py` — data access for `CAT_Elegibilidad_Usuario`.
- `scripts/` — one-off support tooling, run manually from `backend/` with the venv active. `reasignar_responsable.py` changes a solicitud's `Responsable` (there is no UI for this: when the assigned approver leaves or goes on vacation the solicitud is stuck). It reuses `SessionLocal` + `CafSolicitudService` + `email_service`, simulates unless `--aplicar`, and only mails with `--notificar`.

### Approval state machine (the domain core)
`TBL_CAF_Solicitud.approve` is an integer with this meaning (see `SolicitudStatus` enum in `models/caf_solicitud.py`):
- `NULL` = pendiente (initial state on create; the service strips any incoming `approve` so it stays NULL).
- `0` = `requiere_correcciones` (temporary reject; comments **required**).
- `1` = `aprobado`.
- `2` = `rechazado_definitivo` (comments optional).

Cyclic flow: a solicitud in `requiere_correcciones` (0) that gets updated resets to NULL (pendiente) and re-notifies. The approval endpoint is `PATCH /api/v1/caf-solicitud/{id}/approval` with body `{approve, comentarios}` (see `api/caf_solicitud.py` and `schemas/caf_solicitud.py`).

### Observer / domain events
Decoupled notifications via an in-process Observer pattern (`app/events/`):
- `event_dispatcher.py` — `EventDispatcher` singleton (`get_event_dispatcher()`); `Observer` ABC with `handle()` / `can_handle()`.
- `domain_events.py` — events: `SolicitudCreada`, `SolicitudAprobada`, `SolicitudRechazada`, `SolicitudActualizada`, `SolicitudCorreccionesRealizadas`.
- `observers/email_notification_observer.py` — sends emails on those events (uses `FRONTEND_BASE_URL` to build links). `mock_email_observer.py` for testing.
- `observer_initializer.py` — subscribes observers at startup.

`CafSolicitudService` dispatches events but never knows about observers. Observer exceptions are logged and swallowed so one failing observer doesn't break the request.

### User eligibility (recent migration)
Who can be selected as Responsable / which AD users appear is driven by the `CAT_Elegibilidad_Usuario` table (rule types: `dominio`, `departamento`, `puesto`; ordered by `Prioridad`), queried through `ElegibilidadRepository`. These rules were previously hardcoded — do not reintroduce hardcoded lists. `UserService` combines these rules with Microsoft Graph queries (MSAL client-credentials, scope `User.Read.All`). See `IMPLEMENTACION_ELEGIBILIDAD_USUARIOS.md`.

## Frontend architecture

CRA + TypeScript SPA using `HashRouter` (routes are `/#/...`). `App.tsx` is the entry, wraps routes with `ProtectedRoute` and renders the shared `NavBar` from the `mpa-shared-components` package (git dependency).

- Auth is **SAML/SSO via Azure AD**, but delegated to a separate external service (`AuthService.ts` calls `config.API_URL_AML`, an AML service, not this repo's backend). Session is cookie-based (`credentials: 'include'`). `useAuth` hook + `ProtectedRoute` guard pages.
- `config/config.ts` holds the API base URLs (`API_URL` for the CAF backend, `API_URL_AML` for the auth/AML service). These are hardcoded and toggled by comment for dev/prod — check this file when API calls hit the wrong host/port.
- `components/Inicio/CAF/` — the five solicitud form types, one per `Tipo_Contratacion`: `FormatoCO` (Contrato de Obra), `FormatoOS` (Orden de Servicio), `FormatoOC` (Orden de Cambio), `FormatoPD` (Pago a Dependencia), `FormatoFD` (Firma de Documento). `ApprovalActions` / `ApprovalPage` handle the approve/reject UI.
- `utils/caf-solicitud.utils.ts` — the form↔API mapping layer (`mapFormatoXXToAPI` / `mapAPIToFormatoXX`) plus checkbox↔int and date helpers. The DB stores document checkboxes as ints and dates need formatting, so always route payloads through these mappers.
- `utils/pdf/` — `@react-pdf/renderer` PDF generation, one `generatePDFxx.tsx` per formato + shared `pdfStyles.ts`.
- `services/` — axios clients per resource (`caf-solicitud.service.ts`, `user.service.ts`, `building.service.ts`).

### Frontend authorization for approvals
Only the assigned **Responsable** sees approval controls. Authorization is client-side: `canUserApprove()` / `getUserPermissions()` in `caf-solicitud.utils.ts` compare the authenticated user's email (case-insensitive) against the solicitud's `Responsable`. Roles: `responsable` (can act), `solicitante` (creator, read-only), viewer (read-only). This is UI-only — there is no equivalent authorization check in the backend yet (see `SEGURIDAD_APROBACIONES.md`).

## Conventions & gotchas

- Codebase comments, docstrings, log messages and the design docs (`*.md` at root) are in **Spanish**. Match that when editing.
- Tipo_Contratacion values are full Spanish strings ("Contrato de Obra", etc.), mapped to route slugs — see `test_mapeo.py` for the correct mapping (do not use the old code-based `CO`/`OS`/... mapping).
- Many `TBL_CAF_Solicitud` columns are `varchar` even for amounts/numbers — values are passed as strings, not numerics.
- **Column widths live in three places and must stay in sync**: the SQL Server DDL, the `String(n)` in `models/caf_solicitud.py`, and the `maxLength` on the corresponding form field. SQLAlchemy does **not** validate lengths client-side and `POST /caf-solicitud` takes a raw `dict` (no Pydantic schema), so an oversized value travels untouched to the `INSERT` and surfaces as SQL Server error 8152 ("String or binary data would be truncated") — which does not name the column. When that happens, read the `📏 CAF payload lengths` line the service prints and compare against the DDL. `Descripcion_trabajo_servicio` is `varchar(2000)`; most other text columns are 100, 500 or 1000.
- `frontend/esquema-er.md` is **outdated** and reports wrong column sizes. Source of truth is the live DDL or `models/caf_solicitud.py`.
- `email_service.send_mail()` hardcodes a CC to `jose.serna@mpagroup.mx` on **every** mail the system sends.
- `FRONTEND_BASE_URL` defaults to `http://localhost:3000`. Any script that sends mail from a dev machine will embed an unusable link unless it overrides the base URL.
- The backend logs heavily with `print()` + emoji to stdout for tracing request flow; this is intentional in this codebase.
- Secrets live in `backend/.env` and `frontend/.env` / `.env.local` (gitignored). `backend/.env.example` documents required vars.
- Reference docs at repo root: `ARQUITECTURA_APROBACION.md`, `IMPLEMENTACION_APROBACIONES_COMPLETA.md`, `SEGURIDAD_APROBACIONES.md`, `IMPLEMENTACION_ELEGIBILIDAD_USUARIOS.md`. `frontend/esquema-er.md` documents the ER schema but is stale — see the gotcha above.
