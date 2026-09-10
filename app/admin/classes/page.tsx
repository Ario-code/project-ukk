"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type SchoolClass = { _id: string; name: string; grade: "X" | "XI" | "XII"; major: string; homeroomTeacher: string; studentCount: number; room: string };

export default function ClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);

  async function confirmDelete() {
    if (!classToDelete) return;
    const response = await fetch(`/api/classes/${classToDelete._id}`, { method: "DELETE" });
    if (response.ok) {
      setClasses((currentClasses) => currentClasses.filter((schoolClass) => schoolClass._id !== classToDelete._id));
      setClassToDelete(null);
    }
  }

  useEffect(() => {
    fetch("/api/classes")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data kelas");
        setClasses(data.classes);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return <AdminShell active="classes">{classToDelete && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[2px]" onClick={() => setClassToDelete(null)}><div className="w-full max-w-[432px] rounded-2xl bg-white px-12 pb-8 pt-8 text-center shadow-xl" role="dialog" onClick={(event) => event.stopPropagation()}><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0d2d5] text-3xl text-[#a9000d]">!</div><h2 className="mt-5 text-[31px] font-bold">Bener Mau di Hapus?</h2><p className="mt-1 text-[16px] text-[#8b8b8b]">Bener ni mau menghapus kelas?</p><div className="mt-5 grid grid-cols-2 gap-4"><button className="rounded-lg bg-[#292929] py-3 text-white" type="button" onClick={() => setClassToDelete(null)}>Tidak</button><button className="rounded-lg bg-[#ad000d] py-3 text-white" type="button" onClick={confirmDelete}>▥ &nbsp; Ya</button></div></div></div>}<div className="mb-6 flex items-center justify-between"><h1 className="text-[25px] font-bold">Manage Classes</h1><Link className="rounded-lg bg-[#168446] px-5 py-3 text-[11px] font-semibold text-white hover:bg-[#106d38]" href="/admin/classes/new">＋ Buat Kelas Baru</Link></div>{loading && <p className="py-8 text-center text-sm text-slate-500">Memuat data kelas...</p>}{error && <p className="py-8 text-center text-sm text-red-600">{error}</p>}{!loading && !error && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{classes.map((schoolClass) => <article className="min-h-[215px] rounded-lg border border-[#d6d9df] bg-white p-5" key={schoolClass._id}><span className="rounded bg-[#e8eef8] px-2 py-1 text-[9px] font-semibold uppercase text-[#5f6b7e]">Grade {schoolClass.grade}</span><h2 className="mt-3 text-[20px] font-semibold">{schoolClass.name}</h2><p className="mt-4 min-h-[38px] text-[12px] font-semibold leading-tight">👤 &nbsp;{schoolClass.homeroomTeacher}</p><div className="mt-4 grid grid-cols-2 border-t border-[#e5e7eb] pt-3 text-[10px] text-[#777d86]"><span>STUDENTS<strong className="mt-1 block text-[12px] text-[#30343a]">♟ {schoolClass.studentCount}</strong></span><span>ROOM<strong className="mt-1 block text-[12px] text-[#30343a]">{schoolClass.room}</strong></span></div><div className="mt-3 flex gap-2 border-t pt-3 text-xs"><Link className="text-blue-700" href={`/admin/classes/edit?id=${schoolClass._id}`}>Edit</Link><button className="text-red-700" type="button" onClick={() => setClassToDelete(schoolClass)}>Hapus</button></div></article>)}<Link className="flex min-h-[215px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#cbd0d7] text-[#858b95] hover:bg-white" href="/admin/classes/new"><span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f4] text-2xl">＋</span><span className="text-[12px]">Tambah Kelas Baru</span></Link></div>}{!loading && !error && classes.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Belum ada data kelas.</p>}</AdminShell>;
}
