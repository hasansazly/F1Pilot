"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    await auth({
      mode,
      email: f.get("email"),
      password: f.get("password"),
      name: f.get("name") || undefined,
      consent: f.get("consent") === "on",
    });
  }
  async function auth(body: unknown) {
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      router.push("/workspace");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <div className="auth-card panel">
      <span className="eyebrow">YOUR PRIVATE WORKSPACE</span>
      <h1>
        {mode === "signin" ? "Welcome back." : "A little more peace of mind."}
      </h1>
      <p className="muted">Your next chapter starts with a clearer picture.</p>
      <div className="tabs">
        <button
          onClick={() => setMode("signin")}
          className={mode === "signin" ? "selected" : ""}
        >
          Sign in
        </button>
        <button
          onClick={() => setMode("signup")}
          className={mode === "signup" ? "selected" : ""}
        >
          Create account
        </button>
      </div>
      <form onSubmit={submit}>
        {mode === "signup" && (
          <label>
            Your name
            <input name="name" required autoComplete="name" maxLength={80} />
          </label>
        )}
        <label>
          Email address
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            minLength={10}
            maxLength={128}
            required
            autoComplete={
              mode === "signup" ? "new-password" : "current-password"
            }
            placeholder="At least 10 characters"
          />
        </label>
        {mode === "signup" && (
          <label className="check-label">
            <input name="consent" type="checkbox" required />I agree to private
            server storage and understand F1Pilot offers preparation, not legal
            advice. I can export or delete my data.
          </label>
        )}
        <button className="primary wide" disabled={busy}>
          {mode === "signin" ? "Sign in" : "Create my workspace"}
          <ArrowRight size={16} />
        </button>
      </form>
      <div className="divider-label">or explore first</div>
      <button
        className="secondary wide"
        disabled={busy}
        onClick={() => auth({ mode: "demo" })}
      >
        Explore fictional demo <ArrowRight size={16} />
      </button>
      <p className="tiny muted">
        <ShieldCheck size={13} /> Every demo gets an isolated workspace. No AI
        key needed.
      </p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
