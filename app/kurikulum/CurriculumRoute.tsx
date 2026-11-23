import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CurriculumDashboard, { type CurriculumSection } from "./CurriculumDashboard";

export default async function CurriculumRoute({ section }: { section: CurriculumSection }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "wakakurikulum") {
    redirect(user.role === "admin" ? "/admin" : user.role === "guru" ? "/guru" : user.role === "kepsek" ? "/kepsek" : "/student");
  }
  return <CurriculumDashboard userName={user.name} section={section} />;
}
