"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Student = { _id: string; nis: string; name: string; className: string; major: string; status: "Active" | "Inactive" };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data murid");
        setStudents(data.students);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  async function confirmDelete() {
    if (!studentToDelete) return;
    const response = await fetch(`/api/students/${studentToDelete._id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setActionError(data.message ?? "Gagal menghapus murid");
      return;
    }
    setStudents((currentStudents) => currentStudents.filter((student) => student._id !== studentToDelete._id));
    setStudentToDelete(null);
  }

  return <AdminShell active="students">
    {studentToDelete && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[2px]" role="presentation" onClick={() => setStudentToDelete(null)}><div className="w-full max-w-[432px] rounded-2xl bg-white px-12 pb-8 pt-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.18)]" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0d2d5] text-3xl text-[#a9000d]">!</div><h2 className="mt-5 text-[31px] font-bold tracking-[-1px]">Bener Mau di Hapus?</h2><p className="mt-1 text-[16px] text-[#8b8b8b]">Bener ni mau menghapus siswa?</p>{actionError && <p className="mt-3 text-xs text-red-600">{actionError}</p>}<div className="mt-5 grid grid-cols-2 gap-4"><button className="rounded-lg bg-[#292929] py-3 text-[13px] font-semibold text-white" type="button" onClick={() => setStudentToDelete(null)}>Tidak</button><button className="rounded-lg bg-[#ad000d] py-3 text-[13px] font-semibold text-white" type="button" onClick={confirmDelete}>▥ &nbsp; Ya</button></div></div></div>}
    <div className="mb-6 flex items-center justify-between"><h1 className="text-[25px] font-bold">Manage Students</h1><Link className="rounded-lg bg-[#168446] px-5 py-3 text-[11px] font-semibold text-white hover:bg-[#106d38]" href="/admin/students/new">♙+ &nbsp;Tambah Murid</Link></div>
    <section className="overflow-hidden rounded-lg border border-[#d6d9df] bg-white"><div className="grid grid-cols-[1.35fr_1.2fr_0.7fr_0.7fr_0.8fr_70px] bg-[#f3f4f6] px-5 py-4 text-[10px] font-semibold text-[#60656e]"><span>Nama Murid ↕</span><span>NISN</span><span>Jurusan</span><span>Kelas</span><span>Status</span><span>Edit</span></div>{loading && <p className="px-5 py-8 text-center text-sm text-slate-500">Memuat data murid...</p>}{error && <p className="px-5 py-8 text-center text-sm text-red-600">{error}</p>}{!loading && !error && students.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">Belum ada data murid.</p>}{students.map((student) => <div className="grid grid-cols-[1.35fr_1.2fr_0.7fr_0.7fr_0.8fr_70px] items-center border-t border-[#e1e3e7] px-5 py-4 text-[11px]" key={student._id}><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dce5ee] text-xs">👤</span><span><strong className="block">{student.name}</strong><small className="text-[#858991]">{student.name.toLowerCase().replaceAll(" ", ".")}@smlink.sch.id</small></span></span><span className="text-[#555b64]">{student.nis}</span><span><span className="rounded-full bg-[#dce6fb] px-3 py-1 text-[10px] text-[#526da7]">{student.major}</span></span><span className="text-[#555b64]">{student.className}</span><span className="text-[10px]"><span className={student.status === "Active" ? "text-[#202329]" : "text-[#858991]"}>● &nbsp;{student.status}</span></span><span className="flex gap-3 text-lg text-[#747a84]"><Link href={`/admin/students/edit?id=${student._id}`} aria-label={`Edit ${student.name}`}>⊞</Link><button type="button" aria-label={`Delete ${student.name}`} onClick={() => { setActionError(""); setStudentToDelete(student); }}>▱</button></span></div>)}</section>
  </AdminShell>;
}
