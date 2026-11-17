"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminShell from "../../AdminShell";

const majors = ["PPLG", "DKV", "BDR", "MPLB", "PH", "TJKT"];

export default function NewClassPage() {
  const router = useRouter();
  const [grade, setGrade] = useState("X");
  const [major, setMajor] = useState("");
  const [homeroomTeacher, setHomeroomTeacher] = useState("");
  const [studentCount, setStudentCount] = useState("36");
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade, major, homeroomTeacher, studentCount }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "Gagal menyimpan kelas");
        return;
      }
      setShowNotification(true);
      setTimeout(() => router.push("/admin/classes"), 1500);
    } catch {
      setError("Server tidak dapat dihubungi");
    }
  }

  return (
    <AdminShell active="classes">
      {showNotification && <div className="fixed right-5 top-5 z-50 rounded-lg border border-[#c8dfcb] bg-white px-4 py-3 text-sm font-semibold text-[#28734f] shadow-lg" role="status">Kelas berhasil dibuat</div>}
      <div className="mx-auto max-w-3xl">
        <Link className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#706f70] transition hover:text-[#353536]" href="/admin/classes"><ArrowLeft size={16} /> Kembali ke kelas</Link>
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#706f70]">Struktur akademik</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Buat kelas baru</h1><p className="mt-2 text-sm text-[#706f70]">Lengkapi informasi rombongan belajar dan wali kelas.</p></div>
        <form className="rounded-lg border border-[#d4d8df] bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <fieldset className="sm:col-span-2"><legend className="text-xs font-semibold text-[#706f70]">Tingkat kelas</legend><div className="mt-2 inline-flex rounded-lg border border-[#d4d8df] bg-[#ebedf1] p-1">{["X", "XI", "XII"].map((level) => <button className={`min-w-16 rounded-md px-4 py-2 text-sm font-semibold transition ${grade === level ? "bg-[#353536] text-white shadow-sm" : "text-[#706f70] hover:bg-white"}`} type="button" key={level} onClick={() => setGrade(level)} aria-pressed={grade === level}>{level}</button>)}</div></fieldset>
            <label className="block text-xs font-semibold text-[#706f70]">Jurusan<select className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]" value={major} onChange={(event) => setMajor(event.target.value)} required><option value="">Pilih jurusan</option>{majors.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
            <label className="block text-xs font-semibold text-[#706f70]">Jumlah murid<input className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]" type="number" min="1" value={studentCount} onChange={(event) => setStudentCount(event.target.value)} required /></label>
            <label className="block text-xs font-semibold text-[#706f70] sm:col-span-2">Wali kelas<input className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]" value={homeroomTeacher} onChange={(event) => setHomeroomTeacher(event.target.value)} placeholder="Masukkan nama wali kelas" required /></label>
          </div>
          {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="mt-7 flex justify-end gap-3 border-t border-[#d4d8df] pt-5"><Link className="rounded-lg border border-[#d4d8df] px-5 py-2.5 text-sm font-semibold text-[#706f70] transition hover:bg-[#ebedf1]" href="/admin/classes">Batal</Link><button className="rounded-lg bg-[#168446] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106d38]" type="submit">Simpan kelas</button></div>
        </form>
      </div>
    </AdminShell>
  );
}