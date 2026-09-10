"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../../AdminShell";

export default function NewTeacherPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [classes, setClasses] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, classes }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Gagal menyimpan guru");
        return;
      }

      setShowNotification(true);
      setTimeout(() => router.push("/admin/teachers"), 1500);
    } catch {
      setError("Server tidak dapat dihubungi");
    }
  }

  return (
    <AdminShell active="teachers">
      {showNotification && (
        <div className="fixed right-6 top-5 z-50 flex w-[296px] items-start gap-3 rounded-xl border border-[#b8f0c7] bg-white px-4 py-4 shadow-[0_5px_16px_rgba(24,120,54,0.22)]" role="status">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#baffc7] text-sm font-bold text-[#0dce35]">✓</span>
          <div className="min-w-0 flex-1 leading-tight"><p className="text-[14px] font-bold text-[#06a928]">Berhasil Nihh!</p><p className="mt-1 text-[12px] text-[#4d5157]">Penambahan Guru Berhasil</p></div>
          <button className="text-xl leading-none text-[#4b4b4b] hover:text-black" type="button" aria-label="Tutup notifikasi" onClick={() => setShowNotification(false)}>×</button>
        </div>
      )}
      <div className="mx-auto max-w-[575px] rounded-lg border border-[#d6d9df] bg-white">
        <h1 className="border-b border-[#d6d9df] px-6 py-5 text-[18px] font-semibold">Add New Teacher</h1>
        <form className="space-y-5 p-6" onSubmit={handleSubmit}>
          <label className="block text-[10px]">Nama Guru (Full Name with Titles)<input className="mt-2 h-9 w-full rounded border border-[#cbd0d7] bg-[#f7f8fa] px-3 text-[12px]" value={name} onChange={(event) => setName(event.target.value)} placeholder="Dr. Ahmad Subagjo, M.Pd" required /></label>
          <label className="block text-[10px]">Mata Pelajaran (Subject Assignment)<input className="mt-2 h-9 w-full rounded border border-[#cbd0d7] bg-[#f7f8fa] px-3 text-[12px]" value={subject} onChange={(event) => setSubject(event.target.value)} required /></label>
          <label className="block text-[10px]">Kelas (Assigned Classes)<input className="mt-2 h-9 w-full rounded border border-[#cbd0d7] bg-[#f7f8fa] px-3 text-[12px]" value={classes} onChange={(event) => setClasses(event.target.value)} required /></label>
          {error && <p className="rounded bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</p>}
          <div className="flex justify-end gap-3 border-t border-[#d6d9df] pt-5"><Link className="rounded border border-[#c94e4e] px-5 py-2 text-[11px] font-semibold text-[#c94e4e]" href="/admin/teachers">Cancel</Link><button className="rounded bg-[#168446] px-5 py-2 text-[11px] font-semibold text-white hover:bg-[#106d38]" type="submit">Save Teacher</button></div>
        </form>
      </div>
    </AdminShell>
  );
}