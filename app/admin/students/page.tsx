"use client";

import Link from "next/link";
import { useState } from "react";
import AdminShell from "../AdminShell";

type Student = { name: string; nisn: string; major: string; className: string; status: string };

const initialStudents: Student[] = [
  { name: "Aditya Pratama", nisn: "0054218902", major: "TKJ", className: "XII - A", status: "Active" },
  { name: "Siti Rahmawati", nisn: "0067123455", major: "MM", className: "XI - B", status: "Active" },
  { name: "Budi Santoso", nisn: "0058821430", major: "RPL", className: "XII - C", status: "Inactive" },
  { name: "Dewi Lestari", nisn: "0071298450", major: "TKJ", className: "X - A", status: "Active" },
  { name: "Eko Prasetyo", nisn: "0059928173", major: "MM", className: "XII - D", status: "Active" },
];

export default function StudentsPage() {
  const [students, setStudents] = useState(initialStudents);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  function confirmDelete() {
    if (studentToDelete) {
      setStudents((currentStudents) => currentStudents.filter((student) => student.nisn !== studentToDelete.nisn));
      setStudentToDelete(null);
    }
  }

  return (
    <AdminShell active="students">
      {studentToDelete && <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/25 px-4 backdrop-blur-[2px]" role="presentation" onClick={() => setStudentToDelete(null)}><div className="w-full max-w-[432px] rounded-2xl bg-white px-12 pb-8 pt-8 text-center shadow-[0_18px_40px_rgba(15,23,42,0.18)]" role="dialog" aria-modal="true" aria-labelledby="delete-title" onClick={(event) => event.stopPropagation()}><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f0d2d5] text-3xl text-[#a9000d]">!</div><h2 className="mt-5 text-[31px] font-bold tracking-[-1px]" id="delete-title">Bener Mau di Hapus?</h2><p className="mt-1 text-[16px] text-[#8b8b8b]">Bener ni mau menghapus siswa?</p><div className="mt-5 grid grid-cols-2 gap-4"><button className="rounded-lg bg-[#292929] py-3 text-[13px] font-semibold text-white hover:bg-[#1f1f1f]" type="button" onClick={() => setStudentToDelete(null)}>Tidak</button><button className="rounded-lg bg-[#ad000d] py-3 text-[13px] font-semibold text-white shadow-[0_4px_12px_rgba(173,0,13,0.35)] hover:bg-[#92000b]" type="button" onClick={confirmDelete}>▥ &nbsp; Ya</button></div></div></div>}
      <div className="mb-6 flex items-center justify-between"><h1 className="text-[25px] font-bold">Manage Students</h1><Link className="rounded-lg bg-[#168446] px-5 py-3 text-[11px] font-semibold text-white hover:bg-[#106d38]" href="/admin/students/new">♙+ &nbsp;Tambah Murid</Link></div>
      <section className="overflow-hidden rounded-lg border border-[#d6d9df] bg-white">
        <div className="grid grid-cols-[1.35fr_1.2fr_0.7fr_0.7fr_0.8fr_70px] bg-[#f3f4f6] px-5 py-4 text-[10px] font-semibold text-[#60656e]"><span>Student Name ↕</span><span>Student ID (NISN)</span><span>Jurusan</span><span>Kelas</span><span>Status</span><span>Actions</span></div>
        {students.map((student) => <div className="grid grid-cols-[1.35fr_1.2fr_0.7fr_0.7fr_0.8fr_70px] items-center border-t border-[#e1e3e7] px-5 py-4 text-[11px]" key={student.nisn}><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dce5ee] text-xs">👤</span><span><strong className="block">{student.name}</strong><small className="text-[#858991]">{student.name.toLowerCase().replaceAll(" ", ".")}@smlink.sch.id</small></span></span><span className="text-[#555b64]">{student.nisn}</span><span><span className="rounded-full bg-[#dce6fb] px-3 py-1 text-[10px] text-[#526da7]">{student.major}</span></span><span className="text-[#555b64]">{student.className}</span><span className="text-[10px]"><span className={student.status === "Active" ? "text-[#202329]" : "text-[#858991]"}>● &nbsp;{student.status}</span></span><span className="flex gap-3 text-lg text-[#747a84]"><Link href="/admin/students/edit" aria-label={`Edit ${student.name}`}>⊞</Link><button type="button" aria-label={`Delete ${student.name}`} onClick={() => setStudentToDelete(student)}>▱</button></span></div>)}
        <div className="flex justify-end gap-2 border-t border-[#d6d9df] bg-[#f5f6f8] px-5 py-3"><button className="rounded border border-[#d6d9df] bg-white px-3 py-1">‹</button><button className="rounded bg-[#100b32] px-3 py-1 text-white">1</button><button className="rounded border border-[#d6d9df] bg-white px-3 py-1">2</button><button className="rounded border border-[#d6d9df] bg-white px-3 py-1">…</button><button className="rounded border border-[#d6d9df] bg-white px-3 py-1">›</button></div>
      </section>
    </AdminShell>
  );
}
