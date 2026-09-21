import StudentShell from "../StudentShell";

const assessments = [
  { title: "Kuis apaan aja", subtitle: "Mtk Trigonometri - Deadline ( gak ada yg tau )", icon: "▣" },
  { title: "Ujian Online", subtitle: "Mtk Trigonometri - Deadline ( gak ada yg tau )", icon: "◫" },
  { title: "Penilaian", subtitle: "Mtk Trigonometri - Deadline ( gak ada yg tau )", icon: "▣" },
] as const;

export default function StudentAssessmentPage() {
  return (
    <StudentShell active="assessment">
      <h1 className="mb-8 text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Assesmen nya euy</h1>

      <div className="space-y-5">
        {assessments.map((item) => (
          <div key={item.title} className="flex items-center gap-4 rounded-[20px] border border-[#dfe3ea] bg-[#ebedf0] px-6 py-5 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f6f9] text-[28px] text-[#1d2430]">
              {item.icon}
            </div>
            <div>
              <div className="text-[28px] font-bold tracking-[-0.6px] text-[#1d2430]">{item.title}</div>
              <div className="text-[15px] text-[#576072]">{item.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </StudentShell>
  );
}
