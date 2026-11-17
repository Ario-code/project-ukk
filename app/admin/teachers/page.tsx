"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, CheckCircle2, Plus, Search, UserRound, Users } from "lucide-react";
import AdminShell from "../AdminShell";
import AccountLinkStatus from "../AccountLinkStatus";

type Teacher = {
  _id: string;
  name: string;
  subject: string;
  major: string;
  classes: string;
  status: "Active" | "Leave";
  accountExists: boolean;
  accountEmail: string | null;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/teachers")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data guru");
        setTeachers(data.teachers ?? []);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredTeachers = teachers.filter((teacher) => `${teacher.name} ${teacher.subject} ${teacher.classes} ${teacher.accountEmail ?? ""}`.toLowerCase().includes(query.toLowerCase()));
  const activeCount = teachers.filter((teacher) => teacher.status === "Active").length;
  const linkedCount = teachers.filter((teacher) => teacher.accountExists).length;

  return (
    <AdminShell active="teachers">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#706f70]">Direktori akademik</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Data guru</h1><p className="mt-2 text-sm text-[#706f70]">Kelola pengajar dan pastikan setiap guru memiliki akun login.</p></div>
        <Link className="inline-flex items-center gap-2 rounded-lg bg-[#168446] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106d38]" href="/admin/teachers/new"><Plus size={16} /> Tambah guru</Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><BookOpen size={18} /></span><div><p className="text-xs text-[#706f70]">Total guru</p><p className="mt-1 text-lg font-bold text-[#353536]">{teachers.length}</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><Users size={18} /></span><div><p className="text-xs text-[#706f70]">Guru aktif</p><p className="mt-1 text-lg font-bold text-[#353536]">{activeCount}</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><CheckCircle2 size={18} /></span><div><p className="text-xs text-[#706f70]">Akun terhubung</p><p className="mt-1 text-lg font-bold text-[#353536]">{linkedCount} / {teachers.length}</p></div></div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4d8df] px-4 py-4 sm:px-6">
          <div><p className="text-sm font-bold text-[#353536]">Semua guru</p><p className="mt-1 text-xs text-[#706f70]">Status akun dicocokkan berdasarkan nama dan role guru.</p></div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 sm:w-72"><Search size={16} className="shrink-0 text-[#acadb1]" /><input className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#acadb1]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari guru" aria-label="Cari guru" /></label>
        </div>
        {loading && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Memuat data guru...</p>}
        {error && <p className="px-5 py-12 text-center text-sm text-red-700">{error}</p>}
        {!loading && !error && teachers.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Belum ada data guru.</p>}
        {!loading && !error && teachers.length > 0 && filteredTeachers.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Tidak ada guru yang cocok dengan pencarian.</p>}
        {!loading && !error && filteredTeachers.length > 0 && <>
          <div className="hidden overflow-x-auto sm:block"><table className="w-full min-w-[820px] text-left"><thead className="bg-[#ebedf1] text-[11px] font-semibold uppercase tracking-wide text-[#706f70]"><tr><th className="px-6 py-3">Guru</th><th className="px-4 py-3">Mata pelajaran</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Akun login</th><th className="px-6 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#d4d8df]">{filteredTeachers.map((teacher) => <tr className="text-sm" key={teacher._id}><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><UserRound size={17} /></span><strong className="font-semibold text-[#353536]">{teacher.name}</strong></div></td><td className="px-4 py-4 text-[#706f70]">{teacher.subject}</td><td className="px-4 py-4 text-[#706f70]">{teacher.classes}</td><td className="px-4 py-4"><AccountLinkStatus name={teacher.name} role="guru" accountExists={teacher.accountExists} accountEmail={teacher.accountEmail} subject={teacher.subject} major={teacher.major} /></td><td className="px-6 py-4"><span className={`inline-flex items-center gap-2 text-xs font-medium ${teacher.status === "Active" ? "text-[#39865a]" : "text-[#a66a1e]"}`}><span className={`h-1.5 w-1.5 rounded-full ${teacher.status === "Active" ? "bg-[#58a66d]" : "bg-[#d19b45]"}`} />{teacher.status === "Active" ? "Aktif" : "Cuti"}</span></td></tr>)}</tbody></table></div>
          <div className="divide-y divide-[#d4d8df] sm:hidden">{filteredTeachers.map((teacher) => <article className="flex items-start gap-3 px-4 py-4" key={teacher._id}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><UserRound size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#353536]">{teacher.name}</p><p className="mt-1 text-xs text-[#706f70]">{teacher.subject} · {teacher.classes}</p><div className="mt-2"><AccountLinkStatus name={teacher.name} role="guru" accountExists={teacher.accountExists} accountEmail={teacher.accountEmail} subject={teacher.subject} major={teacher.major} /></div><span className={`mt-2 inline-flex items-center gap-2 text-xs font-medium ${teacher.status === "Active" ? "text-[#39865a]" : "text-[#a66a1e]"}`}><span className={`h-1.5 w-1.5 rounded-full ${teacher.status === "Active" ? "bg-[#58a66d]" : "bg-[#d19b45]"}`} />{teacher.status === "Active" ? "Aktif" : "Cuti"}</span></div></article>)}</div>
        </>}
      </section>
    </AdminShell>
  );
}