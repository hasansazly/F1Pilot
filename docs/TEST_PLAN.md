# Test plan

## Domain tests

Vitest verifies leap/calendar arithmetic; impossible dates; rule version and offsets; unconfirmed-date exclusion; provenance; program chronology; recommendation boundary; contradictory evidence stability; supersession and corrections; email approval before timeline change; CPT planning-only behavior; proactive cards and dismissals; actual evaluation activity; single-use approval and cancellation; deletion of derived copies; grounded citations and safety refusals.

## Browser and integration tests

Playwright verifies demo sign-in → sample I-20 → highlighted source → per-field confirmation → timeline → proactive evidence → draft → approval → activity, plus refresh persistence and mobile navigation. API integration checks unauthenticated denial, cross-user document and fact isolation, Origin validation, unapproved download rejection, full export, upload handling, document deletion and account deletion. A separate fresh-account journey verifies registration, inbox approval, draft cancellation and sign-out protection.

Axe accessibility analysis runs against the real Today screen. Desktop/mobile screenshots and overflow assertions cover responsive behavior. Production build and strict type/lint checks are required separately. Tests operate only on fictional accounts.

## Manual review checklist

Inspect screenshots for clipping, contrast, overly dense cards and mobile overflow. Verify the original source/confirmation interface, timeline explanation panel, empty workspace, errors and approval wording. Check all navigation destinations are useful and every button performs a real action. Do not claim full WCAG conformance from a smoke test.

## Remaining test limits

No multi-node load testing, production penetration test, OCR accuracy corpus, real university rule validation, government integration or external delivery tests apply to this offline pilot.
