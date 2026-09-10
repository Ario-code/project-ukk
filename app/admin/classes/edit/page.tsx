"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../../AdminShell";

const majors = ["PPLG", "DKV", "BDR", "MPLB", "PH", "TJKT"];

export default function EditClassPage() {
  const router = useRouter();
  const [classId, setClassId] = useState("");
  const [grade, setGrade] = useState("X");
  const [major, setMajor] = useState("");
  const [homeroomTeacher, setHomeroomTeacher] = useState("");
  const [studentCount, setStudentCount] = useState("");
  const [room, setRoom] = useState("-");
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) { setError("ID kelas tidak ditemukan"); return; }
    setClassId(id);
    fetch(`/api/classes/${id}`).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data kelas");
      setGrade(data.schoolClass.grade);
      setMajor(data.schoolClass.major);
      setHomeroomTeacher(data.schoolClass.homeroomTeacher);
      setStudentCount(String(data.schoolClass.studentCount));
      setRoom(data.schoolClass.room);
    }).catch((requestError: Error) => setError(requestError.message));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`/api/classes/${classId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grade, major, homeroomTeacher, studentCount, room }) });
      const data = await response.json();
      if (!response.ok) { setError(data.message ?? "Gagal memperbarui kelas"); return; }
      setShowNotification(true);
      setTimeout(() => router.push("/admin/classes"), 1500);
    } catch { setError("Server tidak dapat dihubungi"); }
  }

  return <AdminShell active="classes">
    {showNotification && <div className="fixed right-6 top-5 z-50 flex w-[296px] items-start gap-3 rounded-xl border border-[#b8f0c7] bg-white px-4 py-4 shadow-[0_5px_16px_rgba(24,120,54,0.22)]" role="status"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#baffc7] text-sm font-bold text-[#0dce35]">✓</span><div className="min-w-0 flex-1 leading-tight"><p className="text-[14px] font-bold text-[#06a928]">Berhasil Nihh!</p><p className="mt-1 text-[12px] text-[#4d5157]">Perubahan berhasil disimpan</p></div></div>}
    <div className="mx-auto max-w-[575px] rounded-lg border border-[#d6d9df] bg-white p-6"><form className="space-y-5" onSubmit={handleSubmit}><div><label className="block text-[11px] font-semibold uppercase tracking-wide text-[#60656e]">Kelas Berapa</label><div className="mt-2 flex gap-2">{["X", "XI", "XII"].map((level) => <button className={`h-10 w-[68px] rounded-lg border text-[12px] font-semibold ${grade === level ? "border-[#05091b] bg-[#05091b] text-white" : "border-[#d6d9df] bg-white text-[#30343a]"}`} type="button" key={level} onClick={() => setGrade(level)}>{level}</button>)}</div></div><label className="block text-[11px] font-semibold uppercase tracking-wide text-[#60656e]">Jurusan<select className="mt-2 h-10 w-full rounded border border-[#cbd0d7] bg-white px-3 text-[12px]" value={major} onChange={(event) => setMajor(event.target.value)} required><option value="">Select</option>{majors.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label className="block text-[11px] font-semibold uppercase tracking-wide text-[#60656e]">Wali Kelas<input className="mt-2 h-10 w-full rounded border border-[#cbd0d7] bg-white px-3 text-[12px]" value={homeroomTeacher} onChange={(event) => setHomeroomTeacher(event.target.value)} required /></label><label className="block text-[11px] font-semibold uppercase tracking-wide text-[#60656e]">Berapa Murid<input className="mt-2 h-10 w-full rounded border border-[#cbd0d7] bg-white px-3 text-[12px]" type="number" min="1" value={studentCount} onChange={(event) => setStudentCount(event.target.value)} required /></label>{error && <p className="rounded bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</p>}<div className="flex justify-end gap-3 border-t border-[#d6d9df] pt-5"><Link className="rounded border border-[#c94e4e] px-5 py-2 text-[11px] font-semibold text-[#c94e4e]" href="/admin/classes">Cancel</Link><button className="rounded bg-[#168446] px-5 py-2 text-[11px] font-semibold text-white" type="submit" disabled={!classId}>⊙ Simpan Perubahan</button></div></form></div>
  </AdminShell>;
}
