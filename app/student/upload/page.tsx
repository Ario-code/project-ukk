import StudentShell from "../StudentShell";

const uploads = [
  { title: "Project yg tau aja (PWPB)", icon: "◫", tone: "bg-[#e2e6eb]", tag: "Grade 12" },
  { title: "Project yg tau aja (DB)", icon: "◫", tone: "bg-[#e2e6eb]", tag: "Grade 12" },
  { title: "Makalah apaan aja dah", icon: "▣", tone: "bg-[#f4f4f5]", tag: "Grade 12" },
] as const;

export default function StudentUploadPage() {
  return (
    <StudentShell active="upload">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Upload Project & Tugas</h1>
        <button type="button" className="rounded-xl bg-[#111b46] px-5 py-3 text-[14px] font-semibold text-white shadow-sm">
          ⤴ Upload
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {uploads.map((item) => (
          <div key={item.title} className="rounded-[22px] border border-[#dfe3ea] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
            <div className="mb-6 flex h-44 items-center justify-center rounded-[18px] border border-[#dfe3ea] bg-[#eceef0] text-[64px] text-[#1a2230]">
              {item.icon}
            </div>

            <div className="mb-3 inline-flex rounded-full bg-[#edf1f7] px-2 py-1 text-[11px] font-medium text-[#3d4c65]">
              {item.tag}
            </div>

            <div className="text-[22px] font-semibold leading-tight text-[#1d2430]">{item.title}</div>
            <div className="mt-4 flex items-center justify-center text-[18px] text-[#667085]">◌</div>
          </div>
        ))}
      </div>
    </StudentShell>
  );
}
