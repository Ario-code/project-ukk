import Link from "next/link";
import GuruShell from "../GuruShell";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";

export const dynamic = "force-dynamic";

export default async function GuruMateriPage() {
  await connectDB();
  const materials = await Material.find().sort({ createdAt: -1 }).lean();

  return (
    <GuruShell>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[36px] font-bold text-[#1d2430]">Materi</h1>
        <Link href="/guru/materi/new" className="rounded-lg bg-[#1f7a4d] px-4 py-2 text-[14px] font-semibold text-white">
          + Upload Materi
        </Link>
      </div>

      {materials.length === 0 ? (
        <p className="text-[14px] text-[#667085]">Belum ada materi.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {materials.map((item) => (
            <div key={String(item._id)} className="rounded-[16px] border border-[#dfe3ea] bg-white p-4 shadow-sm">
              <div className="mb-4 flex h-16 items-center justify-center rounded-lg bg-[#f4f5f7] text-2xl">▣</div>
              <div className="mb-2 flex gap-2 text-[11px]">
                <span className="rounded-full bg-[#edf1f6] px-2 py-1 text-[#55657d]">{item.kelas}</span>
                <span className="rounded-full bg-[#edf1f6] px-2 py-1 text-[#55657d]">{item.subject}</span>
              </div>
              <div className="mb-1 text-[18px] font-bold text-[#1a2230]">{item.title}</div>
              {item.description && <p className="mb-2 text-[13px] text-[#667085]">{item.description}</p>}
              <div className="mt-3 flex items-center justify-between border-t border-[#eef1f4] pt-3 text-[12px] text-[#7b8493]">
                <span>{item.sizeLabel}</span>
                <a href={item.fileUrl} className="text-[#2a6fdd]">↓</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </GuruShell>
  );
}