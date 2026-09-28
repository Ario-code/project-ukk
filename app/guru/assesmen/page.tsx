import Link from "next/link";
import GuruShell from "../GuruShell";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/assessment";

export const dynamic = "force-dynamic";

export default async function GuruAssesmenPage() {
  await connectDB();
  const all = await Assessment.find().sort({ createdAt: -1 }).lean();
  const nonTugas = all.filter((a) => a.type !== "Tugas");
  const tugas = all.filter((a) => a.type === "Tugas");

  return (
    <GuruShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-3 text-[30px] font-bold text-[#1d2430]">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dfeaf6] text-lg">▤</span>
          Assesmen
        </h1>
        <div className="flex gap-3">
          <Link href="/guru/assesmen/penilaian/new" className="rounded-lg bg-[#1f7a4d] px-4 py-2 text-[13px] font-semibold text-white">+ Penilaian Baru</Link>
          <Link href="/guru/assesmen/kuis/new" className="rounded-lg bg-[#1f7a4d] px-4 py-2 text-[13px] font-semibold text-white">+ Kuis baru</Link>
        </div>
      </div>

      <div className="mb-10 rounded-[16px] border border-[#dfe3ea] bg-white">
        <div className="border-b border-[#e9edf2] bg-[#f4f5f7] px-6 py-3 text-[14px] font-semibold text-[#5d6776]">Assesmen</div>
        {nonTugas.length === 0 ? (
          <p className="px-6 py-6 text-[13px] text-[#8b93a1]">Belum ada assesmen.</p>
        ) : (
          nonTugas.map((a) => (
            <div key={String(a._id)} className="flex items-center justify-between border-b border-[#eef1f4] px-6 py-4 last:border-b-0">
              <div>
                <div className="text-[15px] font-bold text-[#1d2430]">
                  {a.type.toUpperCase()} <span className="font-normal">{a.title}</span>
                </div>
                <div className="text-[12px] text-[#8b93a1]">{a.kelas} · {a.subject}</div>
              </div>
              <span className="text-[13px] text-[#3d4a5c]">{a.status}</span>
            </div>
          ))
        )}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-[24px] font-bold text-[#1d2430]">Tugas</h2>
        <Link href="/guru/assesmen/tugas/new" className="rounded-lg bg-[#1f7a4d] px-4 py-2 text-[13px] font-semibold text-white">+ Tugas Baru</Link>
      </div>

      <div className="rounded-[16px] border border-[#dfe3ea] bg-white">
        <div className="border-b border-[#e9edf2] bg-[#f4f5f7] px-6 py-3 text-[14px] font-semibold text-[#5d6776]">Tugas</div>
        {tugas.length === 0 ? (
          <p className="px-6 py-6 text-[13px] text-[#8b93a1]">Belum ada tugas.</p>
        ) : (
          tugas.map((t) => (
            <div key={String(t._id)} className="border-b border-[#eef1f4] px-6 py-4 last:border-b-0">
              <div className="text-[15px] font-bold text-[#1d2430]">TUGAS {t.title}</div>
              <div className="text-[12px] text-[#8b93a1]">
                {t.kelas} · Deadline: {t.deadline ? new Date(t.deadline).toLocaleDateString("id-ID") : "belum ditentukan"}
              </div>
            </div>
          ))
        )}
      </div>
    </GuruShell>
  );
}