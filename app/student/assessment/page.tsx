import { BookOpenText, ClipboardCheck, FileText, NotebookPen, Trophy, type LucideIcon } from "lucide-react";
import StudentShell from "../StudentShell";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/assessment";

export const dynamic = "force-dynamic";

const icons: Record<string, LucideIcon> = {
  Kuis: NotebookPen,
  Ujian: ClipboardCheck,
  Penilaian: Trophy,
  Tugas: FileText,
};

export default async function StudentAssessmentPage() {
  await connectDB();
  const assessments = await Assessment.find().sort({ deadline: 1 }).lean();

  return (
    <StudentShell active="assessment">
      <h1 className="mb-8 text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Assesmen</h1>

      {assessments.length === 0 ? (
        <p className="text-[14px] text-[#667085]">Belum ada penugasan.</p>
      ) : (
        <div className="space-y-5">
          {assessments.map((item) => (
            <div key={String(item._id)} className="flex items-center gap-4 rounded-[20px] border border-[#dfe3ea] bg-[#ebedf0] px-6 py-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f6f9] text-[#1d2430]">
                {(() => {
                  const Icon = icons[item.type] ?? BookOpenText;
                  return <Icon className="h-5 w-5" />;
                })()}
              </div>
              <div>
                <div className="text-[28px] font-bold tracking-[-0.6px] text-[#1d2430]">{item.title}</div>
                <div className="text-[15px] text-[#576072]">
                  {item.subject} - Deadline ({item.deadline ? new Date(item.deadline).toLocaleDateString("id-ID") : "belum ditentukan"})
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentShell>
  );
}