# Flash Orbit

Flash Orbit is a multi-tenant commerce, inventory, and financial-management SaaS for ambitious
businesses. The initial market is Nigeria, with Africa next.

The application includes the public marketing website, authentication, workspace
onboarding, a product catalog, and inventory management. Product interfaces and
financial figures shown on the marketing page are illustrative; order processing,
payments, and financial operations are not implemented.

## Run locally

```sh
npm ci
npm run dev
```

Available checks:

```sh
npm run lint
npm run typecheck
npm run build
```

`npm run typecheck` generates Next.js route types before checking the TypeScript
project, so it also works when starting from a clean checkout.
`npm test` loads `.env` when present; tests require a reachable local PostgreSQL
database through `TEST_DATABASE_URL` or `DATABASE_URL`.
`npm test` loads `.env` when present; tests require a reachable local PostgreSQL
database through `TEST_DATABASE_URL` or `DATABASE_URL`.

## Workspace operations

The authenticated workspace app supports team membership, seven-day email
invitations, role changes, workspace settings, workspace-scoped activity history,
and daily snapshots for active members, products, and variants. Invitations are
accepted only by a verified account with the invited email. Owners can invite
admins, managers, and staff; admins can invite managers and staff. Only owners
and admins can edit settings or view subscription details and audit history.

The active workspace can be changed in the dashboard sidebar. Users can belong
to multiple workspaces; role and tenant checks remain enforced by server-side
services. The subscription record starts with `FOUNDATION` entitlements and
does not represent a paid subscription. No payment provider or usage limits are
configured or enforced.

Workspace operations use `/api/workspaces/[slug]/members`,
`/api/workspaces/[slug]/invitations`, `/api/workspaces/[slug]/settings`,
`/api/workspaces/active`, and `/api/invitations/accept`. Invitation delivery
uses the configured Resend sender and the app's `BETTER_AUTH_URL`.

## Local development infrastructure

Copy `.env.example` to `.env`, then adjust the local-only database values:

```sh
cp .env.example .env
docker compose up -d postgres
docker compose ps
docker compose logs -f postgres
```

The development switches for mock identity and seed data use the
`FLASH_ORBIT_DEV_*` environment-variable prefix. The local `.env` was migrated;
update other existing development configurations to these names. The database name,
user, and persistent volume keep their existing `flash` identifiers so a rebrand
does not detach local database data.

Build and run the existing Flash Orbit application in Docker:

```sh
docker compose up -d --build app
docker compose ps
curl -fsS http://127.0.0.1:3000/api/health
curl -fsS http://127.0.0.1:3000/ >/dev/null
```

Common container commands:

```sh
docker compose stop
docker compose start
docker compose restart
docker compose logs -f
docker compose down
docker compose down --volumes
docker compose build --no-cache app
```

`docker compose down` stops containers and preserves the named PostgreSQL volume.
`docker compose down --volumes` deletes the local database volume and resets local data.
The application container runs without a root process. PostgreSQL is exposed only on
`127.0.0.1:5432`; the application uses `postgres:5432` on the local Docker network.

## Phase 2A database development

The local database uses Prisma 7.10.1 with PostgreSQL 17. Keep `.env` local and
never commit database credentials.

```sh
npm run db:generate
npm run db:migrate:dev -- --name descriptive_name
npm run db:seed
npm run db:studio
npm test
```

Deploy an existing migration set locally or in a controlled environment:

```sh
npm run db:migrate
```

Reset only local development data:

```sh
npm run db:reset
npm run db:seed
```

Database modules belong behind server-only application boundaries. `DATABASE_URL`
must remain server-side and must never be prefixed with `NEXT_PUBLIC_`.

## Authentication and onboarding

The development environment uses Better Auth for email/password sign-up, sign-in,
session handling and sign-out. Production secrets must use an approved production URL
and at least 32 random characters.

```sh
# required local development values
BETTER_AUTH_SECRET=<32-plus-character-random-secret>
BETTER_AUTH_URL=http://127.0.0.1:3000

# application routes
http://127.0.0.1:3000/sign-up
http://127.0.0.1:3000/sign-in
http://127.0.0.1:3000/onboarding
http://127.0.0.1:3000/dashboard
```

Provider identities map to local Flash Orbit users through `ExternalIdentity`. Workspace
memberships and roles remain authoritative. Do not expose provider secrets or role claims
to client components. Email verification is required. The server-side Resend adapter is
implemented. The `flashorbit.xyz` sending domain is verified, and a delivery test from
`Flash Orbit <auth@flashorbit.xyz>` was confirmed delivered. Configure
`RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `RESEND_VERIFICATION_TEMPLATE_ID` for each
environment. Use a send-only API key restricted to the verified domain; the published
verification template must define `USER_NAME` and `VERIFICATION_URL`. Keep the full-access
setup key in a separate operator session or Resend CLI login; never store it in the app's
`.env` or pass it to the app container. For local testing without an owned domain, use
Resend's `onboarding@resend.dev` sender with Resend test recipient addresses only.

## Structured logging

Server logs are emitted as JSON with timestamps, log levels, a stable service name,
request correlation IDs, event names, duration metrics, and sanitized context. Set
`LOG_LEVEL` to `debug`, `info`, `warn`, or `error`. Secrets, session values, API keys,
passwords, cookies, authorization headers, and email fields are redacted. Resend email IDs
and internal workspace/user identifiers may be logged for tracing but customer PII should
not be added to log fields. Verification email request, provider acceptance, transient
retry, and failure events include the recipient domain and template ID, but never the full
recipient address or verification URL. Network/timeout failures are retried with bounded
backoff; exhausted delivery failures return a controlled 503 so users can try again.

## Frontend foundation

- Next.js App Router, React, and TypeScript
- CSS for layout, visual styling, and lightweight interactions
- Motion for component transitions such as the mobile navigation
- GSAP and ScrollTrigger for scoped entrances, selected section reveals, and dashboard
  storytelling
- Three.js, React Three Fiber, and Drei for the lazy-loaded, procedural hero scene
- Recharts for the illustrative dashboard chart

The hero 3D scene is loaded only when it approaches the viewport and WebGL is available.
Reduced-motion and low-memory devices use a static brand fallback. GSAP timelines and
ScrollTriggers are scoped and reverted on cleanup. Lenis is not installed; native scrolling
remains in use.

## Project guidance

Repository-specific Copilot instructions, agents, and prompts are in `.github/`. See
[`docs/engineering-workflow.md`](./docs/engineering-workflow.md) for the development
lifecycle and motion/3D requirements.

## Phase boundary

The current SaaS foundation covers authentication, identity mapping, workspace onboarding,
and a protected dashboard shell. Inventory, products, orders, payments, financial
operations, and team-management workflows remain deferred to later milestones.
