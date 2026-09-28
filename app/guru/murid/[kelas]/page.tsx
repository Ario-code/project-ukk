import GuruShell from "../../GuruShell";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/student";

export const dynamic = "force-dynamic";

export default async function GuruMuridKelasPage({ params }: { params: Promise<{ kelas: string }> }) {
  const { kelas } = await params;
  const className = decodeURIComponent(kelas);

  await connectDB();
  const students = await Student.find({ className }).sort({ name: 1 }).lean();

  return (
    <GuruShell>
      <h1 className="mb-6 text-[30px] font-bold text-[#1d2430]">Class {className}</h1>

      <div className="mb-6 max-w-xs rounded-[16px] border border-[#dfe3ea] bg-white p-5">
        <div className="text-[12px] uppercase text-[#8b93a1]">Total Students</div>
        <div className="text-[28px] font-bold text-[#1d2430]">{students.length}</div>
      </div>

      <div className="overflow-hidden rounded-[16px] border border-[#dfe3ea] bg-white">
        <div className="grid grid-cols-[2fr_1.2fr_1fr] gap-4 border-b border-[#eef1f4] bg-[#f7f9fb] px-6 py-4 text-[12px] font-semibold uppercase tracking-wide text-[#5d6776]">
          <span>Nama Murid</span>
          <span>NIS</span>
          <span>Jurusan</span>
        </div>

        {students.length === 0 ? (
          <p className="px-6 py-6 text-[13px] text-[#8b93a1]">Belum ada murid di kelas ini.</p>
        ) : (
          students.map((s) => {
            const initials = s.name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
            return (
              <div key={String(s._id)} className="grid grid-cols-[2fr_1.2fr_1fr] items-center gap-4 border-b border-[#eef1f4] px-6 py-4 last:border-b-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dfeaf6] text-[11px] font-bold text-[#2b5ba5]">{initials}</div>
                  <span className="text-[14px] font-medium text-[#1d2430]">{s.name}</span>
                </div>
                <span className="text-[14px] text-[#3d4a5c]">{s.nis}</span>
                <span className="inline-flex w-fit rounded-full bg-[#edf1f6] px-2 py-1 text-[11px] text-[#55657d]">{s.major}</span>
              </div>
            );
          })
        )}
      </div>
    </GuruShell>
  );
}