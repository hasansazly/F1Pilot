import { DatabaseSync } from "node:sqlite";
import { mkdirSync, chmodSync } from "node:fs";
import path from "node:path";
import {
  randomBytes,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { emptyWorkspace, seedWorkspace, type Workspace } from "./domain";
export const dataDir = path.resolve(
  /* turbopackIgnore: true */ process.env.F1PILOT_DATA_DIR || "./data",
);
mkdirSync(dataDir, { recursive: true, mode: 0o700 });
export const db = new DatabaseSync(path.join(dataDir, "f1pilot.sqlite"));
chmodSync(path.join(dataDir, "f1pilot.sqlite"), 0o600);
db.exec(`PRAGMA journal_mode = DELETE; PRAGMA foreign_keys = ON; PRAGMA secure_delete = ON;
CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS workspaces(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS login_attempts(key TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL);
INSERT OR IGNORE INTO migrations VALUES(1,datetime('now'));`);
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return salt + ":" + scryptSync(password, salt, 64).toString("hex");
}
export function verifyPassword(password: string, hash: string) {
  const [salt, value] = hash.split(":");
  return timingSafeEqual(
    Buffer.from(value, "hex"),
    scryptSync(password, salt, 64),
  );
}
export function createUser(
  email: string,
  password: string,
  name: string,
  demo = false,
) {
  const id = crypto.randomUUID();
  const w = demo ? seedWorkspace() : emptyWorkspace(name);
  db.exec("BEGIN IMMEDIATE");
  try {
    db.prepare("INSERT INTO users VALUES(?,?,?,?)").run(
      id,
      email,
      hashPassword(password),
      new Date().toISOString(),
    );
    db.prepare("INSERT INTO workspaces VALUES(?,?)").run(id, JSON.stringify(w));
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  return id;
}
export function readWorkspace(id: string): Workspace {
  const row = db
    .prepare("SELECT state FROM workspaces WHERE user_id=?")
    .get(id) as { state: string } | undefined;
  if (!row) throw new Error("Workspace not found");
  return JSON.parse(row.state);
}
export function mutate<T>(id: string, fn: (w: Workspace) => T) {
  db.exec("BEGIN IMMEDIATE");
  try {
    const w = readWorkspace(id);
    const result = fn(w);
    w.revision++;
    db.prepare("UPDATE workspaces SET state=? WHERE user_id=?").run(
      JSON.stringify(w),
      id,
    );
    db.exec("COMMIT");
    return { w, result };
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
export function createSession(id: string) {
  const token = randomBytes(32).toString("hex");
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(Date.now());
  db.prepare("INSERT INTO sessions VALUES(?,?,?)").run(
    createHash("sha256").update(token).digest("hex"),
    id,
    Date.now() + 7 * 86400000,
  );
  return token;
}
export function sessionUser(token: string) {
  return (
    db
      .prepare(
        "SELECT user_id FROM sessions WHERE token_hash=? AND expires_at>?",
      )
      .get(createHash("sha256").update(token).digest("hex"), Date.now()) as
      { user_id: string } | undefined
  )?.user_id;
}
export function revoke(token: string) {
  db.prepare("DELETE FROM sessions WHERE token_hash=?").run(
    createHash("sha256").update(token).digest("hex"),
  );
}
export function throttle(key: string) {
  db.prepare("DELETE FROM login_attempts WHERE reset_at < ?").run(Date.now());
  const row = db
    .prepare("SELECT count,reset_at FROM login_attempts WHERE key=?")
    .get(key) as { count: number; reset_at: number } | undefined;
  if (row && row.reset_at > Date.now() && row.count >= 20)
    throw new Error("Too many attempts. Try again in 15 minutes.");
  db.prepare(
    "INSERT INTO login_attempts VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET count=excluded.count,reset_at=excluded.reset_at",
  ).run(
    key,
    row && row.reset_at > Date.now() ? row.count + 1 : 1,
    row && row.reset_at > Date.now() ? row.reset_at : Date.now() + 900000,
  );
}
