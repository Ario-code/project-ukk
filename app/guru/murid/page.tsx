import Link from "next/link";
import GuruShell from "../GuruShell";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/student";

export const dynamic = "force-dynamic";

export default async function GuruMuridPage() {
  await connectDB();
  const students = await Student.find().lean();

  const classCounts = students.reduce<Record<string, number>>((acc, s) => {
    acc[s.className] = (acc[s.className] ?? 0) + 1;
    return acc;
  }, {});
  const classNames = Object.keys(classCounts).sort();

  return (
    <GuruShell>
      <h1 className="mb-8 text-[30px] font-bold text-[#1d2430]">Lihat Murid & Kelas</h1>

      {classNames.length === 0 ? (
        <p className="text-[14px] text-[#667085]">Belum ada murid.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {classNames.map((name) => (
            <Link
              key={name}
              href={`/guru/murid/${encodeURIComponent(name)}`}
              className="rounded-[16px] border border-[#dfe3ea] bg-white p-6 shadow-sm transition hover:border-[#1f7a4d]"
            >
              <div className="mb-2 text-[20px] font-bold text-[#1d2430]">Class {name}</div>
              <div className="text-[13px] text-[#667085]">{classCounts[name]} students</div>
            </Link>
          ))}
        </div>
      )}
    </GuruShell>
  );
}