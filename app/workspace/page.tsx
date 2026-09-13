import { redirect } from "next/navigation";
import { userId } from "@/lib/auth";
import { readWorkspace } from "@/lib/db";
import { cards } from "@/lib/domain";
import WorkspaceUI from "@/components/workspace";
export const dynamic = "force-dynamic";
export default async function Page() {
  const id = await userId();
  if (!id) redirect("/login");
  const w = readWorkspace(id);
  return <WorkspaceUI initial={w} initialCards={cards(w)} />;
}
