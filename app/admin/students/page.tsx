"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GraduationCap, Pencil, Plus, Search, Trash2, UserRound, Users, X } from "lucide-react";
import AdminShell from "../AdminShell";
import AccountLinkStatus from "../AccountLinkStatus";

type Student = { _id: string; nis: string; name: string; className: string; major: string; status: "Active" | "Inactive"; accountExists: boolean; accountEmail: string | null };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data murid");
        setStudents(data.students ?? []);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function confirmDelete() {
    if (!studentToDelete) return;
    try {
      const response = await fetch(`/api/students/${studentToDelete._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setActionError(data.message ?? "Gagal menghapus murid");
        return;
      }
      setStudents((currentStudents) => currentStudents.filter((student) => student._id !== studentToDelete._id));
      setStudentToDelete(null);
      setActionError("");
    } catch {
      setActionError("Server tidak dapat dihubungi");
    }
  }

  const filteredStudents = students.filter((student) => `${student.name} ${student.nis} ${student.className} ${student.major}`.toLowerCase().includes(query.toLowerCase()));
  const activeCount = students.filter((student) => student.status === "Active").length;
  const linkedAccountCount = students.filter((student) => student.accountExists).length;

  return (
    <AdminShell active="students">
      {studentToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#080808]/45 px-4 backdrop-blur-sm" role="presentation" onClick={() => setStudentToDelete(null)}>
          <div className="w-full max-w-md rounded-xl border border-[#d4d8df] bg-white p-6 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="delete-student-title" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9e8e5] text-[#a34c3d]"><Trash2 size={19} /></span><button className="rounded-md p-1 text-[#706f70] hover:bg-[#ebedf1]" type="button" aria-label="Tutup" onClick={() => { setStudentToDelete(null); setActionError(""); }}><X size={18} /></button></div>
            <h2 id="delete-student-title" className="mt-5 text-lg font-bold text-[#353536]">Hapus data murid?</h2>
            <p className="mt-2 text-sm leading-6 text-[#706f70]">Data <strong className="font-semibold text-[#706f70]">{studentToDelete.name}</strong> akan dihapus dari sistem.</p>
            {actionError && <p className="mt-3 text-sm text-red-700">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-3"><button className="rounded-lg border border-[#d4d8df] px-4 py-2.5 text-sm font-semibold text-[#706f70] hover:bg-[#ebedf1]" type="button" onClick={() => { setStudentToDelete(null); setActionError(""); }}>Batal</button><button className="rounded-lg bg-[#a34539] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#873a31]" type="button" onClick={confirmDelete}>Hapus murid</button></div>
          </div>
        </div>
      )}

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#706f70]">Direktori akademik</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Data murid</h1><p className="mt-2 text-sm text-[#706f70]">Kelola identitas, kelas, dan status murid.</p></div>
        <Link className="inline-flex items-center gap-2 rounded-lg bg-[#168446] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106d38]" href="/admin/students/new"><Plus size={16} /> Tambah murid</Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><GraduationCap size={18} /></span><div><p className="text-xs text-[#706f70]">Total murid</p><p className="mt-1 text-lg font-bold text-[#353536]">{students.length}</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><Users size={18} /></span><div><p className="text-xs text-[#706f70]">Murid aktif</p><p className="mt-1 text-lg font-bold text-[#353536]">{activeCount}</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><UserRound size={18} /></span><div><p className="text-xs text-[#706f70]">Akun terhubung</p><p className="mt-1 text-lg font-bold text-[#353536]">{linkedAccountCount} / {students.length}</p></div></div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4d8df] px-4 py-4 sm:px-6">
          <div><p className="text-sm font-bold text-[#353536]">Semua murid</p><p className="mt-1 text-xs text-[#706f70]">Cari nama, NIS, kelas, atau jurusan.</p></div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 sm:w-72"><Search size={16} className="shrink-0 text-[#acadb1]" /><input className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#acadb1]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari murid" aria-label="Cari murid" /></label>
        </div>
        {loading && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Memuat data murid...</p>}
        {error && <p className="px-5 py-12 text-center text-sm text-red-700">{error}</p>}
        {!loading && !error && students.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Belum ada data murid.</p>}
        {!loading && !error && students.length > 0 && filteredStudents.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Tidak ada murid yang cocok dengan pencarian.</p>}
        {!loading && !error && filteredStudents.length > 0 && <>
          <div className="hidden overflow-x-auto sm:block"><table className="w-full min-w-[820px] text-left"><thead className="bg-[#ebedf1] text-[11px] font-semibold uppercase tracking-wide text-[#706f70]"><tr><th className="px-6 py-3">Murid</th><th className="px-4 py-3">NIS</th><th className="px-4 py-3">Kelas / Jurusan</th><th className="px-4 py-3">Status</th><th className="px-6 py-3 text-right">Aksi</th></tr></thead><tbody className="divide-y divide-[#d4d8df]">{filteredStudents.map((student) => <tr className="text-sm" key={student._id}><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><UserRound size={17} /></span><span><strong className="block font-semibold text-[#353536]">{student.name}</strong><span className="mt-1 block"><AccountLinkStatus name={student.name} role="murid" accountExists={student.accountExists} accountEmail={student.accountEmail} /></span></span></div></td><td className="px-4 py-4 text-[#706f70]">{student.nis}</td><td className="px-4 py-4"><p className="font-medium text-[#706f70]">{student.className}</p><p className="mt-1 text-xs text-[#706f70]">{student.major}</p></td><td className="px-4 py-4"><span className={`inline-flex items-center gap-2 text-xs font-medium ${student.status === "Active" ? "text-[#39865a]" : "text-[#89938d]"}`}><span className={`h-1.5 w-1.5 rounded-full ${student.status === "Active" ? "bg-[#58a66d]" : "bg-[#aab2ad]"}`} />{student.status === "Active" ? "Aktif" : "Tidak aktif"}</span></td><td className="px-6 py-4"><div className="flex justify-end gap-1"><Link className="rounded-md p-2 text-[#706f70] hover:bg-[#ebedf1] hover:text-[#353536]" href={`/admin/students/edit?id=${student._id}`} aria-label={`Edit ${student.name}`} title="Edit murid"><Pencil size={16} /></Link><button className="rounded-md p-2 text-[#9b5b50] hover:bg-[#f9e8e5]" type="button" aria-label={`Hapus ${student.name}`} title="Hapus murid" onClick={() => { setActionError(""); setStudentToDelete(student); }}><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div>
          <div className="divide-y divide-[#d4d8df] sm:hidden">{filteredStudents.map((student) => <article className="flex items-start justify-between gap-3 px-4 py-4" key={student._id}><div className="flex min-w-0 items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><UserRound size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#353536]">{student.name}</p><div className="mt-1"><AccountLinkStatus name={student.name} role="murid" accountExists={student.accountExists} accountEmail={student.accountEmail} /></div><p className="mt-1 text-xs text-[#706f70]">NIS {student.nis} · {student.className}</p><p className="mt-1 text-xs text-[#706f70]">{student.major}</p></div></div><div className="flex shrink-0 gap-1"><Link className="rounded-md p-2 text-[#706f70] hover:bg-[#ebedf1]" href={`/admin/students/edit?id=${student._id}`} aria-label={`Edit ${student.name}`}><Pencil size={16} /></Link><button className="rounded-md p-2 text-[#9b5b50] hover:bg-[#f9e8e5]" type="button" aria-label={`Hapus ${student.name}`} onClick={() => { setActionError(""); setStudentToDelete(student); }}><Trash2 size={16} /></button></div></article>)}</div>
        </>}
      </section>
    </AdminShell>
  );
}