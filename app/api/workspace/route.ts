import { z } from "zod";
import { checkOrigin, requireUser, errorResponse } from "@/lib/auth";
import { mutate, readWorkspace, db } from "@/lib/db";
import {
  addArtifact,
  sampleI20,
  confirmFact,
  recalculate,
  importMessage,
  evaluate,
  cards,
  prepare,
  decide,
  answer,
  uid,
  now,
  log,
  seedWorkspace,
  deleteArtifact,
  dateValid,
} from "@/lib/domain";
import { cookies } from "next/headers";
const short = z.string().max(300);
const date = z
  .string()
  .refine((v) => v === "" || dateValid(v), "Use a valid YYYY-MM-DD date");
const schema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("sample") }),
  z.object({ op: z.literal("run") }),
  z.object({ op: z.literal("reset") }),
  z.object({
    op: z.literal("deleteAccount"),
    confirmation: z.literal("DELETE"),
  }),
  z.object({ op: z.literal("confirm"), id: short, value: short }),
  z.object({
    op: z.literal("proposeFact"),
    artifactId: short,
    key: z.enum([
      "name",
      "institution",
      "degree",
      "programStart",
      "programEnd",
      "recommendationDate",
    ]),
    value: z.string().min(1).max(300),
    page: z.number().int().positive(),
    line: z.number().int().positive(),
  }),
  z.object({ op: z.literal("deleteDocument"), id: short }),
  z.object({ op: z.literal("dismiss"), id: short, defer: z.boolean() }),
  z.object({
    op: z.literal("message"),
    subject: z.string().min(1).max(200),
    text: z.string().min(1).max(30000),
  }),
  z.object({ op: z.literal("reviewMessage"), id: short, approve: z.boolean() }),
  z.object({ op: z.literal("prepare"), topic: z.string().min(1).max(500) }),
  z.object({
    op: z.literal("decision"),
    id: short,
    decision: z.enum(["approved", "cancelled"]),
    body: z.string().min(1).max(10000),
    recipient: z.union([z.email(), z.literal("")]),
  }),
  z.object({ op: z.literal("ask"), question: z.string().min(1).max(2000) }),
  z.object({
    op: z.literal("requirement"),
    id: short,
    status: z.enum([
      "Completed",
      "In progress",
      "Missing",
      "Blocked",
      "Waiting",
      "Disputed",
      "Not applicable",
    ]),
    evidence: short,
  }),
  z.object({
    op: z.literal("profile"),
    name: z.string().min(1).max(80),
    institution: short,
    degree: short,
    stage: z.enum(["OPT", "CPT"]),
    dso: z.union([z.email(), z.literal("")]),
  }),
  z.object({
    op: z.literal("employment"),
    employer: short,
    title: short,
    start: date,
    hours: z.string().refine((v) => v === "" || (/^\d+$/.test(v) && +v <= 168)),
    relevance: z.string().max(5000),
  }),
  z.object({
    op: z.literal("travel"),
    passportExpiry: date,
    visaExpiry: date,
    signatureDate: date,
    departure: date,
    notes: z.string().max(5000),
  }),
  z.object({
    op: z.literal("retention"),
    value: z.enum(["until-deleted", "90-days"]),
  }),
]);
export async function GET() {
  try {
    const w = readWorkspace(await requireUser());
    return Response.json(
      { workspace: w, cards: cards(w) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const id = await requireUser();
    const b = schema.parse(await req.json());
    if (b.op === "deleteAccount") {
      db.prepare(
        "DELETE FROM login_attempts WHERE key IN (SELECT email FROM users WHERE id=?)",
      ).run(id);
      db.prepare("DELETE FROM users WHERE id=?").run(id);
      db.exec("VACUUM");
      (await cookies()).delete("f1pilot-session");
      return Response.json({ deleted: true });
    }
    const { w, result } = mutate(id, (w) => {
      switch (b.op) {
        case "sample":
          return addArtifact(w, "Sample_I-20.txt", sampleI20());
        case "run":
          return evaluate(w);
        case "reset":
          if (!w.demo) throw new Error("Only demo workspaces can be reset");
          Object.assign(w, seedWorkspace());
          return;
        case "confirm":
          return confirmFact(w, b.id, b.value);
        case "proposeFact": {
          const artifact = w.artifacts.find((a) => a.id === b.artifactId);
          if (!artifact || artifact.category !== "I-20")
            throw new Error("I-20 not found");
          const quote = artifact.text.split("\f")[b.page - 1]?.split("\n")[
            b.line - 1
          ];
          if (!quote?.trim())
            throw new Error(
              "Choose a nonempty source page and line from the transcript",
            );
          if (
            (b.key.startsWith("program") || b.key === "recommendationDate") &&
            !dateValid(b.value)
          )
            throw new Error("Use a valid YYYY-MM-DD date");
          w.facts.push({
            id: uid(),
            key: b.key,
            value: b.value,
            originalValue: b.value,
            artifactId: b.artifactId,
            page: b.page,
            line: b.line,
            quote,
            confidence: 0,
            status: "proposed",
            createdAt: now(),
            effectiveDate: now().slice(0, 10),
            sensitivity: "personal",
            history: [],
          });
          artifact.status = "Awaiting confirmation";
          log(
            w,
            "Manual fact proposed",
            "Student transcribed a field from a selected source line. Separate confirmation required.",
          );
          return true;
        }
        case "deleteDocument":
          return deleteArtifact(w, b.id);
        case "dismiss":
          w.dismissed[b.id] = b.defer
            ? new Date(Date.now() + 86400000).toISOString().slice(0, 10)
            : "9999-12-31";
          log(
            w,
            b.defer ? "Card deferred for one day" : "Card dismissed",
            "Evidence and requirements remain available.",
          );
          return;
        case "message":
          return importMessage(w, b.subject, b.text);
        case "reviewMessage": {
          const m = w.messages.find((m) => m.id === b.id);
          if (!m || m.status !== "proposed")
            throw new Error("Pending message not found");
          m.status = b.approve ? "approved" : "rejected";
          log(w, "Message decision recorded", m.status);
          recalculate(w);
          return;
        }
        case "prepare":
          return prepare(w, b.topic);
        case "decision": {
          const a = w.actions.find((a) => a.id === b.id);
          if (!a || a.status !== "draft")
            throw new Error("Pending draft not found");
          a.body = b.body;
          a.recipient = b.recipient;
          return decide(w, b.id, b.decision);
        }
        case "ask": {
          const a = answer(w, b.question);
          w.chats.push({
            id: uid(),
            question: b.question,
            answer: a,
            at: now(),
          });
          log(
            w,
            "Evidence answer prepared",
            "Confirmed facts and source references retrieved locally.",
          );
          return a;
        }
        case "requirement": {
          const r = w.requirements.find((r) => r.id === b.id);
          if (!r) throw new Error("Requirement not found");
          if (b.status === "Completed" && !b.evidence.trim())
            throw new Error("Add evidence or a completion note");
          Object.assign(r, {
            status: b.status,
            evidence: b.evidence,
            updatedAt: now(),
          });
          log(w, "Requirement updated", b.status);
          return;
        }
        case "profile": {
          const { op: _, ...profile } = b;
          void _;
          w.profile = profile;
          log(
            w,
            "Profile updated",
            "Explicit student edit; confirmed document facts retained separately.",
          );
          recalculate(w);
          return;
        }
        case "employment": {
          const { op: _, ...employment } = b;
          void _;
          w.employment = employment;
          log(
            w,
            "Employment preparation updated",
            "User-entered details; no authorization determination.",
          );
          recalculate(w);
          return;
        }
        case "travel": {
          const { op: _, ...travel } = b;
          void _;
          w.travel = travel;
          log(w, "Travel preparation updated");
          recalculate(w);
          return;
        }
        case "retention":
          w.retention = b.value;
          w.consents.push({
            at: now(),
            description: `Retention set to ${b.value}`,
          });
          log(w, "Retention preference saved");
          return;
      }
    });
    return Response.json({ workspace: w, cards: cards(w), result });
  } catch (e) {
    return errorResponse(e);
  }
}
