"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AdminShell from "../../AdminShell";

const majors = ["PPLG", "DKV", "BDR", "MPLB", "PH", "TJKT"];
const fallbackClassOptions = ["X - PPLG", "XI - PPLG", "XII - PPLG", "X - DKV", "XI - DKV", "XII - DKV", "X - MPLB", "XI - MPLB", "XII - MPLB"];

export default function NewStudentPage() {
  const router = useRouter();
  const [nis, setNis] = useState("");
  const [className, setClassName] = useState("");
  const [major, setMajor] = useState("");
  const [name, setName] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");
  const [classOptions, setClassOptions] = useState<string[]>(fallbackClassOptions);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const response = await fetch("/api/classes");
        if (!response.ok) return;
        const data = await response.json();
        const classes = Array.isArray(data?.classes) ? data.classes : [];
        const nextOptions = classes
          .map((item: { name?: string }) => item.name)
          .filter((value: unknown): value is string => typeof value === "string" && Boolean(value.trim()));
        if (nextOptions.length > 0) setClassOptions(nextOptions);
      } catch {
        return;
      }
    }
    fetchClasses();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nis, name, className, major }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "Gagal menyimpan murid");
        return;
      }
      setShowNotification(true);
      setTimeout(() => router.push("/admin/students"), 1500);
    } catch {
      setError("Server tidak dapat dihubungi");
    }
  }

  return (
    <AdminShell active="students">
      {showNotification && <div className="fixed right-5 top-5 z-50 rounded-lg border border-[#c8dfcb] bg-white px-4 py-3 text-sm font-semibold text-[#28734f] shadow-lg" role="status">Data murid berhasil ditambahkan</div>}
      <div className="mx-auto max-w-3xl">
        <Link className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#706f70] transition hover:text-[#353536]" href="/admin/students"><ArrowLeft size={16} /> Kembali ke murid</Link>
        <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#706f70]">Direktori akademik</p><h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Tambah murid</h1><p className="mt-2 text-sm text-[#706f70]">Masukkan identitas dan penempatan kelas murid.</p></div>
        <form className="rounded-lg border border-[#d4d8df] bg-white p-6 shadow-sm sm:p-8" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-[#706f70]">NIS<input className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]" value={nis} onChange={(event) => setNis(event.target.value)} required /></label>
            <label className="block text-xs font-semibold text-[#706f70]">Nama lengkap<input className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap murid" required /></label>
            <label className="block text-xs font-semibold text-[#706f70]">Kelas<select className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]" value={className} onChange={(event) => setClassName(event.target.value)} required><option value="">Pilih kelas</option>{classOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
            <label className="block text-xs font-semibold text-[#706f70]">Jurusan<select className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]" value={major} onChange={(event) => setMajor(event.target.value)} required><option value="">Pilih jurusan</option>{majors.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          </div>
          {error && <p className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <div className="mt-7 flex justify-end gap-3 border-t border-[#d4d8df] pt-5"><Link className="rounded-lg border border-[#d4d8df] px-5 py-2.5 text-sm font-semibold text-[#706f70] transition hover:bg-[#ebedf1]" href="/admin/students">Batal</Link><button className="rounded-lg bg-[#168446] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106d38]" type="submit">Simpan murid</button></div>
        </form>
      </div>
    </AdminShell>
  );
}