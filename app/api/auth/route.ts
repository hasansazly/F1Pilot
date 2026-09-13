import { cookies } from "next/headers";
import { z } from "zod";
import {
  createUser,
  createSession,
  db,
  verifyPassword,
  revoke,
  throttle,
} from "@/lib/db";
import { checkOrigin, errorResponse } from "@/lib/auth";
const schema = z.object({
  mode: z.enum(["signin", "signup", "demo", "signout"]),
  email: z.email().max(254).optional(),
  password: z.string().min(10).max(128).optional(),
  name: z.string().min(1).max(80).optional(),
  consent: z.boolean().optional(),
});
export async function POST(req: Request) {
  try {
    checkOrigin(req);
    const b = schema.parse(await req.json());
    const jar = await cookies();
    if (b.mode === "signout") {
      const token = jar.get("f1pilot-session")?.value;
      if (token) revoke(token);
      jar.delete("f1pilot-session");
      return Response.json({ ok: true });
    }
    throttle(b.email?.toLowerCase() || "demo");
    let id: string;
    if (b.mode === "demo") {
      id = createUser(
        `demo-${crypto.randomUUID()}@f1pilot.example`,
        crypto.randomUUID(),
        "Maya",
        true,
      );
    } else {
      if (!b.email || !b.password)
        throw new Error("Email and password required");
      const email = b.email.toLowerCase();
      if (b.mode === "signup") {
        if (!b.consent)
          throw new Error(
            "Please review and accept the privacy and preparation boundaries",
          );
        id = createUser(email, b.password, b.name || "Student");
      } else {
        const u = db
          .prepare("SELECT id,password FROM users WHERE email=?")
          .get(email) as { id: string; password: string } | undefined;
        if (!u || !verifyPassword(b.password, u.password))
          throw new Error("Email or password is incorrect");
        id = u.id;
      }
    }
    const previous = jar.get("f1pilot-session")?.value;
    if (previous) revoke(previous);
    jar.set("f1pilot-session", createSession(id), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.COOKIE_SECURE === "true",
      path: "/",
      maxAge: 604800,
    });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
