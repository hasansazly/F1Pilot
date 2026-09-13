import { createUser } from "../lib/db";
const email = process.env.DEMO_EMAIL || "maya@f1pilot.example";
const password = process.env.DEMO_PASSWORD || "F1Pilot-demo-2026!";
try {
  createUser(email, password, "Maya Chen", true);
  console.log(
    "Fictional demo account created. See README for local sign-in instructions.",
  );
} catch (e) {
  if (e instanceof Error && e.message.includes("UNIQUE"))
    console.log("Demo account already exists; preserved its data.");
  else throw e;
}
