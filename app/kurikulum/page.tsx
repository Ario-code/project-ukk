import CurriculumRoute from "./CurriculumRoute";

export const dynamic = "force-dynamic";

export default async function CurriculumPage() {
  return <CurriculumRoute section="dashboard" />;
}
