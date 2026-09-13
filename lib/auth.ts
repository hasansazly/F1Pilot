import { cookies } from "next/headers";
import { sessionUser } from "./db";
export async function userId() {
  const token = (await cookies()).get("f1pilot-session")?.value;
  return token ? sessionUser(token) : undefined;
}
export async function requireUser() {
  const id = await userId();
  if (!id) throw new Error("Unauthorized");
  return id;
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected =
    process.env.APP_ORIGIN ||
    `${new URL(request.url).protocol}//${request.headers.get("host") || new URL(request.url).host}`;
  if (!origin || origin !== expected) throw new Error("Invalid request origin");
}
export function errorResponse(e: unknown) {
  const message = e instanceof Error ? e.message : "Request failed";
  return Response.json(
    {
      error: message.includes("UNIQUE")
        ? "An account already exists with that email."
        : message,
    },
    { status: message === "Unauthorized" ? 401 : 400 },
  );
}
