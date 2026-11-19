import StudentShell from "../StudentShell";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";
import Student from "@/models/student";
import { getCurrentUser } from "@/lib/auth";
import { normalizeClassName } from "@/lib/class-matching";
import MaterialsCatalog from "./MaterialsCatalog";

export const dynamic = "force-dynamic";

export default async function StudentMaterialPage() {
  await connectDB();
  const user = await getCurrentUser();
  const student = user
    ? await Student.findOne({ userId: user.id }).select("className").lean()
      ?? await Student.findOne({ name: user.name }).select("className").lean()
    : null;
  const [allMaterials, generalMaterials] = await Promise.all([
    student ? Material.find().sort({ createdAt: -1 }).lean() : Promise.resolve([]),
    Material.find({ kelas: "General" }).sort({ createdAt: -1 }).lean(),
  ]);
  const materials = student
    ? allMaterials.filter((item) => normalizeClassName(item.kelas) === normalizeClassName(student.className) || item.kelas === "General")
    : generalMaterials;

  return (
    <StudentShell active="materi">
      <MaterialsCatalog materials={materials.map((item) => ({ ...item, _id: String(item._id), createdAt: new Date(item.createdAt).toISOString() }))} />
    </StudentShell>
  );
}