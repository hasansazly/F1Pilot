import { requireUser, errorResponse } from "@/lib/auth";
import { readWorkspace } from "@/lib/db";
import { RULE } from "@/lib/domain";
export async function GET(req: Request) {
  try {
    const w = readWorkspace(await requireUser());
    const params = new URL(req.url).searchParams;
    const action = params.get("action");
    if (action) {
      const a = w.actions.find((a) => a.id === action);
      if (!a || a.status !== "approved")
        return new Response("Approve the draft before export", { status: 403 });
      return new Response(
        `To: ${a.recipient}\nSubject: ${a.title}\n\n${a.body}`,
        {
          headers: {
            "Content-Type": "text/plain",
            "Content-Disposition":
              'attachment; filename="f1pilot-email-draft.txt"',
            "Cache-Control": "no-store",
          },
        },
      );
    }
    if (params.get("format") === "calendar") {
      const esc = (s: string) =>
        s
          .replace(/\\/g, "\\\\")
          .replace(/\n/g, "\\n")
          .replace(/,/g, "\\,")
          .replace(/;/g, "\\;");
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//F1Pilot//Preparation//EN",
        ...w.events.flatMap((e) => [
          "BEGIN:VEVENT",
          `UID:${e.id}@f1pilot.local`,
          `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
          `DTSTART;VALUE=DATE:${e.date.replaceAll("-", "")}`,
          `SUMMARY:${esc(e.title)}`,
          `DESCRIPTION:${esc(e.explanation + " Requires verification. Rule " + e.ruleVersion)}`,
          "END:VEVENT",
        ]),
        "END:VCALENDAR",
      ];
      return new Response(lines.join("\r\n"), {
        headers: {
          "Content-Type": "text/calendar",
          "Content-Disposition":
            'attachment; filename="f1pilot-preparation.ics"',
          "Cache-Control": "no-store",
        },
      });
    }
    return Response.json(
      { exportedAt: new Date().toISOString(), rules: RULE, workspace: w },
      {
        headers: {
          "Content-Disposition": 'attachment; filename="f1pilot-data.json"',
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
