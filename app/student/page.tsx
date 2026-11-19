import StudentShell from "./StudentShell";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";
import Assessment from "@/models/assessment";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  await connectDB();
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const [materiCount, tugasCount, kuisCount] = await Promise.all([
    Material.countDocuments(),
    Assessment.countDocuments({ type: "Tugas" }),
    Assessment.countDocuments({ type: "Kuis", deadline: { $lte: sevenDaysFromNow } }),
  ]);

  const cards = [
    { label: "Materi", count: materiCount, badge: "Materi Baru", href: "/student/materi" },
    { label: "Tugas", count: tugasCount, badge: "Tugas Belum Selesai", href: "/student/assessment" },
    { label: "Kuis", count: kuisCount, badge: "Ujian Mendatang", href: "/student/assessment" },
  ] as const;

  return (
    <StudentShell active="dashboard">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-[#353536]">Selamat Datang, Murid!</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <Link href={card.href} key={card.label} className="rounded-lg border border-[#d4d8df] bg-white p-5 transition hover:border-[#acadb1]">
            <div className="mb-4 text-lg font-semibold text-[#353536]">{card.label}</div>
            <div className="mb-5 text-4xl font-bold leading-none text-[#353536]">{card.count}</div>
            <div className="inline-flex rounded-full bg-[#ebedf1] px-3 py-1 text-xs font-semibold text-[#706f70]">{card.badge}</div>
            <div className="mt-5 border-t border-[#d4d8df] pt-4 text-sm font-semibold text-[#168446]">Lihat detail →</div>
          </Link>
        ))}
      </div>
    </StudentShell>
  );
}