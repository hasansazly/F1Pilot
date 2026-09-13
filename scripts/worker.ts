import { db, mutate } from "../lib/db";
import { evaluate, deleteArtifact, daysUntil } from "../lib/domain";
const users = db.prepare("SELECT user_id FROM workspaces").all() as {
  user_id: string;
}[];
for (const { user_id } of users)
  mutate(user_id, (w) => {
    if (w.retention === "90-days") {
      const expired = w.artifacts
        .filter((a) => daysUntil(a.createdAt.slice(0, 10)) <= -90)
        .map((a) => a.id);
      for (const id of expired) deleteArtifact(w, id);
    }
    evaluate(w);
  });
console.log(
  `Evaluated ${users.length} workspace(s). No external actions executed.`,
);
