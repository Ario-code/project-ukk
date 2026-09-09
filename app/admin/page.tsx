import Link from "next/link";
import AdminShell from "./AdminShell";

const activities = [
  ["♙", "New student\nenrolled", "Admin Sarah", "Today, 09:42 AM", "Completed"],
  ["♙", "Teacher assigned to\nClass", "Admin Sarah", "Today, 08:15 AM", "Completed"],
  ["≡", "Curriculum updated", "Admin Sarah", "Yesterday, 04:30 PM", "Pending"],
];

export default function AdminPage() {
  return (
    <AdminShell active="dashboard">
      <div className="mb-7 flex items-center justify-between">
        <h1 className="text-[25px] font-bold tracking-[-0.5px]">Admin Overview</h1>
      </div>

      <div className="grid gap-5 xl:grid-cols-[160px_160px_1fr]">
        <div className="rounded-lg border border-[#d6d9df] bg-white p-5"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eff8] text-lg">♟</div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#737983]">Total teachers</p><p className="mt-1 text-[34px] font-bold leading-none">148</p></div>
        <div className="rounded-lg border border-[#d6d9df] bg-white p-5"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eff8] text-lg">♟</div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#737983]">Total students</p><p className="mt-1 text-[34px] font-bold leading-none">2,410</p></div>
        <div className="rounded-lg border border-[#d6d9df] bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-wide">Quick actions</p><div className="mt-4 flex gap-3"><Link className="flex min-h-[70px] flex-1 flex-col items-center justify-center rounded-lg bg-[#f3f4f6] text-center text-[10px] hover:bg-[#e9ebee]" href="/admin/teachers/new"><span className="mb-2 text-xl">♙+</span>Tambah Guru</Link><button className="flex min-h-[70px] flex-1 flex-col items-center justify-center rounded-lg bg-[#f3f4f6] text-center text-[10px] hover:bg-[#e9ebee]"><span className="mb-2 text-xl">♟+</span>Tambah<br />Murid</button><button className="flex min-h-[70px] flex-1 flex-col items-center justify-center rounded-lg bg-[#f3f4f6] text-center text-[10px] hover:bg-[#e9ebee]"><span className="mb-2 text-xl">⊞</span>Buat Kelas</button></div></div>
      </div>

      <section className="mt-5 overflow-hidden rounded-lg border border-[#d6d9df] bg-white">
        <h2 className="border-b border-[#d6d9df] px-5 py-5 text-[18px] font-semibold">Recent Administrative Activities</h2>
        <div className="grid grid-cols-[1.3fr_1fr_1fr_110px] bg-[#f3f4f6] px-5 py-3 text-[10px] font-semibold text-[#60656e]"><span>Activity</span><span>User</span><span>Timestamp</span><span>Status</span></div>
        {activities.map(([icon, activity, user, timestamp, status]) => <div className="grid grid-cols-[1.3fr_1fr_1fr_110px] items-center border-t border-[#e1e3e7] px-5 py-4 text-[12px]" key={activity}><span className="flex items-center gap-3 whitespace-pre-line"><span className="text-lg">{icon}</span>{activity}</span><span>{user}</span><span className="text-[#81858d]">{timestamp}</span><span><span className={`rounded-full px-3 py-1 text-[10px] ${status === "Completed" ? "bg-[#d9f8e8] text-[#219653]" : "bg-[#ffe58d] text-[#9b7600]"}`}>{status}</span></span></div>)}
        <div className="flex justify-end gap-2 border-t border-[#d6d9df] bg-[#f5f6f8] px-5 py-3"><button className="rounded border border-[#d6d9df] bg-white px-3 py-1">‹</button><button className="rounded bg-[#100b32] px-3 py-1 text-white">1</button><button className="rounded border border-[#d6d9df] bg-white px-3 py-1">2</button><button className="rounded border border-[#d6d9df] bg-white px-3 py-1">›</button></div>
      </section>
    </AdminShell>
  );
}
