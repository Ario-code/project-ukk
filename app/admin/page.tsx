"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import { ArrowUpRight, BookOpen, CheckCircle2, Clock3, GraduationCap, School, Upload, UserRoundPlus, Users } from "lucide-react";

type Activity = { _id: string; icon: string; activity: string; user: string; status: "Completed" | "Pending"; createdAt: string };
type Statistics = { teachers: number; students: number; classes: number };

function formatTimestamp(value: string) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
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

  return (
    <AdminShell active="dashboard">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Selamat datang, Admin</h1>
          <p className="mt-2 text-sm text-[#706f70]">Pantau data dan aktivitas administrasi sekolah dari sini.</p>
        </div>
        <Link className="inline-flex items-center gap-2 rounded-lg bg-[#168446] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#106d38]" href="/admin/users/new">
          <UserRoundPlus size={17} /> Buat akun
        </Link>
      </div>

      <section aria-label="Statistik sekolah" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-lg border border-[#d4d8df] bg-white p-5">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-[#706f70]">Total guru</p><p className="mt-3 text-3xl font-bold tracking-tight text-[#353536]">{statistics.teachers}</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><BookOpen size={19} /></span>
          </div>
          <Link className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#706f70] hover:text-[#353536] hover:underline" href="/admin/teachers">Lihat guru <ArrowUpRight size={14} /></Link>
        </article>
        <article className="rounded-lg border border-[#d4d8df] bg-white p-5">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-[#706f70]">Total murid</p><p className="mt-3 text-3xl font-bold tracking-tight text-[#353536]">{statistics.students}</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><GraduationCap size={19} /></span>
          </div>
          <Link className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#706f70] hover:text-[#353536] hover:underline" href="/admin/students">Lihat murid <ArrowUpRight size={14} /></Link>
        </article>
        <article className="rounded-lg border border-[#d4d8df] bg-white p-5">
          <div className="flex items-start justify-between">
            <div><p className="text-sm font-medium text-[#706f70]">Total kelas</p><p className="mt-3 text-3xl font-bold tracking-tight text-[#353536]">{statistics.classes}</p></div>
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><School size={19} /></span>
          </div>
          <Link className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#706f70] hover:text-[#353536] hover:underline" href="/admin/classes">Lihat kelas <ArrowUpRight size={14} /></Link>
        </article>
      </section>

      <section className="mt-8 border-y border-[#d4d8df] py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div><h2 className="text-base font-bold text-[#353536]">Akses cepat</h2><p className="mt-1 text-xs text-[#706f70]">Tindakan administrasi yang sering digunakan.</p></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link className="group flex items-center justify-between gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4 transition hover:border-[#acadb1] hover:bg-[#ebedf1]" href="/admin/users/new"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ebedf1] text-[#706f70]"><Users size={17} /></span><span className="text-sm font-semibold">Tambah pengguna</span></span><ArrowUpRight className="text-[#acadb1] transition group-hover:text-[#353536]" size={16} /></Link>
          <Link className="group flex items-center justify-between gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4 transition hover:border-[#acadb1] hover:bg-[#ebedf1]" href="/admin/teachers/new"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ebedf1] text-[#706f70]"><BookOpen size={17} /></span><span className="text-sm font-semibold">Tambah guru</span></span><ArrowUpRight className="text-[#acadb1] transition group-hover:text-[#353536]" size={16} /></Link>
          <Link className="group flex items-center justify-between gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4 transition hover:border-[#acadb1] hover:bg-[#ebedf1]" href="/admin/students/new"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ebedf1] text-[#706f70]"><GraduationCap size={17} /></span><span className="text-sm font-semibold">Tambah murid</span></span><ArrowUpRight className="text-[#acadb1] transition group-hover:text-[#353536]" size={16} /></Link>
          <Link className="group flex items-center justify-between gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4 transition hover:border-[#acadb1] hover:bg-[#ebedf1]" href="/admin/users/import"><span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#ebedf1] text-[#706f70]"><Upload size={17} /></span><span className="text-sm font-semibold">Impor akun</span></span><ArrowUpRight className="text-[#acadb1] transition group-hover:text-[#353536]" size={16} /></Link>
        </div>
      </section>

      <section className="mt-7 overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4d8df] px-5 py-4 sm:px-6">
          <div><h2 className="text-base font-bold text-[#353536]">Aktivitas terbaru</h2><p className="mt-1 text-xs text-[#706f70]">Catatan perubahan administrasi sekolah.</p></div>
          <span className="flex items-center gap-2 text-xs text-[#706f70]"><span className="h-2 w-2 rounded-full bg-[#65a675]" /> Terkini</span>
        </div>
        {loading && <p className="px-5 py-10 text-center text-sm text-[#706f70]">Memuat aktivitas...</p>}
        {error && <p className="px-5 py-10 text-center text-sm text-red-700">{error}</p>}
        {!loading && !error && activities.length === 0 && <p className="px-5 py-10 text-center text-sm text-[#706f70]">Belum ada aktivitas.</p>}
        {!loading && !error && activities.length > 0 && (
          <div className="overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_110px] bg-[#ebedf1] px-5 py-3 text-[11px] font-semibold text-[#706f70] sm:px-6"><span>Aktivitas</span><span>Pengguna</span><span>Waktu</span><span>Status</span></div>
              {activities.map((item) => (
                <div className="grid grid-cols-[1.5fr_1fr_1fr_110px] items-center border-t border-[#edf0ed] px-5 py-4 text-xs text-[#706f70] sm:px-6" key={item._id}>
                  <span className="flex items-center gap-3">{item.status === "Completed" ? <CheckCircle2 size={16} className="shrink-0 text-[#39865a]" /> : <Clock3 size={16} className="shrink-0 text-[#b07b27]" />}<span>{item.activity}</span></span>
                  <span>{item.user}</span>
                  <span className="text-[#706f70]">{formatTimestamp(item.createdAt)}</span>
                  <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${item.status === "Completed" ? "bg-[#ebedf1] text-[#28734f]" : "bg-[#ebedf1] text-[#94601b]"}`}>{item.status === "Completed" ? "Selesai" : "Menunggu"}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </AdminShell>
  );
}