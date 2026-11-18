"use client";

import { FormEvent, useEffect, useState } from "react";
import GuruShell from "../GuruShell";

type Student = { _id: string; name: string; className: string };
type Grade = { _id: string; studentName: string; className: string; assessmentTitle: string; assessmentType: string; score: number; feedback?: string };
type Assessment = { title: string; type: string; kelas: string };
const types = ["Tugas", "Kuis", "Ujian", "Penilaian"];

export default function GradesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [className, setClassName] = useState("");
  const [assessmentTitle, setAssessmentTitle] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [assessmentType, setAssessmentType] = useState("Tugas");
  const [scores, setScores] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const [sr, ar, gr] = await Promise.all([fetch("/api/students"), fetch("/api/assessments"), fetch("/api/grades")]);
    const [sd, ad, gd] = await Promise.all([sr.json(), ar.json(), gr.json()]);
    if (!sr.ok || !ar.ok || !gr.ok) throw new Error(sd.message ?? ad.message ?? gd.message ?? "Gagal memuat data");
    setStudents(sd.students ?? []); setAssessments(ad.assessments ?? []); setGrades(gd.grades ?? []);
  }
  useEffect(() => { load().catch((e: Error) => setError(e.message)); }, []);
  const classNames = [...new Set(students.map((s) => s.className))].sort();
  const classStudents = students.filter((s) => s.className === className);
  const filteredAssessments = assessments.filter((a) => a.kelas === className || a.kelas === "General");

  async function selectAssessment(title: string) {
    setAssessmentTitle(title);
    const assessment = assessments.find((a) => a.title === title);
    if (assessment) setAssessmentType(types.includes(assessment.type) ? assessment.type : "Tugas");
    const existing = grades.filter((g) => g.className === className && g.assessmentTitle === title);
    setScores(Object.fromEntries(existing.map((g) => [students.find((s) => s.name === g.studentName)?._id ?? "", String(g.score)])));
    setFeedback(Object.fromEntries(existing.map((g) => [students.find((s) => s.name === g.studentName)?._id ?? "", g.feedback ?? ""])));
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setMessage("");
    try {
      for (const student of classStudents) {
        const score = scores[student._id];
        if (score === undefined || score === "") continue;
        const title = manualTitle.trim() || assessmentTitle;
        const response = await fetch("/api/grades", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentId: student._id, className, assessmentTitle: title, assessmentType, score, feedback: feedback[student._id] ?? "" }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message ?? `Gagal menyimpan nilai ${student.name}`);
      }
      await load(); setMessage("Nilai berhasil disimpan.");
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan nilai"); }
  }

  return <GuruShell><div className="mx-auto max-w-5xl"><h1 className="mb-6 text-3xl font-bold">Penilaian & Rekap</h1>
    <form onSubmit={submit} className="space-y-5 rounded-xl border bg-white p-5">
      <div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold">Kelas<select required className="mt-1 h-11 w-full rounded-lg border px-3" value={className} onChange={(e) => { setClassName(e.target.value); setAssessmentTitle(""); setManualTitle(""); }}><option value="">Pilih kelas</option>{classNames.map((name) => <option key={name}>{name}</option>)}</select></label><label className="text-sm font-semibold">Jenis nilai<select className="mt-1 h-11 w-full rounded-lg border px-3" value={assessmentType} onChange={(e) => setAssessmentType(e.target.value)}>{types.map((t) => <option key={t}>{t}</option>)}</select></label></div>
      <label className="block text-sm font-semibold">Nama asesmen<input className="mt-1 h-11 w-full rounded-lg border px-3" list="available-assessments" placeholder="Pilih atau ketik nama tugas, kuis, atau ujian" value={manualTitle || assessmentTitle} onChange={(e) => { setManualTitle(e.target.value); setAssessmentTitle(""); }} /><datalist id="available-assessments">{filteredAssessments.map((a) => <option key={`${a.title}-${a.type}`} value={a.title}>{a.type}</option>)}</datalist></label>
      {classStudents.map((student) => <div key={student._id} className="grid items-center gap-2 border-t pt-3 sm:grid-cols-[1fr_120px_2fr]"><span className="font-medium">{student.name}</span><input aria-label={`Nilai ${student.name}`} className="h-10 rounded-lg border px-3" type="number" min="0" max="100" step="0.01" value={scores[student._id] ?? ""} onChange={(e) => setScores({ ...scores, [student._id]: e.target.value })} placeholder="Nilai" /><input aria-label={`Catatan ${student.name}`} className="h-10 rounded-lg border px-3" value={feedback[student._id] ?? ""} onChange={(e) => setFeedback({ ...feedback, [student._id]: e.target.value })} placeholder="Catatan (opsional)" /></div>)}
      {error && <p className="text-sm text-red-700">{error}</p>}{message && <p className="text-sm text-green-700">{message}</p>}<button disabled={!className || !(manualTitle.trim() || assessmentTitle) || !Object.values(scores).some((score) => score !== "")} className="rounded-lg bg-[#168446] px-5 py-3 font-semibold text-white disabled:opacity-50">Simpan nilai yang diisi</button>
    </form>
    <section className="mt-8 overflow-x-auto rounded-xl border bg-white p-5"><h2 className="mb-4 text-xl font-bold">Rekap nilai tersimpan</h2><table className="w-full text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="p-2">Murid</th><th>Kelas</th><th>Asesmen</th><th>Jenis</th><th>Nilai</th></tr></thead><tbody>{grades.map((g) => <tr key={g._id} className="border-b"><td className="p-2">{g.studentName}</td><td>{g.className}</td><td>{g.assessmentTitle}</td><td>{g.assessmentType}</td><td className="font-semibold">{g.score}</td></tr>)}</tbody></table></section>
  </div></GuruShell>;
}
