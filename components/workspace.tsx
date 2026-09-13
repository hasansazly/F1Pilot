"use client";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  Sun,
  CalendarDays,
  Files,
  Inbox,
  ListChecks,
  Sparkles,
  Briefcase,
  Plane,
  Activity,
  ShieldCheck,
  Settings,
  Workflow,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Play,
  ChevronRight,
  X,
  FileText,
  Check,
  Clock,
  LogOut,
  Menu,
  Download,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import Brand from "./brand";
import {
  type Workspace,
  type Card,
  type Artifact,
  type Event,
  type Action,
  labels,
  OFFICIAL,
  RULE,
  daysUntil,
} from "@/lib/domain";
const nav = [
  { name: "Today", icon: Sun },
  { name: "Timeline", icon: CalendarDays },
  { name: "Documents", icon: Files },
  { name: "Inbox", icon: Inbox },
  { name: "Requirements", icon: ListChecks },
  { name: "Ask F1Pilot", icon: Sparkles },
  { name: "Evidence Map", icon: Workflow },
  { name: "Employment", icon: Briefcase },
  { name: "Travel", icon: Plane },
  { name: "Activity", icon: Activity },
  { name: "Data and Privacy", icon: ShieldCheck },
  { name: "Settings", icon: Settings },
];
const subtitles: Record<string, string> = {
  Timeline: "Every date has a story. Here is yours.",
  Documents: "The source of truth, with you in control.",
  Inbox: "Important messages, connected to the bigger picture.",
  Requirements: "Small steps toward a more prepared next chapter.",
  "Ask F1Pilot": "Answers that show their work.",
  "Evidence Map": "Your documents, facts, and next steps — connected.",
  Employment: "Prepare the conversation. Keep the evidence.",
  Travel: "A thoughtful checklist for the journey ahead.",
  Activity: "An honest record of what happened, and why.",
  "Data and Privacy": "Your information belongs to you.",
  Settings: "A workspace that understands where you are.",
};
function fmt(s: string) {
  return new Date(s.length === 10 ? s + "T12:00:00" : s).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" },
  );
}
function Source() {
  return (
    <div className="source-note">
      <ShieldCheck size={15} />
      <div>
        <a href={OFFICIAL.url} target="_blank" rel="noreferrer">
          {OFFICIAL.title} <ArrowUpRight size={12} />
        </a>
        <small>
          Rule {RULE.version} · Demonstration only · Effective date unverified
          <br />
          Source review attempted {OFFICIAL.reviewed}; requires DSO
          verification.
        </small>
      </div>
    </div>
  );
}
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: React.ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <button aria-label="Close dialog" onClick={close}>
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function WorkspaceUI({
  initial,
  initialCards,
}: {
  initial: Workspace;
  initialCards: Card[];
}) {
  const router = useRouter();
  const [w, setW] = useState(initial);
  const [cards, setCards] = useState(initialCards);
  const [page, setPage] = useState("Today");
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [mobile, setMobile] = useState(false);
  const [doc, setDoc] = useState<string>();
  const [event, setEvent] = useState<Event>();
  const [card, setCard] = useState<Card>();
  const [action, setAction] = useState<Action>();
  const [tour, setTour] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string>();
  const [filter, setFilter] = useState("All");
  const [question, setQuestion] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const activeDoc = w.artifacts.find((a) => a.id === doc);
  const next = w.events.find((e) => daysUntil(e.date) >= 0);
  const confirmedCount = w.facts.filter((f) => f.status === "confirmed").length;
  const pendingActions = w.actions.filter((a) => a.status === "draft");
  function go(p: string) {
    setPage(p);
    setMobile(false);
    setNotice("");
    setError("");
  }
  async function mutate(body: Record<string, unknown>, message = "Saved") {
    setBusy(String(body.op));
    setError("");
    try {
      const r = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (d.deleted) {
        router.push("/");
        router.refresh();
        return;
      }
      setW(d.workspace);
      setCards(d.cards);
      setNotice(message);
      return d.result ?? true;
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  async function draft(topic: string) {
    const result = await mutate(
      { op: "prepare", topic },
      "Draft prepared. Nothing has been sent.",
    );
    if (result) setAction(result);
  }
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy("Reading document and extracting facts");
    setError("");
    const form = new FormData();
    form.set("file", file);
    form.set(
      "category",
      (document.getElementById("category") as HTMLSelectElement)?.value ||
        "I-20",
    );
    try {
      const r = await fetch("/api/documents", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setW(d.workspace);
      setCards(d.cards);
      setDoc(d.result.id);
      setNotice("Upload stored privately. Review proposed facts.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
      e.target.value = "";
    }
  }
  async function ask(e?: React.FormEvent) {
    e?.preventDefault();
    if (!question.trim()) return;
    const result = await mutate(
      { op: "ask", question },
      "Answer prepared from stored evidence.",
    );
    if (result) {
      setQuestion("");
      go("Ask F1Pilot");
    }
  }
  function formValues(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    return Object.fromEntries(new FormData(e.currentTarget));
  }
  return (
    <div className="app-shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <Brand />
        <button className="workspace-selector" onClick={() => go("Settings")}>
          <span className="mini-logo">
            <Navigation size={15} />
          </span>
          <span>
            My student workspace
            <small>{w.demo ? "Fictional demo" : "Private workspace"}</small>
          </span>
          <ChevronRight size={14} />
        </button>
        <span className="nav-label">WORKSPACE</span>
        <nav>
          {nav.map((n, i) => (
            <div key={n.name}>
              {i === 7 && <span className="nav-label">YOUR NEXT CHAPTER</span>}
              {i === 9 && <div className="nav-separator" />}
              <button
                className={page === n.name ? "nav-item active" : "nav-item"}
                onClick={() => go(n.name)}
              >
                <n.icon size={17} />
                <span>{n.name}</span>
                {n.name === "Today" && cards.length > 0 && (
                  <span className="nav-count">{cards.length}</span>
                )}
                {n.name === "Inbox" &&
                  w.messages.some((m) => m.status === "proposed") && (
                    <span className="small-dot" />
                  )}
              </button>
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button className="tour-link" onClick={() => setTour(true)}>
            <Sparkles size={15} /> Find your way around{" "}
            <ArrowUpRight size={13} />
          </button>
          <div className="user-block">
            <span className="avatar">
              {w.profile.name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
            <span>
              {w.profile.name}
              <small>F-1 · {w.profile.stage} preparation</small>
            </span>
            <button
              aria-label="Sign out"
              onClick={async () => {
                const r = await fetch("/api/auth", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ mode: "signout" }),
                });
                if (r.ok) {
                  router.push("/login");
                  router.refresh();
                } else setError("Could not sign out. Try again.");
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div>
            <button
              className="mobile-menu"
              aria-label="Toggle navigation"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span className="crumb">
              Workspace <ChevronRight size={12} /> <strong>{page}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="private-label">
              <ShieldCheck size={13} /> Private by default
            </span>
            <span className="demo-label">
              {w.demo ? "FICTIONAL DEMO" : "LOCAL PILOT"}
            </span>
          </div>
        </header>
        <main className="workspace-main" id="main">
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {page === "Today"
                  ? new Date()
                      .toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })
                      .toUpperCase()
                  : "YOUR STUDENT WORKSPACE"}
              </span>
              <h1>
                {page === "Today" ? (
                  <>
                    A clearer day, {w.profile.name.split(" ")[0]}
                    <span className="violet">.</span>
                  </>
                ) : (
                  page
                )}
              </h1>
              <p>
                {page === "Today"
                  ? "Your next chapter is taking shape. Here’s what needs a little attention."
                  : subtitles[page]}
              </p>
            </div>
            <button
              className="secondary"
              disabled={!!busy}
              onClick={() =>
                mutate(
                  { op: "run" },
                  "Evaluation complete. View the actual steps in Activity.",
                )
              }
            >
              <Play size={14} />
              {busy === "run" ? "Evaluating…" : "Run F1Pilot"}
            </button>
          </div>
          {(error || notice || busy) && (
            <div
              className={error ? "feedback error" : "feedback"}
              role={error ? "alert" : "status"}
            >
              {error || (busy ? `Working · ${busy}` : notice)}
              <button
                aria-label="Dismiss notification"
                onClick={() => {
                  setError("");
                  setNotice("");
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {page === "Today" && (
            <>
              <section className="overview-strip">
                <div>
                  <span className="eyebrow">YOUR CURRENT CHAPTER</span>
                  <strong>
                    <span className="stage-dot" />
                    {w.profile.stage} preparation
                  </strong>
                  <small>
                    {w.profile.institution ||
                      "Add your institution in Settings"}
                  </small>
                </div>
                <div>
                  <span className="eyebrow">NEXT DATE TO REVIEW</span>
                  <strong>{next ? fmt(next.date) : "Confirm your I-20"}</strong>
                  <small>
                    {next
                      ? next.title
                      : "Your timeline begins with verified facts"}
                  </small>
                </div>
                <div>
                  <span className="eyebrow">TIME TO PREPARE</span>
                  <strong>
                    {next ? (
                      <>
                        {daysUntil(next.date)}{" "}
                        <span className="muted">days</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </strong>
                  <small>
                    {next
                      ? "Until the next stored event"
                      : "No confirmed timeline yet"}
                  </small>
                </div>
                <div>
                  <span className="eyebrow">TIMELINE CONFIDENCE</span>
                  <strong className="confidence-text">
                    Requires verification
                  </strong>
                  <small>{confirmedCount} confirmed facts · demo rules</small>
                </div>
              </section>
              <div className="section-title">
                <h2>
                  Prepared for your attention <span>{cards.length}</span>
                </h2>
                <div className="filter-tabs">
                  {["All", "Priority", "Review"].map((t) => (
                    <button
                      key={t}
                      className={filter === t ? "selected" : ""}
                      onClick={() => setFilter(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="card-grid">
                {cards
                  .filter(
                    (c) =>
                      filter === "All" ||
                      (filter === "Priority"
                        ? ["amber", "rose"].includes(c.severity)
                        : ["violet", "blue"].includes(c.severity)),
                  )
                  .map((c) => (
                    <article key={c.id} className={`intel-card ${c.severity}`}>
                      <div className="card-top">
                        <span className="eyebrow">{c.type}</span>
                        {c.deadline ? (
                          <span className="date-tag">{fmt(c.deadline)}</span>
                        ) : (
                          <Sparkles size={14} />
                        )}
                      </div>
                      <h3>{c.title}</h3>
                      <p>{c.why}</p>
                      <div className="evidence-chip">
                        <Workflow size={12} />
                        {c.factIds.length
                          ? `${c.factIds.length} linked facts`
                          : "Stored workspace evidence"}
                        <span>·</span>
                        {c.confidence}
                      </div>
                      <div className="card-actions">
                        <button
                          className="card-primary"
                          onClick={() => setCard(c)}
                        >
                          Review next step <ArrowRight size={14} />
                        </button>
                        <button
                          aria-label={`Defer ${c.title}`}
                          title="Defer one day"
                          onClick={() =>
                            mutate(
                              { op: "dismiss", id: c.id, defer: true },
                              "Deferred for one day.",
                            )
                          }
                        >
                          <Clock size={14} />
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
              {!cards.length && (
                <div className="empty-state">
                  <Sparkles size={28} />
                  <h3>Room for a clearer plan.</h3>
                  <p>Add your I-20 to connect the first dots.</p>
                  <button className="primary" onClick={() => go("Documents")}>
                    Add your first document <Plus size={16} />
                  </button>
                </div>
              )}
              <div className="bottom-grid">
                <section className="panel recent-panel">
                  <div className="section-title">
                    <h2>Behind the scenes</h2>
                    <button
                      className="text-button"
                      onClick={() => go("Activity")}
                    >
                      View activity <ArrowUpRight size={13} />
                    </button>
                  </div>
                  {w.activity.slice(0, 3).map((a) => (
                    <div className="activity-row" key={a.id}>
                      <span className="activity-icon">
                        <Check size={13} />
                      </span>
                      <div>
                        <strong>{a.title}</strong>
                        <small>{a.detail}</small>
                      </div>
                      <time>
                        {new Date(a.at).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                  ))}
                  {!w.activity.length && (
                    <p className="muted">
                      Your activity will appear when you add evidence.
                    </p>
                  )}
                </section>
                <section className="panel review-panel">
                  <div className="section-title">
                    <h2>Your approval queue</h2>
                    <ShieldCheck size={17} />
                  </div>
                  <p>
                    {pendingActions.length
                      ? `${pendingActions.length} prepared draft${pendingActions.length === 1 ? "" : "s"} waiting for your decision.`
                      : "The next move is always yours."}
                  </p>
                  {pendingActions.length ? (
                    pendingActions.map((a) => (
                      <button
                        className="queue-item"
                        key={a.id}
                        onClick={() => setAction(a)}
                      >
                        {a.title}
                        <ArrowUpRight size={14} />
                      </button>
                    ))
                  ) : (
                    <>
                      <small>
                        No pending drafts. Prepare a question for your DSO when
                        you’re ready.
                      </small>
                      <button
                        className="secondary"
                        onClick={() => draft("What should I prepare next?")}
                      >
                        Prepare a DSO email <ArrowRight size={14} />
                      </button>
                    </>
                  )}
                </section>
              </div>
            </>
          )}
          {page === "Documents" && (
            <>
              <div className="toolbar">
                <div>
                  <h2>
                    Your evidence library{" "}
                    <span className="count">{w.artifacts.length}</span>
                  </h2>
                  <p className="muted tiny">
                    Private storage · PDF / TXT · up to 5 MB · no external AI
                  </p>
                </div>
                <div className="inline-actions">
                  <button
                    className="secondary"
                    disabled={!!busy}
                    onClick={async () => {
                      const a = await mutate(
                        { op: "sample" },
                        "Sample added. Confirm the extracted fields.",
                      );
                      if (a) setDoc(a.id);
                    }}
                  >
                    Use sample I-20
                  </button>
                  <button
                    className="primary"
                    disabled={!!busy}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Plus size={16} /> Upload document
                  </button>
                </div>
              </div>
              <label className="category-label">
                Upload category
                <select id="category">
                  {[
                    "I-20",
                    "Passport",
                    "Visa",
                    "I-94",
                    "EAD",
                    "Offer letter",
                    "University instruction",
                    "USCIS notice",
                    "Insurance document",
                    "Tax document",
                    "Other",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.txt"
                className="sr-only"
                aria-label="Upload document file"
                onChange={upload}
              />
              <div className="document-grid">
                {w.artifacts.map((a) => (
                  <button
                    className="document-card panel"
                    key={a.id}
                    onClick={() => setDoc(a.id)}
                  >
                    <div className="document-thumb">
                      <FileText size={34} strokeWidth={1} />
                      <div className="doc-lines">
                        <i />
                        <i />
                        <i />
                      </div>
                      <span>{a.category}</span>
                    </div>
                    <div className="document-meta">
                      <strong>{a.name}</strong>
                      <span
                        className={
                          a.status === "Reviewed"
                            ? "badge green"
                            : "badge violet"
                        }
                      >
                        {a.status}
                      </span>
                      <small>
                        Version {a.version} · {fmt(a.createdAt)}
                      </small>
                    </div>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
              {!w.artifacts.length && (
                <div className="empty-state">
                  <Files size={35} />
                  <h3>Your story starts here.</h3>
                  <p>
                    Select “Use sample I-20” to experience the full flow with
                    fictional evidence.
                  </p>
                </div>
              )}
              <p className="info-note">
                Text PDFs are parsed locally. Automatic extraction recognizes
                explicit labeled fields; unfamiliar layouts and scanned PDFs
                need manual source review. No fields are guessed.
              </p>
            </>
          )}
          {page === "Timeline" && (
            <>
              <div className="toolbar">
                <div className="tabs">
                  <button className="selected">
                    {w.profile.stage} preparation
                  </button>
                  <button onClick={() => go("Settings")}>Change process</button>
                </div>
                <a className="secondary" href="/api/export?format=calendar">
                  <Download size={15} /> Export calendar
                </a>
              </div>
              <div className="notice-panel">
                <AlertTriangle size={17} />
                <p>
                  Preparation calculator · {RULE.version}. Government windows
                  are illustrative, not final filing deadlines. Confirm current
                  rules and DSO recommendation timing before acting.
                </p>
              </div>
              <div className="timeline">
                {w.events.map((e) => (
                  <button
                    key={e.id}
                    className={`timeline-row ${daysUntil(e.date) < 0 ? "past" : ""}`}
                    onClick={() => setEvent(e)}
                  >
                    <div className="timeline-date">
                      <strong>
                        {new Date(e.date + "T12:00:00").toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </strong>
                      <small>{e.date.slice(0, 4)}</small>
                    </div>
                    <span className="timeline-node" />
                    <div className="timeline-content">
                      <span className="eyebrow">{e.kind}</span>
                      <h3>{e.title}</h3>
                      <p>{e.explanation}</p>
                      <span className="badge">
                        {daysUntil(e.date) < 0
                          ? "Date passed · verify completion"
                          : "Upcoming"}{" "}
                        · {e.confidence}
                      </span>
                    </div>
                    <ArrowUpRight size={16} />
                  </button>
                ))}
              </div>
              {!w.events.length && (
                <div className="empty-state">
                  <CalendarDays size={30} />
                  <h3>Let’s put your dates in context.</h3>
                  <p>
                    Confirm the dates on your I-20 to generate an explainable
                    timeline.
                  </p>
                  <button className="primary" onClick={() => go("Documents")}>
                    Review documents
                  </button>
                </div>
              )}
              <Source />
            </>
          )}
          {page === "Inbox" && (
            <div className="two-columns">
              <section className="panel padded">
                <h2>Bring in an important message</h2>
                <p className="muted">
                  Paste university instructions. Review proposed dates before
                  they affect your timeline.
                </p>
                <form
                  onSubmit={(e) => {
                    const v = formValues(e);
                    void mutate(
                      { op: "message", ...v },
                      "Message imported. Dates remain proposed until approved.",
                    );
                    e.currentTarget.reset();
                  }}
                >
                  <label>
                    Subject
                    <input
                      name="subject"
                      required
                      maxLength={200}
                      placeholder="OPT workshop and preparation checklist"
                    />
                  </label>
                  <label>
                    Original message
                    <textarea
                      name="text"
                      rows={10}
                      required
                      maxLength={30000}
                      placeholder={
                        "From: International Student Office\nPlease complete the workshop by YYYY-MM-DD…"
                      }
                    />
                  </label>
                  <button className="primary" disabled={!!busy}>
                    Import for review <ArrowRight size={15} />
                  </button>
                </form>
                <p className="tiny muted">
                  Local date extraction recognizes YYYY-MM-DD. Ambiguous dates
                  remain in the original message for manual review. Private
                  forwarding is planned.
                </p>
              </section>
              <section>
                {w.messages.map((m) => (
                  <article className="panel padded message-card" key={m.id}>
                    <div className="section-title">
                      <span className="badge violet">{m.category}</span>
                      <span className="tiny muted">{m.status}</span>
                    </div>
                    <h3>{m.subject}</h3>
                    <p className="tiny muted">
                      {m.office} · {fmt(m.createdAt)}
                    </p>
                    <details>
                      <summary>Read original message</summary>
                      <pre>{m.text}</pre>
                    </details>
                    <h4>Proposed dates</h4>
                    {m.dates.length ? (
                      m.dates.map((d) => (
                        <p key={d} className="date-proposal">
                          <CalendarDays size={14} />
                          {fmt(d)}{" "}
                          <span className="badge">Meaning requires review</span>
                        </p>
                      ))
                    ) : (
                      <p className="muted tiny">
                        No unambiguous ISO dates found.
                      </p>
                    )}
                    {m.requirements.map((r, i) => (
                      <p key={i} className="tiny">
                        {r}
                      </p>
                    ))}
                    {m.dates.some((d) =>
                      w.facts.some(
                        (f) =>
                          f.key === "programEnd" &&
                          f.status === "confirmed" &&
                          d !== f.value,
                      ),
                    ) && (
                      <p className="info-note">
                        Message dates differ from your program end. They may
                        describe different events; review context. Confirmed
                        profile dates will not be overwritten.
                      </p>
                    )}
                    {m.status === "proposed" && (
                      <div className="inline-actions">
                        <button
                          className="primary"
                          disabled={!!busy}
                          onClick={() =>
                            mutate(
                              { op: "reviewMessage", id: m.id, approve: true },
                              "Dates approved and added to the timeline.",
                            )
                          }
                        >
                          Approve timeline additions
                        </button>
                        <button
                          className="secondary"
                          disabled={!!busy}
                          onClick={() =>
                            mutate(
                              { op: "reviewMessage", id: m.id, approve: false },
                              "Proposals rejected.",
                            )
                          }
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </article>
                ))}
              </section>
            </div>
          )}
          {page === "Requirements" && (
            <>
              <div className="notice-panel">
                <ListChecks size={18} />
                <p>
                  Student-owned preparation checklist. Institutional
                  requirements must be confirmed with your DSO. Completion
                  records preparation evidence only.
                </p>
              </div>
              {w.requirements.map((r) => (
                <form
                  className="requirement panel"
                  key={r.id}
                  onSubmit={(e) => {
                    const v = formValues(e);
                    void mutate({ op: "requirement", id: r.id, ...v });
                  }}
                >
                  <div>
                    <h3>{r.title}</h3>
                    <small className="muted">
                      Owner: student · Rule {RULE.version} · Last updated{" "}
                      {fmt(r.updatedAt)}
                    </small>
                    <p className="tiny">
                      {r.id === "workshop"
                        ? "Source: fictional Northstar university message in Inbox."
                        : "Source: preparation checklist; confirm institution-specific applicability."}
                    </p>
                    {w.messages.some((m) => m.id === r.evidence) && (
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => go("Inbox")}
                      >
                        Inspect original university instruction{" "}
                        <ArrowUpRight size={12} />
                      </button>
                    )}
                    <small className="muted">
                      {r.status === "Missing"
                        ? "Blocking reason: evidence not yet recorded."
                        : "Dependencies: current documents and DSO review."}
                    </small>
                  </div>
                  <label>
                    Status
                    <select name="status" defaultValue={r.status}>
                      {[
                        "Completed",
                        "In progress",
                        "Missing",
                        "Blocked",
                        "Waiting",
                        "Disputed",
                        "Not applicable",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Evidence or completion note
                    <input
                      name="evidence"
                      defaultValue={r.evidence}
                      maxLength={300}
                      placeholder="Document reference or review note"
                    />
                  </label>
                  <button className="secondary" disabled={!!busy}>
                    Save
                  </button>
                </form>
              ))}
              <div className="inline-actions">
                <button
                  className="primary"
                  onClick={() =>
                    draft(
                      "Please verify my preparation checklist and missing requirements.",
                    )
                  }
                >
                  Prepare a DSO question <ArrowRight size={14} />
                </button>
                <Source />
              </div>
            </>
          )}
          {page === "Ask F1Pilot" && (
            <section className="chat-area">
              <div className="chat-intro">
                <span className="large-mark">
                  <Sparkles size={30} strokeWidth={1} />
                </span>
                <h2>A little context goes a long way.</h2>
                <p>
                  Ask about your confirmed facts, timeline, or preparation
                  checklist.
                </p>
                <span className="badge">
                  Local evidence assistant · no language model connected
                </span>
              </div>
              <div className="suggestions">
                {[
                  "What dates are on my confirmed I-20?",
                  "What should I prepare for OPT?",
                  "How do I prepare for a CPT conversation?",
                ].map((q) => (
                  <button key={q} onClick={() => setQuestion(q)}>
                    {q}
                    <ArrowUpRight size={13} />
                  </button>
                ))}
              </div>
              {w.chats.map((c) => (
                <div className="chat-exchange" key={c.id}>
                  <div className="chat-question">{c.question}</div>
                  <article className="chat-answer panel">
                    <span className="eyebrow">
                      <Sparkles size={13} /> F1PILOT · GROUNDED IN YOUR EVIDENCE
                    </span>
                    <pre>{c.answer}</pre>
                    <Source />
                  </article>
                </div>
              ))}
            </section>
          )}
          {page === "Evidence Map" && (
            <>
              <div className="evidence-map panel">
                <svg
                  viewBox="0 0 900 390"
                  role="img"
                  aria-label={`${w.artifacts.length} documents connected to ${confirmedCount} confirmed facts, ${w.events.length} timeline events and ${w.actions.length} decisions`}
                >
                  <defs>
                    <radialGradient id="mapGlow">
                      <stop stopColor="#9665e2" stopOpacity=".15" />
                      <stop offset="1" stopColor="#9665e2" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                  <ellipse
                    cx="450"
                    cy="200"
                    rx="320"
                    ry="180"
                    fill="url(#mapGlow)"
                  />
                  {w.artifacts.slice(0, 8).map((a, i) => {
                    const y = 50 + i * 40;
                    return (
                      <g key={a.id}>
                        <path
                          d={`M180 ${y} Q330 ${y} 450 190`}
                          className="graph-line"
                        />
                        <circle cx="180" cy={y} r="5" className="graph-doc" />
                        <text x="15" y={y + 4}>
                          {a.name.slice(0, 21)}
                        </text>
                      </g>
                    );
                  })}
                  {w.events.slice(0, 7).map((e, i) => {
                    const y = 60 + i * 43;
                    return (
                      <g key={e.id}>
                        <path
                          d={`M450 190 Q600 ${y} 700 ${y}`}
                          className="graph-line"
                        />
                        <circle cx="700" cy={y} r="4" className="graph-event" />
                        <text x="715" y={y + 4}>
                          {e.title.slice(0, 23)}
                        </text>
                      </g>
                    );
                  })}
                  <circle cx="450" cy="190" r="37" className="graph-core" />
                  <text
                    x="450"
                    y="186"
                    textAnchor="middle"
                    className="core-number"
                  >
                    {confirmedCount}
                  </text>
                  <text x="450" y="203" textAnchor="middle">
                    confirmed facts
                  </text>
                  <text x="450" y="270" textAnchor="middle">
                    {RULE.version} · source rules
                  </text>
                  <text x="450" y="295" textAnchor="middle">
                    {w.actions.length} action decisions
                  </text>
                </svg>
              </div>
              <div className="section-title">
                <h2>Inspect the connections</h2>
                <span className="muted tiny">
                  Only stored evidence appears here
                </span>
              </div>
              <div className="document-grid">
                {w.facts
                  .filter((f) => f.status === "confirmed")
                  .map((f) => (
                    <button
                      className="panel connection-item"
                      key={f.id}
                      onClick={() => {
                        setDoc(f.artifactId);
                      }}
                    >
                      <FileText size={18} />
                      <span>
                        <strong>{labels[f.key]}</strong>
                        <small>{f.value}</small>
                        <small>
                          Source page {f.page}, line {f.line} →{" "}
                          {
                            w.events.filter((e) => e.factIds.includes(f.id))
                              .length
                          }{" "}
                          events
                        </small>
                      </span>
                      <ArrowUpRight size={14} />
                    </button>
                  ))}
              </div>
              <Source />
            </>
          )}
          {page === "Employment" && (
            <div className="two-columns">
              <section className="panel padded">
                <span className="eyebrow">PREPARATION WORKSPACE</span>
                <h2>Your offer, in context.</h2>
                <form
                  onSubmit={(e) => {
                    void mutate(
                      { op: "employment", ...formValues(e) },
                      "Employment details saved. Date comparisons recalculated.",
                    );
                  }}
                >
                  <label>
                    Employer
                    <input
                      name="employer"
                      defaultValue={w.employment.employer}
                    />
                  </label>
                  <label>
                    Job title
                    <input name="title" defaultValue={w.employment.title} />
                  </label>
                  <div className="form-grid">
                    <label>
                      Requested start date
                      <input
                        type="date"
                        name="start"
                        defaultValue={w.employment.start}
                      />
                    </label>
                    <label>
                      Weekly hours
                      <input
                        type="number"
                        min="0"
                        max="168"
                        name="hours"
                        defaultValue={w.employment.hours}
                      />
                    </label>
                  </div>
                  <label>
                    Degree-relevance evidence
                    <textarea
                      name="relevance"
                      rows={5}
                      defaultValue={w.employment.relevance}
                      placeholder="Connect duties to coursework; save supporting evidence."
                    />
                  </label>
                  <button className="primary" disabled={!!busy}>
                    Save preparation details
                  </button>
                </form>
              </section>
              <section className="panel padded">
                <Briefcase size={24} />
                <h2>Bring better questions.</h2>
                <p className="muted">
                  Does the role relate to your degree? Which documents does your
                  DSO need? Do the requested dates match your plan?
                </p>
                {cards
                  .filter((c) => c.id === "offer-conflict")
                  .map((c) => (
                    <div className="notice-panel" key={c.id}>
                      <AlertTriangle size={18} />
                      <p>{c.why}</p>
                    </div>
                  ))}
                <button
                  className="secondary"
                  onClick={() =>
                    draft(
                      "Please review my offer dates and degree-relevance evidence.",
                    )
                  }
                >
                  Prepare employer / DSO questions
                </button>
                <button className="text-button" onClick={() => go("Documents")}>
                  Add an offer letter <ArrowUpRight size={14} />
                </button>
                <Source />
                <p className="tiny muted">
                  CPT history, STEM reporting automation, and employer
                  integrations are future modules. This workspace does not
                  determine employment authorization.
                </p>
              </section>
            </div>
          )}
          {page === "Travel" && (
            <div className="two-columns">
              <section className="panel padded">
                <h2>A place for your travel details.</h2>
                <form
                  onSubmit={(e) => {
                    void mutate({ op: "travel", ...formValues(e) });
                  }}
                >
                  <div className="form-grid">
                    {[
                      ["passportExpiry", "Passport expiration"],
                      ["visaExpiry", "Visa expiration"],
                      ["signatureDate", "Travel signature date"],
                      ["departure", "Planned departure"],
                    ].map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <input
                          type="date"
                          name={key}
                          defaultValue={w.travel[key as keyof typeof w.travel]}
                        />
                      </label>
                    ))}
                  </div>
                  <label>
                    Itinerary and DSO questions
                    <textarea
                      name="notes"
                      rows={6}
                      defaultValue={w.travel.notes}
                    />
                  </label>
                  <button className="primary" disabled={!!busy}>
                    Save travel preparation
                  </button>
                </form>
              </section>
              <section className="panel padded">
                <Plane size={25} />
                <h2>Before you go.</h2>
                <p className="muted">
                  Review your current I-20, passport, visa, itinerary, and any
                  employment evidence with your DSO.
                </p>
                {["passportExpiry", "visaExpiry"].map((key) => {
                  const d = w.travel[key as keyof typeof w.travel];
                  return d && w.travel.departure && d <= w.travel.departure ? (
                    <p className="error" key={key}>
                      {key === "passportExpiry" ? "Passport" : "Visa"} date is
                      on or before departure. Ask your DSO to review.
                    </p>
                  ) : null;
                })}
                <button
                  className="secondary"
                  onClick={() =>
                    draft(
                      "What travel documents and timing should I review before departure?",
                    )
                  }
                >
                  Prepare travel questions
                </button>
                <a className="text-button" href="/api/export">
                  <Download size={14} /> Export offline evidence packet (JSON)
                </a>
                <p className="info-note">
                  Admission and visa decisions belong to government authorities.
                  This pilot does not assess admission, travel-signature
                  validity, or visa validity.
                </p>
              </section>
            </div>
          )}
          {page === "Activity" && (
            <>
              <div className="panel padded">
                <h2>Prepared actions</h2>
                {w.actions.length ? (
                  w.actions.map((a) => (
                    <div className="action-row" key={a.id}>
                      <div>
                        <strong>{a.title}</strong>
                        <small>
                          {a.result ||
                            "Draft waiting for review. Nothing sent."}
                        </small>
                      </div>
                      <span className="badge">{a.status}</span>
                      {a.status === "draft" ? (
                        <button
                          className="secondary"
                          onClick={() => setAction(a)}
                        >
                          Review draft
                        </button>
                      ) : a.status === "approved" ? (
                        <a
                          className="text-button"
                          href={`/api/export?action=${a.id}`}
                        >
                          <Download size={15} /> Download draft
                        </a>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p className="muted">No actions prepared yet.</p>
                )}
              </div>
              <h2 className="activity-heading">Your activity history</h2>
              <div className="panel padded">
                {w.activity.map((a) => (
                  <div className="activity-row" key={a.id}>
                    <span className="activity-icon">
                      <Check size={13} />
                    </span>
                    <div>
                      <strong>{a.title}</strong>
                      <small>{a.detail}</small>
                    </div>
                    <time>
                      {fmt(a.at)}
                      <br />
                      {new Date(a.at).toLocaleTimeString()}
                    </time>
                  </div>
                ))}
              </div>
            </>
          )}
          {page === "Data and Privacy" && (
            <div className="two-columns">
              <section className="panel padded">
                <ShieldCheck size={26} />
                <h2>Private by default. Yours to keep.</h2>
                <p className="muted">
                  Your workspace is stored in a private local SQLite database on
                  this server. No document contents are sent to AI, analytics,
                  or email providers.
                </p>
                <dl>
                  <dt>Stored documents</dt>
                  <dd>{w.artifacts.length}</dd>
                  <dt>Stored facts</dt>
                  <dd>{w.facts.length}</dd>
                  <dt>Activity records</dt>
                  <dd>{w.activity.length}</dd>
                  <dt>External integrations</dt>
                  <dd>None connected</dd>
                </dl>
                <a className="primary" href="/api/export">
                  <Download size={15} /> Export all my data
                </a>
                <p className="tiny muted">
                  Includes profile, original document bytes, provenance,
                  timelines, decisions, and activity in JSON.
                </p>
                <label>
                  Document retention
                  <select
                    value={w.retention}
                    onChange={(e) =>
                      mutate(
                        { op: "retention", value: e.target.value },
                        "Retention saved. The scheduled worker enforces this preference.",
                      )
                    }
                  >
                    <option value="until-deleted">Keep until I delete</option>
                    <option value="90-days">
                      Delete documents after 90 days
                    </option>
                  </select>
                </label>
                <p className="tiny muted">
                  90-day cleanup runs through the worker. Run “npm run worker”
                  or schedule it on your server.
                </p>
              </section>
              <section>
                <div className="panel padded">
                  <h2>Consent history</h2>
                  {w.consents.map((c, i) => (
                    <div className="consent-row" key={i}>
                      <Check size={14} />
                      <div>
                        <p>{c.description}</p>
                        <small className="muted">{fmt(c.at)}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="panel padded danger-zone">
                  <h2>Delete your workspace</h2>
                  <p>
                    Remove your account, documents, facts, drafts, and history
                    permanently from this local database.
                  </p>
                  <button
                    className="danger"
                    onClick={() => setDeleteTarget("account")}
                  >
                    Delete account and all data
                  </button>
                </div>
              </section>
            </div>
          )}
          {page === "Settings" && (
            <div className="two-columns">
              <section className="panel padded">
                <h2>Your student profile</h2>
                <p className="muted">
                  Profile details organize your workspace. Timeline dates still
                  require confirmed document evidence.
                </p>
                <form
                  onSubmit={(e) => {
                    void mutate(
                      { op: "profile", ...formValues(e) },
                      "Profile saved. Your process timeline has been recalculated.",
                    );
                  }}
                >
                  <label>
                    Name
                    <input
                      name="name"
                      defaultValue={w.profile.name}
                      required
                      maxLength={80}
                    />
                  </label>
                  <label>
                    Institution
                    <input
                      name="institution"
                      defaultValue={w.profile.institution}
                    />
                  </label>
                  <label>
                    Degree / major
                    <input name="degree" defaultValue={w.profile.degree} />
                  </label>
                  <label>
                    Current preparation process
                    <select name="stage" defaultValue={w.profile.stage}>
                      <option value="OPT">OPT preparation</option>
                      <option value="CPT">CPT preparation</option>
                    </select>
                  </label>
                  <label>
                    DSO email
                    <input
                      type="email"
                      name="dso"
                      defaultValue={w.profile.dso}
                    />
                  </label>
                  <button className="primary" disabled={!!busy}>
                    Save profile
                  </button>
                </form>
              </section>
              <section className="panel padded">
                <h2>Your pilot settings</h2>
                <p className="muted">
                  Extraction: deterministic local parser
                  <br />
                  Answers: local evidence retrieval
                  <br />
                  External sending: disabled
                  <br />
                  Government rules: illustrative, verification required
                </p>
                <button className="secondary" onClick={() => setTour(true)}>
                  Open guided tour <ArrowUpRight size={14} />
                </button>
                {w.demo && (
                  <>
                    <hr />
                    <h3>Start fresh with the demo</h3>
                    <p className="muted">
                      Restore the fictional Maya Chen workspace. This replaces
                      your edits in this demo.
                    </p>
                    <button
                      className="secondary"
                      onClick={() => setDeleteTarget("reset")}
                    >
                      Reset demo data
                    </button>
                  </>
                )}
                <Source />
              </section>
            </div>
          )}
          {(page === "Today" || page === "Ask F1Pilot") && (
            <form className="command-bar" onSubmit={ask}>
              <Sparkles size={19} />
              <input
                aria-label="Ask F1Pilot"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about your documents, your timeline, your next step…"
                maxLength={2000}
              />
              <span className="command-label">GROUNDED IN YOUR EVIDENCE</span>
              <button
                aria-label="Send question"
                className="send-button"
                disabled={!!busy || !question.trim()}
              >
                <ArrowRight size={18} />
              </button>
            </form>
          )}
          <footer className="workspace-footer">
            <span>
              <ShieldCheck size={12} /> Evidence first. Your decision, always.
            </span>
            <span>Preparation support · not legal advice</span>
          </footer>
        </main>
      </div>
      {activeDoc && (
        <DocumentModal
          artifact={activeDoc}
          w={w}
          busy={!!busy}
          close={() => setDoc(undefined)}
          propose={async (values) => {
            await mutate(
              { op: "proposeFact", artifactId: activeDoc.id, ...values },
              "Manual fact proposed. Review and confirm it below.",
            );
          }}
          confirm={async (id, value) => {
            await mutate(
              { op: "confirm", id, value },
              "Fact confirmed. Timeline updated with source provenance.",
            );
          }}
          remove={() => {
            setDoc(undefined);
            setDeleteTarget(activeDoc.id);
          }}
        />
      )}
      {event && (
        <Modal title={event.title} close={() => setEvent(undefined)}>
          <span className="badge violet">
            {event.kind} · {fmt(event.date)}
          </span>
          <h3>How this date was calculated</h3>
          <p>{event.explanation}</p>
          <h3>Input evidence</h3>
          {event.factIds.map((id) => {
            const f = w.facts.find((f) => f.id === id);
            return f ? (
              <button
                className="evidence-link"
                key={id}
                onClick={() => {
                  setEvent(undefined);
                  setDoc(f.artifactId);
                }}
              >
                <FileText size={15} />
                {labels[f.key]}: {f.value} · page {f.page}, line {f.line}
                <ArrowUpRight size={13} />
              </button>
            ) : null;
          })}
          {!event.factIds.length && (
            <p className="muted">
              Source:{" "}
              {w.messages.find((m) => m.id === event.source)?.subject ||
                event.source}
            </p>
          )}
          <p className="info-note">
            Assumptions: confirmed evidence is current and applies to your
            process. Conflicting or newer documents require review.{" "}
            {event.confidence}.
          </p>
          <Source />
          <button
            className="primary"
            onClick={() => {
              setEvent(undefined);
              void draft(event.title);
            }}
          >
            Prepare a question about this date
          </button>
        </Modal>
      )}
      {card && (
        <Modal title={card.title} close={() => setCard(undefined)}>
          <span className={`badge ${card.severity}`}>
            {card.type} ·{" "}
            {card.severity === "rose" ? "High priority" : "Review recommended"}
          </span>
          <h3>Why this appeared</h3>
          <p>{card.why}</p>
          {card.deadline && <p>Relevant date: {fmt(card.deadline)}</p>}
          <h3>Supporting evidence</h3>
          {card.factIds.map((id) => {
            const f = w.facts.find((f) => f.id === id);
            return f ? (
              <button
                className="evidence-link"
                key={id}
                onClick={() => {
                  setCard(undefined);
                  setDoc(f.artifactId);
                }}
              >
                {labels[f.key]}: {f.value}
                <span className="badge">{f.status}</span>
                <small>
                  Page {f.page}, line {f.line}
                </small>
              </button>
            ) : null;
          })}
          {!card.factIds.length && (
            <p className="muted">
              Based on the stored {card.destination.toLowerCase()} state.
              Inspect the workspace below.
            </p>
          )}
          <p className="tiny">Confidence: {card.confidence}</p>
          <Source />
          <h3>Recommended next step</h3>
          <p>{card.next}</p>
          <div className="inline-actions">
            <button
              className="primary"
              onClick={() => {
                go(card.destination);
                setCard(undefined);
              }}
            >
              Open {card.destination}
              <ArrowRight size={15} />
            </button>
            <button
              className="secondary"
              onClick={() => {
                void draft(card.title);
                setCard(undefined);
              }}
            >
              Prepare a DSO email
            </button>
          </div>
          <button
            className="text-button"
            onClick={() => {
              void mutate(
                { op: "dismiss", id: card.id, defer: false },
                "Card dismissed. Evidence remains in your workspace.",
              );
              setCard(undefined);
            }}
          >
            Dismiss this card
          </button>
        </Modal>
      )}
      {action && (
        <Modal
          title="A draft, ready for your decision."
          close={() => setAction(undefined)}
        >
          <p className="info-note">
            Review the exact recipient and content. Approval records your
            decision and unlocks a download. No email is sent by F1Pilot.
          </p>
          <form
            onSubmit={async (e) => {
              const v = formValues(e);
              const result = await mutate(
                { op: "decision", id: action.id, decision: "approved", ...v },
                "Draft approved locally. Download it from Activity. No email sent.",
              );
              if (result) setAction(undefined);
            }}
          >
            <label>
              Recipient
              <input
                type="email"
                name="recipient"
                defaultValue={action.recipient}
              />
            </label>
            <label>
              Email content
              <textarea
                name="body"
                rows={12}
                required
                defaultValue={action.body}
                maxLength={10000}
              />
            </label>
            <div className="inline-actions">
              <button className="primary" disabled={!!busy}>
                Approve draft for download <Check size={15} />
              </button>
              <button
                type="button"
                className="secondary"
                disabled={!!busy}
                onClick={async () => {
                  await mutate(
                    {
                      op: "decision",
                      id: action.id,
                      decision: "cancelled",
                      body: action.body,
                      recipient: action.recipient,
                    },
                    "Draft cancelled. Nothing sent.",
                  );
                  setAction(undefined);
                }}
              >
                Cancel action
              </button>
            </div>
          </form>
        </Modal>
      )}
      {tour && (
        <Modal
          title="A clearer path in four steps."
          close={() => setTour(false)}
        >
          {[
            [
              "01",
              "Bring an I-20",
              "Open Documents and choose the fictional sample or upload a text PDF.",
            ],
            [
              "02",
              "Check every important fact",
              "Compare the highlighted source with each extracted field. Correct it if needed, then confirm.",
            ],
            [
              "03",
              "Explore your timeline",
              "Open a date to inspect its inputs, source, and demonstration rule. Ask your DSO to verify.",
            ],
            [
              "04",
              "Decide what happens next",
              "Review a proactive card, prepare a DSO email, then approve a download or cancel. Check Activity for the result.",
            ],
          ].map(([n, t, p]) => (
            <div className="tour-step" key={n}>
              <span>{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            </div>
          ))}
          <button
            className="primary"
            onClick={() => {
              setTour(false);
              go("Documents");
            }}
          >
            Start with a document <ArrowRight size={15} />
          </button>
        </Modal>
      )}
      {deleteTarget && (
        <Modal
          title={
            deleteTarget === "reset"
              ? "Reset this demo?"
              : "Permanently delete this data?"
          }
          close={() => setDeleteTarget(undefined)}
        >
          <p>
            {deleteTarget === "account"
              ? "This permanently removes your entire account and all stored evidence. Export your data first if you want a copy."
              : deleteTarget === "reset"
                ? "Your demo edits will be replaced with fresh fictional sample data."
                : "This removes the original document, its extracted facts, and derived copies in timeline history, chats and drafts. The timeline will be recalculated."}
          </p>
          <div className="inline-actions">
            <button
              className="danger"
              disabled={!!busy}
              onClick={async () => {
                await mutate(
                  deleteTarget === "account"
                    ? { op: "deleteAccount", confirmation: "DELETE" }
                    : deleteTarget === "reset"
                      ? { op: "reset" }
                      : { op: "deleteDocument", id: deleteTarget },
                  deleteTarget === "reset"
                    ? "Demo reset."
                    : "Document and dependent evidence deleted.",
                );
                setDeleteTarget(undefined);
              }}
            >
              {deleteTarget === "reset" ? "Reset demo" : "Permanently delete"}
            </button>
            <button
              className="secondary"
              onClick={() => setDeleteTarget(undefined)}
            >
              Keep my data
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function DocumentModal({
  artifact: a,
  w,
  busy,
  close,
  confirm,
  propose,
  remove,
}: {
  artifact: Artifact;
  w: Workspace;
  busy: boolean;
  close: () => void;
  confirm: (id: string, value: string) => Promise<void>;
  propose: (values: Record<string, unknown>) => Promise<void>;
  remove: () => void;
}) {
  const [highlight, setHighlight] = useState<{ page: number; line: number }>();
  const fields = w.facts.filter((f) => f.artifactId === a.id);
  return (
    <Modal title={a.name} close={close}>
      <div className="document-detail-meta">
        <span className="badge violet">{a.category}</span>
        <span>
          Version {a.version} · {fmt(a.createdAt)}
        </span>
        <span className="badge">Personal · sensitive</span>
      </div>
      {a.supersedes && (
        <p className="info-note">
          Newer upload than{" "}
          {w.artifacts.find((x) => x.id === a.supersedes)?.name ||
            "previous version"}
          . Upload order does not establish which document is current.
        </p>
      )}
      <div className="document-review">
        <div className="source-preview">
          <div className="section-title">
            <h3>Source transcript</h3>
            <a
              href={`/api/documents?id=${a.id}`}
              target="_blank"
              rel="noreferrer"
            >
              Open original <ArrowUpRight size={12} />
            </a>
          </div>
          {a.text ? (
            a.text.split("\f").map((page, p) => (
              <div key={p}>
                <span className="eyebrow">PAGE {p + 1}</span>
                {page.split("\n").map((line, l) => (
                  <div
                    key={l}
                    className={
                      highlight?.page === p + 1 && highlight?.line === l + 1
                        ? "source-line highlighted"
                        : "source-line"
                    }
                  >
                    <span>{l + 1}</span>
                    <code>{line || " "}</code>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p className="muted">
              No text could be extracted. Open the original and provide a
              labeled text transcription for review. OCR is not connected.
            </p>
          )}
        </div>
        <div className="extracted-fields">
          <h3>Review extracted facts</h3>
          <p className="tiny muted">
            Each confirmation updates your timeline. Source text and earlier
            values are preserved.
          </p>
          {fields.map((f) => (
            <form
              className="fact-field"
              key={f.id}
              onSubmit={async (e) => {
                e.preventDefault();
                const v = new FormData(e.currentTarget).get("value") as string;
                await confirm(f.id, v);
              }}
            >
              <div className="section-title">
                <label htmlFor={f.id}>{labels[f.key] || f.key}</label>
                <span
                  className={
                    f.status === "confirmed" ? "badge green" : "badge violet"
                  }
                >
                  {f.status}
                </span>
              </div>
              <input
                id={f.id}
                name="value"
                defaultValue={f.value}
                key={f.value}
                disabled={f.status === "superseded"}
                required
                maxLength={300}
              />
              <div className="fact-source">
                <button
                  type="button"
                  onClick={() => setHighlight({ page: f.page, line: f.line })}
                >
                  Page {f.page} · line {f.line} <ArrowUpRight size={12} />
                </button>
                <span>
                  {f.confidence
                    ? `${Math.round(f.confidence * 100)}% heuristic parse score`
                    : "Manual entry · confidence unscored"}
                </span>
              </div>
              <blockquote>{f.quote}</blockquote>
              {f.status !== "superseded" && (
                <button className="secondary" disabled={busy}>
                  {f.status === "confirmed"
                    ? "Save correction"
                    : "Confirm fact"}
                  <Check size={13} />
                </button>
              )}
              {f.history.length > 0 && (
                <details>
                  <summary>Confirmation history ({f.history.length})</summary>
                  {f.history.map((h, i) => (
                    <p className="tiny" key={i}>
                      {h.value} · {fmt(h.at)}
                    </p>
                  ))}
                </details>
              )}
            </form>
          ))}
          {a.category === "I-20" && a.text && (
            <details>
              <summary>Add a field from the source transcript</summary>
              <p className="tiny muted">
                For unfamiliar layouts: transcribe a value, cite its exact page
                and line, then separately confirm it. Manual transcription has
                no machine confidence score.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const values = Object.fromEntries(
                    new FormData(e.currentTarget),
                  );
                  await propose({
                    ...values,
                    page: Number(values.page),
                    line: Number(values.line),
                  });
                }}
              >
                <label>
                  Field
                  <select name="key">
                    {Object.entries(labels).map(([key, label]) => (
                      <option value={key} key={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Transcribed value
                  <input name="value" required maxLength={300} />
                </label>
                <div className="form-grid">
                  <label>
                    Source page
                    <input
                      name="page"
                      type="number"
                      min="1"
                      defaultValue="1"
                      required
                    />
                  </label>
                  <label>
                    Source line
                    <input name="line" type="number" min="1" required />
                  </label>
                </div>
                <button className="secondary" disabled={busy}>
                  Propose manual fact
                </button>
              </form>
            </details>
          )}
          {!fields.length && (
            <p className="info-note">
              No supported labeled I-20 fields found. A text transcription can
              use “Program end: YYYY-MM-DD”, “Program start: YYYY-MM-DD”,
              “Institution: …”, “Student name: …”, and “Degree: …”. Keep the
              original document for comparison. Other categories are stored for
              manual review.
            </p>
          )}
        </div>
      </div>
      <div className="inline-actions">
        <a
          className="secondary"
          href={`/api/documents?id=${a.id}`}
          target="_blank"
          rel="noreferrer"
        >
          <Download size={14} /> Open / save original
        </a>
        <button className="danger" onClick={remove}>
          Delete document
        </button>
      </div>
    </Modal>
  );
}
