# F1Pilot

A working, private CPT/OPT **preparation** pilot for F-1 students. Next.js App Router, strict TypeScript, Node 24 SQLite, Zod, local PDF text extraction, deterministic rules, and an original graphite/violet interface. No external API keys are required.

## Run locally

All commands run from this F1Pilot folder. Requires **Node.js 24+** and npm.

```sh
npm install
cp .env.example .env.local
npm run seed
npm run dev
```

Open http://127.0.0.1:3000. Choose **Explore fictional demo** for a fresh isolated demo, or sign in to the seeded account:

- Email: `maya@f1pilot.example`
- Password: `F1Pilot-demo-2026!`

The seeded credential is for local fictional data only. `DEMO_EMAIL` and `DEMO_PASSWORD` can override it when seeding. Ordinary sign-up creates an empty private workspace. There is no email verification or password-reset service in this pilot.

## Five-minute journey

1. Open the demo, then Documents → **Use sample I-20**.
2. Inspect each field’s page/line and highlighted source transcript. Confirm all five fields; correct a value if needed.
3. Open Timeline. Select a date to inspect its calculation, confirmed inputs, and demonstration rule.
4. Return to Today. Open a proactive card and review its evidence.
5. Prepare a DSO email. Edit it and approve the download, or cancel the action.
6. Open Activity to see the decision and download an approved draft. Nothing has been emailed.

The fictional Northstar workshop appears in Requirements and links conceptually to its original imported email in Inbox. No real university is represented.

## Verification

```sh
npm run typecheck
npm run lint
npm test
PLAYWRIGHT_BROWSERS_PATH=./.playwright-browsers npx playwright install chromium
npm run test:e2e
npm run build
npm start
```

Playwright uses port 3000, reuses an existing server, and stores screenshots under `docs/screenshots`. Stop the dev server before using `npm start` on the same port. For a separate production preview: `npm start -- --port 3001`.

## Storage and background evaluation

`data/f1pilot.sqlite` is created automatically with migrations. User-owned workspace aggregates, document bytes, evidence history, sessions and decisions persist across refreshes and restarts. Data, browser binaries and generated test artifacts are gitignored. This local database is **not encrypted at rest**. Disk/file permissions are the current storage boundary; see the production limitations before storing real sensitive evidence.

`npm run worker` runs one scheduled evaluation and enforces the optional 90-day document retention setting. Schedule that command with your host scheduler for unattended runs. `Run F1Pilot` performs the same deterministic evaluation manually, but retention cleanup is worker-only. The Activity screen records real completed steps. It does not simulate overnight AI work.

Example cron (adjust Node/npm PATH for your installation):

```cron
0 8 * * * cd /absolute/path/to/F1Pilot && /absolute/path/to/npm run worker
```

## Narrow MVP scope

Implemented: secure local sessions, sign-up/in/out, private routes, isolated demos, student profile, PDF/TXT upload, I-20 labeled extraction and manual source-line proposals, per-field confirmation/correction, evidence history, CPT planning buffer and illustrative OPT dates, pasted inbox approvals, requirements, proactive cards, evidence map, local grounded answers, draft approval/cancellation, calendar and complete JSON export, document/account deletion, basic Employment/Travel preparation notes, consent and retention, real evaluation history.

**Limits:** No arbitrary-layout OCR; scanned PDFs need a readable text copy. Highlighting is in the extracted transcript, not a bounding box over the original PDF. No live LLM, official-rule monitoring, mailbox forwarding, email delivery, calendar synchronization, government filing, institutional directory, or legal determinations. Government dates use a deliberately labeled demonstration rule and require professional verification. Employment/Travel are preparation workspaces, not complete future modules. No production PostgreSQL, object-store encryption, MFA, recovery, or managed job queue yet.

## Live integrations later

No unused API key switch pretends to enable an integration. Implement an adapter behind `lib/domain.ts` extraction/answer functions, keeping deterministic rules and confirmation mandatory. Add encrypted object storage at the private document repository boundary. Email/calendar adapters must consume an approved immutable action and record idempotent execution separately from approval. Forwarded messages must enter the same proposed-message path. Add a versioned official source review workflow before government-rule automation.

Read [implementation status](docs/IMPLEMENTATION_STATUS.md), [architecture](docs/ARCHITECTURE.md), and [safety boundaries](docs/AI_SAFETY_AND_LEGAL_BOUNDARIES.md) before extending this pilot. Product invariants are permanent.
