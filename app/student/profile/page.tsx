import { redirect } from "next/navigation";
import StudentShell from "../StudentShell";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/user";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const roleLabel: Record<string, string> = {
  murid: "Murid", guru: "Guru", kepsek: "Kepala Sekolah", wakakurikulum: "Wakil Kurikulum", admin: "Admin",
};

export default async function StudentProfilePage() {
  const session = await getCurrentUser();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.id).select("nama email role createdAt").lean();
  if (!user) redirect("/login");

  const initials = user.nama.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
  const fields = [
    { label: "Email", value: user.email },
    { label: "Role", value: roleLabel[user.role] ?? user.role },
    { label: "School", value: "SMK Link" },
    { label: "Bergabung", value: new Date(user.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) },
  ];

  return (
    <StudentShell active="profile">
      <h1 className="mb-8 text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Profile</h1>
      <div className="max-w-3xl rounded-[24px] border border-[#dfe3ea] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dfeaf6] text-[24px] font-bold text-[#3c4f73]">{initials}</div>
          <div>
            <h2 className="text-[30px] font-bold text-[#1d2430]">{user.nama}</h2>
            <p className="text-[16px] text-[#5e697b]">{roleLabel[user.role] ?? user.role}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.label} className="rounded-xl bg-[#f7f9fb] p-4">
              <div className="text-[12px] uppercase text-[#707b89]">{f.label}</div>
              <div className="mt-2 text-[16px] font-semibold text-[#1d2430]">{f.value}</div>
            </div>
          ))}
        </div>
      </div>
    </StudentShell>
  );
}