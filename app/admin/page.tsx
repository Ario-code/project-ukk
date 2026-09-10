"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";

type Activity = { _id: string; icon: string; activity: string; user: string; status: "Completed" | "Pending"; createdAt: string };
type Statistics = { teachers: number; students: number; classes: number };

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function AdminPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({ teachers: 0, students: 0, classes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetch("/api/activities"), fetch("/api/dashboard")])
      .then(async ([activityResponse, dashboardResponse]) => {
        const activityData = await activityResponse.json();
        const dashboardData = await dashboardResponse.json();
        if (!activityResponse.ok) throw new Error(activityData.message ?? "Gagal mengambil aktivitas");
        if (!dashboardResponse.ok) throw new Error(dashboardData.message ?? "Gagal mengambil statistik");
        setActivities(activityData.activities);
        setStatistics(dashboardData.statistics);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return <AdminShell active="dashboard">
    <div className="mb-7"><h1 className="text-[25px] font-bold tracking-[-0.5px]">Admin Overview</h1></div>
    <div className="grid gap-5 xl:grid-cols-[160px_160px_1fr]">
      <div className="rounded-lg border border-[#d6d9df] bg-white p-5"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eff8] text-lg">♟</div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#737983]">Total teachers</p><p className="mt-1 text-[34px] font-bold leading-none">{statistics.teachers}</p></div>
      <div className="rounded-lg border border-[#d6d9df] bg-white p-5"><div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#e9eff8] text-lg">♟</div><p className="text-[10px] font-semibold uppercase tracking-wider text-[#737983]">Total students</p><p className="mt-1 text-[34px] font-bold leading-none">{statistics.students}</p></div>
      <div className="rounded-lg border border-[#d6d9df] bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-wide">Quick actions</p><div className="mt-4 flex gap-3"><Link className="flex min-h-[70px] flex-1 flex-col items-center justify-center rounded-lg bg-[#f3f4f6] text-center text-[10px] hover:bg-[#e9ebee]" href="/admin/teachers/new"><span className="mb-2 text-xl">♙+</span>Tambah Guru</Link><Link className="flex min-h-[70px] flex-1 flex-col items-center justify-center rounded-lg bg-[#f3f4f6] text-center text-[10px] hover:bg-[#e9ebee]" href="/admin/students/new"><span className="mb-2 text-xl">♟+</span>Tambah<br />Murid</Link><Link className="flex min-h-[70px] flex-1 flex-col items-center justify-center rounded-lg bg-[#f3f4f6] text-center text-[10px] hover:bg-[#e9ebee]" href="/admin/classes/new"><span className="mb-2 text-xl">⊞</span>Buat Kelas</Link></div></div>
    </div>
    <section className="mt-5 overflow-hidden rounded-lg border border-[#d6d9df] bg-white"><h2 className="border-b border-[#d6d9df] px-5 py-5 text-[18px] font-semibold">Recent Administrative Activities</h2><div className="grid grid-cols-[1.3fr_1fr_1fr_110px] bg-[#f3f4f6] px-5 py-3 text-[10px] font-semibold text-[#60656e]"><span>Activity</span><span>User</span><span>Timestamp</span><span>Status</span></div>{loading && <p className="px-5 py-8 text-center text-sm text-slate-500">Memuat aktivitas...</p>}{error && <p className="px-5 py-8 text-center text-sm text-red-600">{error}</p>}{!loading && !error && activities.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">Belum ada aktivitas.</p>}{activities.map((item) => <div className="grid grid-cols-[1.3fr_1fr_1fr_110px] items-center border-t border-[#e1e3e7] px-5 py-4 text-[12px]" key={item._id}><span className="flex items-center gap-3"><span className="text-lg">{item.icon}</span>{item.activity}</span><span>{item.user}</span><span className="text-[#81858d]">{formatTimestamp(item.createdAt)}</span><span><span className={`rounded-full px-3 py-1 text-[10px] ${item.status === "Completed" ? "bg-[#d9f8e8] text-[#219653]" : "bg-[#ffe58d] text-[#9b7600]"}`}>{item.status}</span></span></div>)}</section>
  </AdminShell>;
}
