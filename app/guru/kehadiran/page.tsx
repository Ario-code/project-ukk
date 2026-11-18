"use client";

import { useEffect, useState } from "react";
import GuruShell from "../GuruShell";

type Student = { _id: string; name: string };
type AttendanceRecord = { studentId: string; studentName: string; status: string };
const statuses = ["Hadir", "Izin", "Sakit", "Alpa"];

export default function AttendancePage() {
  const [classNames, setClassNames] = useState<string[]>([]);
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const statusCounts = statuses.map((status) => ({
    status,
    count: records.filter((record) => record.status === status).length,
  }));

  useEffect(() => {
    fetch("/api/students").then((r) => r.json()).then((d) => {
      if (!d.success) throw new Error(d.message);
      const names = [...new Set<string>((d.students ?? []).map((s: { className: string }) => s.className))].sort();
      setClassNames(names);
      if (names[0]) setClassName(names[0]);
    }).catch((e: Error) => setError(e.message || "Gagal memuat kelas"));
  }, []);

  useEffect(() => {
    if (!className || !date) return;
    fetch(`/api/attendance?className=${encodeURIComponent(className)}&date=${date}`).then((r) => r.json()).then((d) => {
      if (!d.success) throw new Error(d.message);
      const saved = new Map<string, string>((d.attendance?.records ?? []).map((r: AttendanceRecord) => [r.studentId, r.status]));
      setRecords((d.students ?? []).map((s: Student) => ({ studentId: s._id, studentName: s.name, status: saved.get(s._id) ?? "Hadir" })));
    }).catch((e: Error) => setError(e.message || "Gagal memuat murid"));
  }, [className, date]);

  async function save() {
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/attendance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ className, date, records }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Gagal menyimpan absensi");
      setMessage("Absensi tersimpan.");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan absensi"); }
    finally { setBusy(false); }
  }

  return <GuruShell><div className="mx-auto max-w-4xl"><h1 className="mb-6 text-3xl font-bold">Kehadiran</h1>
    <div className="mb-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Kelas<select className="mt-1 h-11 w-full rounded-lg border px-3" value={className} onChange={(e) => setClassName(e.target.value)}>{classNames.map((name) => <option key={name}>{name}</option>)}</select></label><label className="text-sm font-semibold">Tanggal<input className="mt-1 h-11 w-full rounded-lg border px-3" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label></div>
    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{statusCounts.map(({ status, count }) => <div key={status} className="rounded-xl border bg-white p-4"><p className="text-sm text-slate-500">{status}</p><p className="mt-1 text-2xl font-bold text-slate-900">{count}</p></div>)}</div>
    <div className="overflow-hidden rounded-xl border bg-white">{records.map((record, i) => <div key={record.studentId} className="flex flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0"><span className="font-medium">{record.studentName}</span><select className="rounded-lg border px-3 py-2" value={record.status} onChange={(e) => setRecords((all) => all.map((item, index) => index === i ? { ...item, status: e.target.value } : item))}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>)}{!records.length && <p className="p-5 text-sm text-slate-500">Belum ada murid di kelas ini.</p>}</div>
    {error && <p className="mt-3 text-sm text-red-700">{error}</p>}{message && <p className="mt-3 text-sm text-green-700">{message}</p>}<button disabled={busy || !records.length} onClick={save} className="mt-4 rounded-lg bg-[#168446] px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Menyimpan..." : "Simpan kehadiran"}</button>
  </div></GuruShell>;
}
