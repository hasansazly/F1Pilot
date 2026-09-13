# Architecture

## Runtime

Next.js App Router / React / strict TypeScript; Node 24 `node:sqlite`; custom accessible CSS components; Zod input validation; `pdf-parse` for local text-PDF extraction. No credentials, PostgreSQL daemon, or cloud services are needed for the local pilot. Bundled fonts are served locally.

## Boundaries

- `lib/domain.ts`: typed entities, fact extraction/confirmation, versioned date rules, timeline snapshots, deterministic recommendations, grounded local answers, draft decisions, evidence deletion.
- `lib/db.ts`: SQLite repository, schema initialization, password hashing, sessions, atomic aggregate mutation and account ownership boundary.
- `lib/auth.ts`: cookie authorization, same-origin mutation guard, client-safe errors.
- `app/api/*`: HTTP validation and authenticated adapters. Client cannot provide an owner ID.
- `components/workspace.tsx`: presentation and explicit student commands. No authoritative deadline arithmetic here.
- `scripts/worker.ts`: a one-shot scheduler adapter for deterministic evaluation and retention.

## Persistence

The local adapter stores one JSON domain aggregate per user in SQLite, rather than an unnormalized browser store. `BEGIN IMMEDIATE` serializes read/modify/write transactions; each update increments a revision. Relational users/sessions/workspaces have foreign keys and cascade deletion. `migrations/001_initial.sql` documents the idempotent schema applied on startup. Artifact versions and fact relationships are modeled inside the aggregate.

This favors a zero-configuration single-host pilot. It is not a production normalized PostgreSQL implementation. A production repository should split aggregates into tenant-scoped relational tables, preserve the same domain APIs and add optimistic client revision handling.

## Evidence flow

PDF/TXT bytes → private SQLite blob abstraction → text pages → labeled candidate fields → confirmed fact → source-linked rule output → deterministic recommendation → review → draft decision. PDF transcript coordinates are page/line locations in extracted text; no false pixel bounding boxes are generated. Manual field proposals bind to a real nonempty source line and still need separate confirmation.

## Jobs and external effects

Processing happens synchronously for bounded uploads; Activity records actual completed operations. The one-shot worker can be scheduled externally. There is no durable distributed queue, live progress stream or long-running OCR. Draft approval unlocks a local download; no send action exists. Calendar export creates an offline ICS file and never writes to a calendar account.

## Production extension seams

Replace the inline document-byte repository with an encrypted private object store and authenticated signed download flow. Add durable job records and an idempotent queue runner. Add a source-review registry with effective dates and migrations before enabling real legal date rules. A model adapter may extract/summarize/draft only; confirmed facts and approved source references remain its retrieval inputs. External action adapters must enforce explicit approval on the server, immutable payload hashes, idempotency keys, execution result events, and cancellation.
