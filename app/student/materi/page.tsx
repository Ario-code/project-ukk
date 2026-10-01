import Link from "next/link";
import { ArrowDownToLine, FileText, Search } from "lucide-react";
import StudentShell from "../StudentShell";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";

export const dynamic = "force-dynamic";

export default async function StudentMaterialPage() {
  await connectDB();
  const materials = await Material.find().sort({ createdAt: -1 }).lean();

  const cards = materials.slice(0, 3);
  const history = materials.slice(3);

  return (
    <StudentShell active="materi">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3 rounded-full border border-[#dfe3ea] bg-white px-4 py-3 shadow-sm">
          <Search className="h-4 w-4 text-[#5b6472]" />
          <input
            readOnly
            value="Search materials, courses, or files..."
            className="w-full bg-transparent text-[14px] text-[#667085] outline-none"
          />
        </div>
      </div>

      <h1 className="mb-8 text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Materi</h1>

      {cards.length === 0 ? (
        <p className="text-[14px] text-[#667085]">Belum ada materi.</p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {cards.map((item) => (
            <div key={String(item._id)} className="rounded-[22px] border border-[#dfe3ea] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
              <div className="mb-5 flex h-16 items-center justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dfeaf6] text-[#2e4d71]">
                  <FileText className="h-5 w-5" />
                </div>
                <a href={item.fileUrl} className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dfe3ea] text-[#4d5867]">
                  <ArrowDownToLine className="h-4 w-4" />
                </a>
              </div>
              <div className="mb-2 text-[20px] font-bold text-[#1a2230]">{item.title}</div>
              <div className="mb-4 text-[13px] text-[#667085]">{item.subject} - {item.fileType}, {item.sizeLabel}</div>
              <div className="flex items-center justify-between border-t border-[#eef1f4] pt-3 text-[12px] text-[#7b8493]">
                <span>Diupload {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 rounded-[20px] border border-[#dfe3ea] bg-white">
        <div className="flex items-center justify-between border-b border-[#e9edf2] px-6 py-5">
          <h2 className="text-[28px] font-bold text-[#1d2430]">Histori File</h2>
          <Link href="#" className="text-[13px] font-medium text-[#2a6fdd]">View All</Link>
        </div>

        <div className="overflow-hidden">
          <div className="grid grid-cols-[2.5fr_0.9fr_0.7fr_1.1fr_0.5fr] gap-4 border-b border-[#eef1f4] bg-[#f7f9fb] px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#5d6776]">
            <span>Nama File</span><span>Kelas</span><span>Size</span><span>Date Added</span><span>Download</span>
          </div>

          {history.length === 0 ? (
            <p className="px-6 py-6 text-[13px] text-[#667085]">Belum ada file lain.</p>
          ) : (
            history.map((item) => (
              <div key={String(item._id)} className="grid grid-cols-[2.5fr_0.9fr_0.7fr_1.1fr_0.5fr] gap-4 border-b border-[#eef1f4] px-6 py-4 text-[13px] text-[#2d3543] last:border-b-0">
                <span>{item.title}</span>
                <span className="inline-flex w-fit rounded-full bg-[#edf1f6] px-2 py-1 text-[11px] text-[#55657d]">{item.kelas}</span>
                <span>{item.sizeLabel}</span>
                <span>{new Date(item.createdAt).toLocaleDateString("en-US")}</span>
                <a href={item.fileUrl} className="text-right text-[#4365ad]">
                  <ArrowDownToLine className="ml-auto h-4 w-4" />
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentShell>
  );
}