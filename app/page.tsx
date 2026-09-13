import Brand from "@/components/brand";
import {
  ArrowUpRight,
  ArrowRight,
  FileText,
  Check,
  ShieldCheck,
  Workflow,
  CalendarDays,
  Sparkles,
} from "lucide-react";
export default function Home() {
  return (
    <main className="landing">
      <nav>
        <Brand />
        <div>
          <a href="#how">How it works</a>
          <a href="#privacy">Your privacy</a>
          <a href="/login" className="nav-cta">
            Open F1Pilot <ArrowUpRight size={15} />
          </a>
        </div>
      </nav>
      <section className="hero">
        <div className="hero-glow" />
        <span className="pill">
          <span className="status-dot" /> A calmer way to prepare for CPT & OPT
        </span>
        <h1>
          Your next chapter.
          <br />
          <em>Already in view.</em>
        </h1>
        <p>
          Your international student life, understood.
          <br />
          Turn documents and university instructions into a verified plan.
          <br className="desktop" /> Know what needs your attention, before it
          becomes urgent.
        </p>
        <div className="hero-actions">
          <a className="primary" href="/login">
            Find your way forward <ArrowRight size={16} />
          </a>
          <a href="#preview" className="text-button">
            Take a closer look <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="hero-note">
          <ShieldCheck size={13} /> Your evidence. Your decisions. Always.
        </div>
      </section>
      <section id="preview" className="product-preview">
        <div className="preview-bar">
          <Brand />
          <span>
            <span className="status-dot" /> FICTIONAL PRODUCT PREVIEW
          </span>
          <span className="avatar">MC</span>
        </div>
        <div className="preview-content">
          <span className="eyebrow">YOUR DAY, A LITTLE CLEARER</span>
          <h2>
            Good morning, Maya<span className="violet">.</span>
          </h2>
          <p className="muted">
            A few things to move your next chapter forward.
          </p>
          <div className="preview-cards">
            <article className="intel-card amber">
              <span className="eyebrow">UPCOMING · UNIVERSITY INSTRUCTION</span>
              <h3>
                A little preparation.
                <br />A lot less uncertainty.
              </h3>
              <p>
                Your university’s OPT workshop is coming up. Bring your I-20 and
                degree completion checklist.
              </p>
              <div className="evidence-chip">
                <FileText size={12} /> Fictional university email
              </div>
              <a href="/login">
                Review the evidence <ArrowRight size={14} />
              </a>
            </article>
            <article className="intel-card violet">
              <span className="eyebrow">YOUR CONFIRMATION NEEDED</span>
              <h3>
                Your documents.
                <br />
                One connected story.
              </h3>
              <p>
                A new I-20 contains a different program end date. Your confirmed
                timeline stays as it is until you review it.
              </p>
              <div className="evidence-chip">
                <Workflow size={12} /> 2 connected sources
              </div>
              <a href="/login">
                Compare the sources <ArrowRight size={14} />
              </a>
            </article>
            <article className="intel-card blue">
              <span className="eyebrow">PREPARED FOR YOUR REVIEW</span>
              <h3>
                The next step,
                <br />
                already drafted.
              </h3>
              <p>
                A question for your DSO, grounded in your confirmed dates. Read
                it, make it yours, and decide what happens next.
              </p>
              <div className="evidence-chip">
                <ShieldCheck size={12} /> Nothing sent without you
              </div>
              <a href="/login">
                Explore the demo <ArrowRight size={14} />
              </a>
            </article>
          </div>
          <div className="preview-command">
            <Sparkles size={18} />
            <span>What should I prepare for my OPT conversation?</span>
            <ArrowUpRight size={18} />
          </div>
        </div>
      </section>
      <section id="how" className="landing-section">
        <span className="eyebrow">FROM SCATTERED TO CONNECTED</span>
        <h2>
          One document.
          <br />
          <em>A clearer path ahead.</em>
        </h2>
        <div className="how-grid">
          {[
            {
              icon: FileText,
              n: "01",
              title: "Bring your evidence.",
              text: "Upload a text PDF or sample I-20. Paste an important university email. Keep the original close to every extracted fact.",
            },
            {
              icon: Check,
              n: "02",
              title: "Make it your truth.",
              text: "Review the source, correct a field, confirm a date. Your information only becomes part of your plan with your say-so.",
            },
            {
              icon: CalendarDays,
              n: "03",
              title: "See your next move.",
              text: "Get an explainable preparation timeline, spot missing evidence, and review useful drafts. You stay in charge.",
            },
          ].map((x) => (
            <article key={x.n}>
              <div className="how-top">
                <x.icon size={24} />
                <span>{x.n}</span>
              </div>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="privacy" className="landing-section privacy-feature">
        <div>
          <span className="eyebrow">A WORKSPACE THAT RESPECTS YOU</span>
          <h2>
            Everything connected.
            <br />
            <em>Nothing taken for granted.</em>
          </h2>
          <p>
            See exactly where a fact came from. Inspect the rule behind a date.
            Export your evidence or permanently delete your workspace.
          </p>
          <p>
            Local deterministic processing is available without an AI
            subscription. Documents stay on the server you run; no external AI
            or email service is connected.
          </p>
          <a className="text-button" href="/login">
            Explore your private workspace <ArrowUpRight size={16} />
          </a>
        </div>
        <div
          className="landing-graph"
          role="img"
          aria-label="Evidence connects documents to confirmed facts, rules and your preparation plan"
        >
          <svg viewBox="0 0 440 330" aria-hidden="true">
            <path d="M70 90L220 165L360 70M220 165L345 265M220 165L100 270M220 165L200 35" />
            <circle cx="70" cy="90" r="5" />
            <circle cx="360" cy="70" r="5" />
            <circle cx="345" cy="265" r="5" />
            <circle cx="100" cy="270" r="5" />
            <circle cx="200" cy="35" r="4" />
            <circle className="center" cx="220" cy="165" r="12" />
            <text x="30" y="70">
              DOCUMENTS
            </text>
            <text x="280" y="48">
              CONFIRMED FACTS
            </text>
            <text x="280" y="295">
              YOUR TIMELINE
            </text>
            <text x="45" y="300">
              SOURCE RULES
            </text>
            <text x="182" y="204">
              YOUR STORY
            </text>
          </svg>
        </div>
      </section>
      <section className="faq landing-section">
        <span className="eyebrow">BEFORE YOU BEGIN</span>
        <h2>A few good questions.</h2>
        {[
          [
            "Is F1Pilot an immigration lawyer?",
            "No. F1Pilot organizes evidence and prepares workflows. It cannot determine eligibility, employment authorization, admission, or approval. Your DSO and qualified professionals remain essential.",
          ],
          [
            "What works in this pilot?",
            "I-20 review, confirmed facts, illustrative CPT/OPT preparation timelines, pasted university messages, proactive cards, grounded local answers, email draft approvals, calendar export, and private data controls.",
          ],
          [
            "Are the dates legal deadlines?",
            "The calculator is a clearly labeled demonstration using configurable offsets. Confirm all government dates, rule applicability, and university instructions with your DSO before acting.",
          ],
          [
            "Can F1Pilot send emails for me?",
            "This pilot prepares editable drafts and records your approval. You can download an approved draft and send it yourself. No email is sent automatically.",
          ],
          [
            "Can I try it without personal documents?",
            "Yes. Explore an isolated demo with a fictional student, university, I-20, email, and offer letter. You can reset or delete the demo at any time.",
          ],
        ].map(([q, a]) => (
          <details key={q}>
            <summary>
              {q}
              <span>+</span>
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </section>
      <section className="closing">
        <span className="eyebrow">YOUR FUTURE DESERVES SOME CLARITY</span>
        <h2>
          Less keeping track.
          <br />
          <em>More looking forward.</em>
        </h2>
        <a className="primary" href="/login">
          Start your F1Pilot journey <ArrowRight size={16} />
        </a>
      </section>
      <footer>
        <Brand />
        <span>Independent preparation tool. No government affiliation.</span>
        <span>Built around your next chapter.</span>
      </footer>
    </main>
  );
}
