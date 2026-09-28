import StudentShell from "./StudentShell";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";
import Assessment from "@/models/assessment";

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
    { label: "Materi", count: materiCount, badge: "Materi Baru", link: "Ke Materi →", tone: "bg-[#dff3e6]" },
    { label: "Tugas", count: tugasCount, badge: "Tugas Belum Selesai", link: "Ke Tugas →", tone: "bg-[#f7dfe1]" },
    { label: "Kuis", count: kuisCount, badge: "Ujian Mendatang", link: "Ke Ujian →", tone: "bg-[#f3f0b8]" },
  ] as const;

  return (
    <StudentShell active="dashboard">
      <h1 className="mb-8 text-[52px] font-bold tracking-[-1.5px] text-[#1e2430]">Ciao, Students!</h1>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#dfe2e7] bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
            <div className="mb-4 text-[22px] font-semibold text-[#1d2430]">{card.label}</div>
            <div className="mb-5 text-[46px] font-bold leading-none tracking-[-1.5px] text-[#1d2430]">{card.count}</div>
            <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${card.tone} text-[#3d4d59]`}>{card.badge}</div>
            <div className="mt-5 border-t border-[#e8ebf1] pt-4 text-[14px] font-medium text-[#2d78d5]">{card.link}</div>
          </div>
        ))}
      </div>
    </StudentShell>
  );
}