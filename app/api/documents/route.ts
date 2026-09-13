import { requireUser, checkOrigin, errorResponse } from "@/lib/auth";
import { mutate, readWorkspace } from "@/lib/db";
import { addArtifact, cards } from "@/lib/domain";
export const runtime = "nodejs";
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const id = await requireUser();
    if (Number(req.headers.get("content-length") || 0) > 6 * 1024 * 1024)
      throw new Error("Maximum upload size is 5 MB");
    const form = await req.formData();
    const file = form.get("file");
    const category = String(form.get("category") || "I-20");
    if (
      ![
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
      ].includes(category)
    )
      throw new Error("Unsupported category");
    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 5 * 1024 * 1024
    )
      throw new Error("Choose a file between 1 byte and 5 MB");
    const bytes = Buffer.from(await file.arrayBuffer());
    let text = "";
    let mime = "";
    if (
      file.name.toLowerCase().endsWith(".pdf") &&
      bytes.subarray(0, 5).toString() === "%PDF-"
    ) {
      mime = "application/pdf";
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(bytes) });
      try {
        const result = await parser.getText();
        text = result.pages.map((p) => p.text).join("\f");
      } finally {
        await parser.destroy();
      }
    } else if (file.name.toLowerCase().endsWith(".txt") && !bytes.includes(0)) {
      mime = "text/plain";
      text = bytes.toString("utf8");
    } else throw new Error("Only text PDFs and UTF-8 .txt files are supported");
    if (text.length > 150000)
      throw new Error("Document text is too long (150,000 characters maximum)");
    const { w, result } = mutate(id, (w) =>
      addArtifact(
        w,
        file.name.slice(0, 150),
        text,
        category,
        mime,
        bytes.toString("base64"),
      ),
    );
    return Response.json({ workspace: w, cards: cards(w), result });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function GET(req: Request) {
  try {
    const w = readWorkspace(await requireUser());
    const a = w.artifacts.find(
      (a) => a.id === new URL(req.url).searchParams.get("id"),
    );
    if (!a) return new Response("Not found", { status: 404 });
    return new Response(
      a.blob ? new Uint8Array(Buffer.from(a.blob, "base64")) : a.text,
      {
        headers: {
          "Content-Type": a.mime,
          "Content-Disposition": `inline; filename="document.${a.mime === "application/pdf" ? "pdf" : "txt"}"`,
          "Cache-Control": "no-store",
          "Content-Security-Policy": "sandbox; default-src 'none'",
        },
      },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
