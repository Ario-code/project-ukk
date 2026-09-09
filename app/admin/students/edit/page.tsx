"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../../AdminShell";

export default function EditStudentPage() {
  const router = useRouter();
  const [major, setMajor] = useState("");
  const [className, setClassName] = useState("");
  const [name, setName] = useState("");
  const [showNotification, setShowNotification] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (major.trim() && className.trim() && name.trim()) {
      setShowNotification(true);
      setTimeout(() => router.push("/admin/students"), 1500);
    }
  }

  return <AdminShell active="students">
    {showNotification && <div className="fixed right-6 top-5 z-50 flex w-[296px] items-start gap-3 rounded-xl border border-[#b8f0c7] bg-white px-4 py-4 shadow-[0_5px_16px_rgba(24,120,54,0.22)]" role="status"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#baffc7] text-sm font-bold text-[#0dce35]">✓</span><div className="min-w-0 flex-1 leading-tight"><p className="text-[14px] font-bold text-[#06a928]">Berhasil Nihh!</p><p className="mt-1 text-[12px] text-[#4d5157]">Perubahan berhasil disimpan</p></div><button className="text-xl leading-none text-[#4b4b4b]" type="button" aria-label="Tutup notifikasi" onClick={() => setShowNotification(false)}>×</button></div>}
    <div className="mx-auto max-w-[575px] rounded-lg border border-[#d6d9df] bg-white"><h1 className="flex items-center gap-3 border-b border-[#d6d9df] px-6 py-5 text-[18px] font-semibold"><span className="rounded-lg bg-[#e9eff8] p-2">♙+</span>Edit Murid</h1><form className="grid grid-cols-2 gap-5 p-6" onSubmit={handleSubmit}><label className="block text-[10px]">JURUSAN<select className="mt-2 h-9 w-full rounded border border-[#cbd0d7] bg-[#f7f8fa] px-3 text-[12px]" value={major} onChange={(event) => setMajor(event.target.value)} required><option value="">Pilih jurusan</option><option value="TKJ">TKJ</option><option value="MM">MM</option><option value="RPL">RPL</option></select></label><label className="block text-[10px]">KELAS (CLASS)<input className="mt-2 h-9 w-full rounded border border-[#cbd0d7] bg-[#f7f8fa] px-3 text-[12px]" value={className} onChange={(event) => setClassName(event.target.value)} required /></label><label className="col-span-2 block text-[10px]">NAMA LENGKAP (FULL NAME)<input className="mt-2 h-9 w-full rounded border border-[#cbd0d7] bg-[#f7f8fa] px-3 text-[12px]" placeholder="Enter student's full name" value={name} onChange={(event) => setName(event.target.value)} required /></label><div className="col-span-2 flex justify-end gap-3 border-t border-[#d6d9df] pt-5"><Link className="rounded border border-[#c94e4e] px-5 py-2 text-[11px] font-semibold text-[#c94e4e]" href="/admin/students">Cancel</Link><button className="rounded bg-[#168446] px-5 py-2 text-[11px] font-semibold text-white" type="submit">▣ Save Student</button></div></form></div>
  </AdminShell>;
}
