import StudentShell from "./StudentShell";

const cards = [
  { label: "Materi", count: 6, badge: "Materi Baru", link: "Ke Materi →", tone: "bg-[#dff3e6]" },
  { label: "Tugas", count: 3, badge: "Tugas Belum Selesai", link: "Ke Tugas →", tone: "bg-[#f7dfe1]" },
  { label: "Kuis", count: 1, badge: "Ujian Mendatang", link: "Ke Ujian →", tone: "bg-[#f3f0b8]" },
] as const;

export default function StudentDashboardPage() {
  return (
    <StudentShell active="dashboard">
      <div className="mb-8">
        <h1 className="text-[52px] font-bold tracking-[-1.5px] text-[#1e2430]">Allo, Student!</h1>
      </div>

      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dbe2ea] bg-[#eef5fd] px-3 py-1 text-[12px] font-medium text-[#2f3b53]">
          <span className="h-2 w-2 rounded-full bg-[#2b7ef7]" />
          Semester 1
        </span>
        <span className="rounded-full bg-[#e8ebf2] px-3 py-1 text-[12px] font-medium text-[#465368]">PPLG</span>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl border border-[#dfe2e7] bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
            <div className="mb-4 text-[22px] font-semibold text-[#1d2430]">{card.label}</div>
            <div className="mb-5 text-[46px] font-bold leading-none tracking-[-1.5px] text-[#1d2430]">{card.count}</div>
            <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${card.tone} text-[#3d4d59]`}>
              {card.badge}
            </div>
            <div className="mt-5 border-t border-[#e8ebf1] pt-4 text-[14px] font-medium text-[#2d78d5]">{card.link}</div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfeaf6] text-lg text-[#2b5ba5]">▣</div>
          <h2 className="text-[36px] font-bold tracking-[-1px] text-[#1d2430]">Assesmen Abdi</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {["", "", ""].map((_, index) => (
            <div key={index} className="h-[220px] rounded-2xl border border-[#e4e7eb] bg-[#dfe3e8]" />
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
