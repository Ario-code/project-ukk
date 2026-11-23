import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, ClipboardList, GraduationCap, LayoutDashboard, School, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/teacher";
import Student from "@/models/student";
import SchoolClass from "@/models/schoolClass";
import Material from "@/models/material";
import Assessment from "@/models/assessment";
import LogoutButton from "./LogoutButton";

export const dynamic = "force-dynamic";

export default async function KepsekDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role !== "kepsek") redirect(user.role === "admin" ? "/admin" : user.role === "guru" ? "/guru" : "/student");

  await connectDB();
  const [teachers, students, classes, materials, assessments, latestMaterials, latestAssessments, teacherRecords, classRecords] = await Promise.all([
    Teacher.countDocuments(),
    Student.countDocuments(),
    SchoolClass.countDocuments(),
    Material.countDocuments(),
    Assessment.countDocuments(),
    Material.find().sort({ createdAt: -1 }).limit(5).select("title subject kelas createdAt").lean(),
    Assessment.find().sort({ createdAt: -1 }).limit(5).select("title subject kelas type deadline createdAt").lean(),
    Teacher.find().sort({ name: 1 }).select("name subject major classes status").lean(),
    SchoolClass.find().sort({ grade: 1, major: 1 }).select("name grade major homeroomTeacher studentCount room").lean(),
  ]);
  const stats = [
    { label: "Total guru", value: teachers, icon: BookOpen },
    { label: "Total murid", value: students, icon: GraduationCap },
    { label: "Total kelas", value: classes, icon: School },
    { label: "Materi tersedia", value: materials, icon: ClipboardList },
    { label: "Total asesmen", value: assessments, icon: Users },
  ];

  return (
    <main className="min-h-screen bg-[#ebedf1] text-[#353536]">
      <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="group flex w-full shrink-0 flex-col border-b border-[#d4d8df] bg-white transition-[width] duration-200 lg:sticky lg:top-0 lg:min-h-screen lg:w-[72px] lg:border-b-0 lg:border-r lg:hover:w-[250px]">
        <div className="flex items-center justify-center gap-3 overflow-hidden px-5 py-4 lg:px-4 lg:py-7 lg:group-hover:justify-start">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ebedf1]"><School size={21} /></span>
          <div className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-[180px] lg:group-hover:opacity-100"><p className="text-sm font-bold">Kelasin</p><p className="mt-1 text-[11px] text-[#706f70]">portal kepsek</p></div>
        </div>
        <nav aria-label="Navigasi kepala sekolah" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:w-full lg:flex-col lg:overflow-visible">
          <Link href="/kepsek" title="Dashboard" aria-current="page" className="flex min-w-max items-center gap-3 rounded-lg bg-[#ebedf1] px-3 py-2.5 text-sm font-medium lg:min-w-0 lg:w-full lg:justify-center lg:group-hover:justify-start">
            <LayoutDashboard size={17} /><span className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-[180px] lg:group-hover:opacity-100">Dashboard</span>
          </Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
      <header className="flex min-h-16 items-center justify-between border-b border-[#d4d8df] bg-white px-5 sm:px-8">
        <div><p className="text-[11px] text-[#706f70]">Akademik Sekolah / Kepsek</p><p className="mt-1 text-sm font-semibold">Dashboard Kepala Sekolah</p></div>
        <div className="flex items-center gap-4"><div className="text-right"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-[#706f70]">Kepala Sekolah</p></div><LogoutButton /></div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="mb-7"><h1 className="text-3xl font-bold tracking-tight">Ringkasan Sekolah</h1><p className="mt-2 text-sm text-[#706f70]">Pantau data akademik sekolah secara keseluruhan.</p></div>
        <section aria-label="Statistik sekolah" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-lg border border-[#d4d8df] bg-white p-5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><Icon size={18} /></span><p className="mt-4 text-sm text-[#706f70]">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></article>)}
        </section>
        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
            <h2 className="border-b border-[#d4d8df] px-5 py-4 font-bold">Materi terbaru</h2>
            {latestMaterials.length ? latestMaterials.map((item) => <div key={String(item._id)} className="border-b border-[#ebedf1] px-5 py-4 last:border-0"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-[#706f70]">{item.subject} · {item.kelas}</p></div>) : <p className="px-5 py-8 text-sm text-[#706f70]">Belum ada materi.</p>}
          </div>
          <div className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
            <h2 className="border-b border-[#d4d8df] px-5 py-4 font-bold">Asesmen terbaru</h2>
            {latestAssessments.length ? latestAssessments.map((item) => <div key={String(item._id)} className="border-b border-[#ebedf1] px-5 py-4 last:border-0"><p className="text-sm font-semibold">{item.title} <span className="font-normal text-[#706f70]">· {item.type}</span></p><p className="mt-1 text-xs text-[#706f70]">{item.subject} · {item.kelas}{item.deadline ? ` · Tenggat ${new Date(item.deadline).toLocaleDateString("id-ID")}` : ""}</p></div>) : <p className="px-5 py-8 text-sm text-[#706f70]">Belum ada asesmen.</p>}
          </div>
        </section>
        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <div className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
            <h2 className="border-b border-[#d4d8df] px-5 py-4 font-bold">Data guru ({teacherRecords.length})</h2>
            {teacherRecords.length ? teacherRecords.map((teacher) => <div key={String(teacher._id)} className="border-b border-[#ebedf1] px-5 py-4 last:border-0"><p className="text-sm font-semibold">{teacher.name}</p><p className="mt-1 text-xs text-[#706f70]">{teacher.subject} · {teacher.major} · Kelas: {teacher.classes || "Belum ditentukan"}</p></div>) : <p className="px-5 py-8 text-sm text-[#706f70]">Belum ada data guru.</p>}
          </div>
          <div className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
            <h2 className="border-b border-[#d4d8df] px-5 py-4 font-bold">Daftar kelas ({classRecords.length})</h2>
            {classRecords.length ? classRecords.map((schoolClass) => <div key={String(schoolClass._id)} className="border-b border-[#ebedf1] px-5 py-4 last:border-0"><p className="text-sm font-semibold">{schoolClass.name}</p><p className="mt-1 text-xs text-[#706f70]">Wali: {schoolClass.homeroomTeacher} · Ruang: {schoolClass.room || "-"} · Kapasitas: {schoolClass.studentCount}</p></div>) : <p className="px-5 py-8 text-sm text-[#706f70]">Belum ada data kelas.</p>}
          </div>
        </section>
      </div>
      </div>
      </div>
    </main>
  );
}
