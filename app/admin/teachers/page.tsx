"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AdminShell from "../AdminShell";

type Teacher = { _id: string; name: string; subject: string; classes: string; status: "Active" | "Leave" };

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teachers")
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data guru");
        setTeachers(data.teachers);
      })
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return <AdminShell active="teachers"><div className="mb-6 flex items-center justify-between"><h1 className="text-[25px] font-bold">Manage Teachers</h1><Link className="rounded-lg bg-[#168446] px-5 py-3 text-[11px] font-semibold text-white hover:bg-[#106d38]" href="/admin/teachers/new">＋ Tambah Guru</Link></div><div className="mb-5 grid gap-5 md:grid-cols-2"><div className="rounded-lg border border-[#d6d9df] bg-white p-4"><p className="text-[10px] uppercase tracking-wider text-[#737983]">Total teachers</p><p className="mt-1 text-[27px] font-bold">{teachers.length}</p><span className="float-right -mt-10 rounded-lg bg-[#e9eff8] p-3">♙</span></div><div className="rounded-lg border border-[#d6d9df] bg-white p-4"><p className="text-[10px] uppercase tracking-wider text-[#737983]">Active status</p><p className="mt-1 text-[27px] font-bold">{teachers.filter((teacher) => teacher.status === "Active").length}</p><span className="float-right -mt-10 rounded-lg bg-[#d9f8e8] p-3 text-green-700">✓</span></div></div><section className="overflow-hidden rounded-lg border border-[#d6d9df] bg-white"><div className="grid grid-cols-[1.4fr_1fr_1fr_100px] bg-[#f3f4f6] px-5 py-4 text-[10px] font-semibold text-[#60656e]"><span>Teacher Name</span><span>Subject</span><span>Assigned Classes</span><span>Status</span></div>{loading && <p className="px-5 py-8 text-center text-sm text-slate-500">Memuat data guru...</p>}{error && <p className="px-5 py-8 text-center text-sm text-red-600">{error}</p>}{!loading && !error && teachers.length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">Belum ada data guru.</p>}{teachers.map((teacher) => <div className="grid grid-cols-[1.4fr_1fr_1fr_100px] items-center border-t border-[#e1e3e7] px-5 py-4 text-[11px]" key={teacher._id}><span className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dce5ee] text-xs">👤</span><span><strong className="block">{teacher.name}</strong><small className="text-[#858991]">{teacher.subject}</small></span></span><span>{teacher.subject}</span><span className="whitespace-pre-line">{teacher.classes}</span><span><span className={`rounded-full px-3 py-1 text-[10px] ${teacher.status === "Active" ? "bg-[#e0f9eb] text-[#219653]" : "bg-[#ffe7e7] text-[#d34b4b]"}`}>• {teacher.status}</span></span></div>)}</section></AdminShell>;
}
