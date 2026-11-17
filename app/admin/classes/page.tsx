"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, School, Trash2, Users, X } from "lucide-react";
import AdminShell from "../AdminShell";
import AccountLinkStatus from "../AccountLinkStatus";

type SchoolClass = { _id: string; name: string; grade: "X" | "XI" | "XII"; major: string; homeroomTeacher: string; homeroomTeacherId?: string | null; homeroomTeacherAccountExists: boolean; homeroomTeacherAccountEmail: string | null; studentCount: number; room: string };

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
  const [query, setQuery] = useState("");

  async function confirmDelete() {
    if (!classToDelete) return;
    try {
      const response = await fetch(`/api/classes/${classToDelete._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setActionError(data.message ?? "Gagal menghapus kelas");
        return;
      }
      setClasses((currentClasses) => currentClasses.filter((item) => item._id !== classToDelete._id));
      setClassToDelete(null);
      setActionError("");
    } catch {
      setActionError("Server tidak dapat dihubungi");
    }
  }

  useEffect(() => {
    fetch("/api/classes")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data kelas");
        setClasses(data.classes ?? []);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredClasses = classes.filter((item) => `${item.name} ${item.grade} ${item.major} ${item.homeroomTeacher}`.toLowerCase().includes(query.toLowerCase()));
  const studentTotal = classes.reduce((total, item) => total + (item.studentCount || 0), 0);
  const linkedTeacherAccounts = classes.filter((item) => item.homeroomTeacherAccountExists).length;

  return (
    <AdminShell active="classes">
      {classToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#080808]/45 px-4 backdrop-blur-sm" role="presentation" onClick={() => setClassToDelete(null)}>
          <div className="w-full max-w-md rounded-xl border border-[#d4d8df] bg-white p-6 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="delete-class-title" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9e8e5] text-[#a34c3d]"><Trash2 size={19} /></span><button className="rounded-md p-1 text-[#706f70] hover:bg-[#ebedf1]" type="button" aria-label="Tutup" onClick={() => { setClassToDelete(null); setActionError(""); }}><X size={18} /></button></div>
            <h2 id="delete-class-title" className="mt-5 text-lg font-bold text-[#353536]">Hapus kelas {classToDelete.name}?</h2>
            <p className="mt-2 text-sm leading-6 text-[#706f70]">Data kelas akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.</p>
            {actionError && <p className="mt-3 text-sm text-red-700">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-3"><button className="rounded-lg border border-[#d4d8df] px-4 py-2.5 text-sm font-semibold text-[#706f70] hover:bg-[#ebedf1]" type="button" onClick={() => setClassToDelete(null)}>Batal</button><button className="rounded-lg bg-[#a34539] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#873a31]" type="button" onClick={confirmDelete}>Hapus kelas</button></div>
          </div>
        </div>
      )}

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#706f70]">Struktur akademik</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Data kelas</h1><p className="mt-2 text-sm text-[#706f70]">Kelola rombongan belajar, wali kelas, dan kapasitasnya.</p></div>
        <Link className="inline-flex items-center gap-2 rounded-lg bg-[#168446] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106d38]" href="/admin/classes/new"><Plus size={16} /> Buat kelas</Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><School size={18} /></span><div><p className="text-xs text-[#706f70]">Jumlah kelas</p><p className="mt-1 text-lg font-bold text-[#353536]">{classes.length}</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><Users size={18} /></span><div><p className="text-xs text-[#706f70]">Total kapasitas murid</p><p className="mt-1 text-lg font-bold text-[#353536]">{studentTotal}</p></div></div>
        <div className="flex items-center gap-3 rounded-lg border border-[#d4d8df] bg-white px-4 py-4"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><Users size={18} /></span><div><p className="text-xs text-[#706f70]">Wali kelas berakun</p><p className="mt-1 text-lg font-bold text-[#353536]">{linkedTeacherAccounts} / {classes.length}</p></div></div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4d8df] px-4 py-4 sm:px-6">
          <div><p className="text-sm font-bold text-[#353536]">Semua kelas</p><p className="mt-1 text-xs text-[#706f70]">Cari berdasarkan kelas, jurusan, atau wali kelas.</p></div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 sm:w-72"><Search size={16} className="shrink-0 text-[#acadb1]" /><input className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#acadb1]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari kelas" aria-label="Cari kelas" /></label>
        </div>
        {loading && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Memuat data kelas...</p>}
        {error && <p className="px-5 py-12 text-center text-sm text-red-700">{error}</p>}
        {!loading && !error && classes.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Belum ada kelas. Buat kelas pertama untuk memulai.</p>}
        {!loading && !error && classes.length > 0 && filteredClasses.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Tidak ada kelas yang cocok dengan pencarian.</p>}
        {!loading && !error && filteredClasses.length > 0 && <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3 sm:p-6">
          {filteredClasses.map((item) => <article className="rounded-lg border border-[#d4d8df] bg-white p-4 transition hover:border-[#acadb1]" key={item._id}>
            <div className="flex items-start justify-between gap-3"><span className="rounded-md bg-[#d4d8df] px-2.5 py-1 text-xs font-semibold text-[#353536]">Kelas {item.grade}</span><button className="rounded-md p-2 text-[#9b5b50] hover:bg-[#f9e8e5]" type="button" aria-label={`Hapus kelas ${item.name}`} onClick={() => { setActionError(""); setClassToDelete(item); }}><Trash2 size={16} /></button></div>
            <h2 className="mt-4 text-lg font-bold text-[#353536]">{item.name}</h2><p className="mt-1 text-sm text-[#706f70]">Jurusan {item.major}</p>
            <div className="mt-5 space-y-3 border-t border-[#d4d8df] pt-4 text-xs text-[#706f70]"><p><span className="font-semibold text-[#353536]">Wali kelas</span><span className="float-right text-right">{item.homeroomTeacher}</span></p><p><span className="font-semibold text-[#353536]">Ruang</span><span className="float-right">{item.room || "Belum diatur"}</span></p><p><span className="font-semibold text-[#353536]">Kapasitas</span><span className="float-right">{item.studentCount} murid</span></p><div className="border-t border-[#d4d8df] pt-3"><p className="mb-2 font-semibold text-[#353536]">Akun wali kelas</p><AccountLinkStatus name={item.homeroomTeacher} role="guru" accountExists={item.homeroomTeacherAccountExists} accountEmail={item.homeroomTeacherAccountEmail} /></div></div>
          </article>)}
        </div>}
      </section>
    </AdminShell>
  );
}