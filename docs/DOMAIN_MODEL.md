# Domain model

| Entity                  | Local representation                                                                                   | Connections                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Student / institution   | Workspace profile                                                                                      | Account owner, preparation process, DSO contact                    |
| Artifact / version      | Artifact ID, category, version, supersedes, original bytes, transcript                                 | Facts and preceding uploaded version                               |
| Extracted fact          | Key, value, original value, page, line, quote, confidence, status, effective date, timestamps, history | Artifact and consuming timeline events                             |
| Confirmation            | Confirmed timestamp plus prior-value history                                                           | Explicit student decision for a fact                               |
| Rule / version / source | `RULE` / `OFFICIAL` constants                                                                          | Required inputs, offsets, jurisdiction, review status, next review |
| Deadline / event        | Date, kind, explanation, fact IDs, source, rule version, status                                        | Confirmed evidence or approved imported message                    |
| Requirement             | Owner implied by workspace, status, evidence reference/note, updated timestamp                         | Preparation process and source records                             |
| Recommendation          | Derived card with stable ID                                                                            | Evidence, condition, next action, confidence, severity             |
| Decision / action       | Draft → approved or cancelled; body, recipient, decision time, local result                            | Explicit student review and Activity                               |
| Activity                | Timestamped actual domain operation                                                                    | Account-scoped history                                             |
| Timeline history        | Before-recalculation snapshots                                                                         | Prior event evidence and rule versions                             |
| Consent                 | Timestamp and description                                                                              | Account creation and retention preference                          |

Dates use ISO calendar dates. Arithmetic uses UTC calendar days, avoiding DST drift. Program end must follow confirmed program start. Only one current confirmed fact per key is allowed; explicitly confirming a new source supersedes the prior fact. The prior value and transition timestamp remain in history. Upload order alone does not establish legal/document validity.

Document deletion removes its facts, supersession pointers, derived timelines and potential copied evidence in conversations/drafts. Historical snapshots are cleared on deletion so deleted personal information is not retained there. Account deletion cascades all workspace and session rows. Rule definitions are public product metadata, not user data.

The visual Evidence Map is a compact aggregate overview. The inspectable connection cards provide the exact document → fact → event relationships; graph nodes do not imply unstored knowledge.
