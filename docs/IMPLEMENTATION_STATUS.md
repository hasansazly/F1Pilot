# Implementation status

## Delivered

A working narrow CPT/OPT preparation pilot inside F1Pilot. The core student journey is implemented with real server-side validation, private SQLite persistence, original responsive UI, source-linked evidence, deterministic timelines and explicit draft decisions. No external credentials are needed.

| Area                               | Status                                                                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Landing / responsive visual design | Implemented; original design informed by all 11 supplied screenshots                                                                                           |
| Sign-up / sign-in / sign-out       | Implemented; protected routes, scrypt passwords, private sessions, isolated demos                                                                              |
| Profile                            | Implemented; editable institution, degree, process and DSO contact                                                                                             |
| I-20 document flow                 | PDF/TXT upload, original bytes, local text extraction, page/line transcript, per-field review and correction                                                   |
| Unfamiliar text layouts            | Manual source-line proposals, separately confirmed                                                                                                             |
| Evidence provenance                | Original values, quotes, version links, confirmations, supersession, historical timelines                                                                      |
| CPT/OPT timeline                   | Deterministic preparation rules; government dates explicitly illustrative and verification-required                                                            |
| University-specific demo           | Fictional Northstar workshop requirement and original inbox instruction                                                                                        |
| Inbox                              | Pasted messages, ISO date and requirement extraction, original review, approve/reject before timeline changes                                                  |
| Today / proactive engine           | Stored-condition cards for pending facts, conflict, approaching date, missing evidence, stale uploads, offer-date mismatch and follow-up checks; dismiss/defer |
| Grounded local assistant           | Confirmed-fact retrieval, citations, assumptions, refusal to make legal determinations; no model dependency                                                    |
| Prepared actions                   | Editable DSO email; explicit approve/cancel; approved draft download and activity record                                                                       |
| Requirements                       | Persistent status/evidence notes and DSO-question preparation                                                                                                  |
| Evidence Map                       | Stored document/fact/event overview and inspectable fact connections                                                                                           |
| Employment / Travel                | Basic persistent preparation details, date comparisons and DSO drafts                                                                                          |
| Data / Privacy                     | Full JSON export, ICS download, document/account deletion, consent and worker-enforced retention                                                               |
| Background work                    | Manual evaluation and schedulable one-shot worker; honest activity log                                                                                         |
| Documentation                      | Requirements, architecture, domain model, safety, privacy, test plan, status, README, environment example and migration                                        |

## Verification results

- Strict TypeScript check: passed.
- ESLint: passed.
- Vitest: 17 domain tests passed.
- Playwright: 4 browser/integration tests passed, including account isolation, actual PDF processing, approval/cancellation, original evidence, persistence and deletion.
- Axe smoke checks: Today and public landing passed; not a full accessibility certification.
- Production build: passed. Production server started on port 3001 and returned HTTP 200.
- Seed script: passed; fictional local demo account available.
- Worker: passed; evaluated stored fictional workspaces without external actions.
- Dependency install audit: zero known vulnerabilities after updating Vitest.
- Desktop/mobile screenshots captured and visually inspected. Fixed a mobile navigation transition overlay and landing graph ARIA role during verification.

Screenshots: `screenshots/today-desktop.png`, `screenshots/today-mobile.png`, `screenshots/landing-desktop.png`, `screenshots/landing-mobile.png`, `screenshots/document-review.png`.

## Explicit limits

1. This is a preparation pilot, not production immigration infrastructure or a legal calculator. Official-source effective dates remain unverified. The referenced USCIS page returned HTTP 403 during source checking. Government-window examples must be verified with a DSO.
2. The business blueprint DOCX was not available. The complete pasted brief and all 11 attached screenshots were used.
3. No OCR for scanned images, arbitrary-layout AI extraction, calibrated confidence model, or original-PDF bounding-box annotation. Exact page/line highlights refer to the extracted transcript.
4. Other document categories are upload/storage/manual-review extensions, not complete specialized extraction modules.
5. No live LLM, automatic forwarding, connected mailbox, email sending, calendar-account writes, government submission or rule-change monitor. Approval unlocks a local draft download only.
6. Employment and Travel remain lightweight preparation workspaces. Full CPT history, STEM reporting, job-location/end-date history, travel admission assessment and other future modules are deferred.
7. SQLite stores tenant aggregates and original bytes locally; no Prisma/PostgreSQL, encrypted object storage, durable distributed queue, MFA, recovery or production abuse perimeter. Disk permissions are not encryption.
8. Calendar export and JSON evidence packet are offline files. Automatic external execution is intentionally absent.
9. Timeline event completion/dispute workflow, configurable per-user planning buffers, explicit requirement dependency graph and production institution policy registry are future refinements. Displayed dates and requirements remain inspectable.
10. Node 24 emits an experimental SQLite warning. This is expected for the chosen zero-configuration adapter. Local standalone execution is tested; managed multi-instance/serverless deployment is not.

Product invariants in PRODUCT_REQUIREMENTS.md and AI_SAFETY_AND_LEGAL_BOUNDARIES.md must survive every future extension.
