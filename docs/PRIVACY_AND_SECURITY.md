# Privacy and security

## Implemented local controls

- Scrypt password hashes with random salt; passwords never stored as plain text.
- Cryptographically random 256-bit session cookies; only SHA-256 token hashes stored server-side.
- HttpOnly, SameSite=Strict, seven-day expiry; `COOKIE_SECURE=true` for HTTPS hosting. Local HTTP preview defaults to false explicitly.
- Session rotation on login and revocation on sign-out; private page and every data API require a valid server session.
- User ownership derives from session, never request parameters. Document, fact and action IDs are looked up only inside that user's workspace.
- Mutation Origin must exactly match request URL Origin. Deploy reverse proxies with consistent canonical host handling.
- Zod validation; PDF signature/extension validation; TXT rejection for null bytes; file size limit 5 MB; extracted text limit 150,000 characters; categories allowlisted.
- Original PDFs delivered only after authorization with nosniff, no-store and sandbox response policy; no uploaded file lives under public/.
- SQLite directory mode 0700 and database mode 0600. Secure deletion enabled; account deletion compacts the database. No application content logging or analytics.
- Explicit export, local deletion, consent history and configurable retention. Worker enforces 90-day document expiration when chosen.

## Data retention and deletion

Full JSON export contains sensitive originals and evidence; it is a user-requested authenticated download. Calendar export contains event labels and explanations. Approved draft download contains exactly the reviewed body. Account deletion removes users, sessions and workspace data by cascade. Document deletion removes original bytes and derived copies in fact history, timeline history, chats and drafts; dependent requirements revert to missing. OS snapshots, backups, previously exported files and browser downloads are outside application deletion control.

## Deployment limits

This is a single-host local pilot. Storage is not encrypted at rest; use fictional data until encrypted managed storage and operational controls are installed. The aggregate API returns the user's whole workspace, including original blobs; move originals to a dedicated encrypted object adapter for production. No MFA, recovery, email verification, malware sandbox, distributed abuse protection, production audit immutability, backup retention service or formal security assessment is provided. Login attempts have local email/demo throttling, not a comprehensive perimeter abuse service. Enforce request sizes at the reverse proxy as well as the upload handler. PDFs are parsed in-process; production needs resource-limited worker isolation. There is no claim that this local app meets a particular regulatory standard.
