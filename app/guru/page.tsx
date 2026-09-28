import GuruShell from "./GuruShell";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";
import Assessment from "@/models/assessment";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function GuruDashboardPage() {
  const user = await getCurrentUser();
  await connectDB();

  const [latestMaterials, latestAssessments] = await Promise.all([
    Material.find().sort({ createdAt: -1 }).limit(3).lean(),
    Assessment.find().sort({ createdAt: -1 }).limit(3).lean(),
  ]);

  return (
    <GuruShell>
      <h1 className="mb-8 text-[36px] font-bold text-[#1d2430]">Good morning, {user?.name ?? "Guru"}</h1>

      <div className="rounded-[20px] border border-[#dfe3ea] bg-white">
        <div className="border-b border-[#e9edf2] bg-[#f7f9fb] px-6 py-4">
          <h2 className="text-[18px] font-bold text-[#1d2430]">New Activity</h2>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#5d6776]">Materi Ditambahkan</h3>
            {latestMaterials.length === 0 ? (
              <p className="text-[13px] text-[#8b93a1]">Belum ada materi.</p>
            ) : (
              <ul className="space-y-2 text-[14px] text-[#2d3543]">
                {latestMaterials.map((m) => (
                  <li key={String(m._id)}>{m.title} <span className="text-[#8b93a1]">({m.subject})</span></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#5d6776]">Assesmen Ditambahkan</h3>
            {latestAssessments.length === 0 ? (
              <p className="text-[13px] text-[#8b93a1]">Belum ada assesmen.</p>
            ) : (
              <ul className="space-y-2 text-[14px] text-[#2d3543]">
                {latestAssessments.map((a) => (
                  <li key={String(a._id)}>
                    {a.title} <span className="text-[#8b93a1]">(Deadline: {a.deadline ? new Date(a.deadline).toLocaleDateString("id-ID") : "belum ditentukan"})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </GuruShell>
  );
}