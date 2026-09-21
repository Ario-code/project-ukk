import Link from "next/link";
import StudentShell from "../StudentShell";

const materials = [
  { title: "Materi Trigonometri", info: "Matematika - PDF, 2.4 MB", date: "Diupload 15 Juli 2026", accent: "bg-[#dfeaf6]" },
  { title: "Materi gak ada yg tau", info: "Gak ada yg tau - PDF, 3.1 MB", date: "Diupload 15 Juli 2026", accent: "bg-[#f2f3f5]" },
  { title: "Materi gak ada yg tau", info: "Gak ada yg tau - PDF, 3.1 MB", date: "Diupload 15 Juli 2026", accent: "bg-[#f2f3f5]" },
] as const;

const history = [
  { name: "Advanced Networking Module 3.pdf", kelas: "TKJ", size: "2.4 MB", date: "Oct 24, 2023" },
  { name: "Cisco Router Configuration Tutorial.mp4", kelas: "TKJ", size: "145 MB", date: "Oct 22, 2023" },
  { name: "Semester 1 Syllabus.docx", kelas: "General", size: "1.1 MB", date: "Sep 01, 2023" },
] as const;

export default function StudentMaterialPage() {
  return (
    <StudentShell active="materi">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-[#dfe3ea] bg-white px-4 py-3 shadow-sm">
          <span className="text-[#5b6472]">⌕</span>
          <input
            readOnly
            value="Search materials, courses, or files..."
            className="w-full bg-transparent text-[14px] text-[#667085] outline-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="text-xl text-[#4b5361]">◍</button>
          <button type="button" className="text-xl text-[#4b5361]">?</button>
        </div>
      </div>

      <h1 className="mb-8 text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Materi nya euy</h1>

      <div className="grid gap-6 xl:grid-cols-3">
        {materials.map((item) => (
          <div key={item.title} className="rounded-[22px] border border-[#dfe3ea] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
            <div className="mb-5 flex h-16 items-center justify-between gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.accent} text-xl text-[#2e4d71]`}>
                ▣
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfe3ea] text-xl text-[#4d5867]">
                ↓
              </div>
            </div>

            <div className="mb-2 text-[20px] font-bold text-[#1a2230]">{item.title}</div>
            <div className="mb-4 text-[13px] text-[#667085]">{item.info}</div>
            <div className="flex items-center justify-between border-t border-[#eef1f4] pt-3 text-[12px] text-[#7b8493]">
              <span>{item.date}</span>
              <span className="text-xl">⇩</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-[20px] border border-[#dfe3ea] bg-white">
        <div className="flex items-center justify-between border-b border-[#e9edf2] px-6 py-5">
          <h2 className="text-[28px] font-bold text-[#1d2430]">Histori File</h2>
          <Link href="#" className="text-[13px] font-medium text-[#2a6fdd]">View All</Link>
        </div>

        <div className="overflow-hidden">
          <div className="grid grid-cols-[2.5fr_0.9fr_0.7fr_1.1fr_0.5fr] gap-4 border-b border-[#eef1f4] bg-[#f7f9fb] px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#5d6776]">
            <span>Nama File</span>
            <span>Kelas</span>
            <span>Size</span>
            <span>Date Added</span>
            <span>Download</span>
          </div>

          {history.map((item) => (
            <div key={item.name} className="grid grid-cols-[2.5fr_0.9fr_0.7fr_1.1fr_0.5fr] gap-4 border-b border-[#eef1f4] px-6 py-4 text-[13px] text-[#2d3543] last:border-b-0">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4ede8] text-[#d65f52]">▣</div>
                <span>{item.name}</span>
              </div>
              <span className="inline-flex w-fit rounded-full bg-[#edf1f6] px-2 py-1 text-[11px] text-[#55657d]">{item.kelas}</span>
              <span>{item.size}</span>
              <span>{item.date}</span>
              <span className="text-right text-xl text-[#4365ad]">⇩</span>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}
