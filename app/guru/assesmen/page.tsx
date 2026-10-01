"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  BookOpenText,
  ClipboardCheck,
  FileText,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";
import GuruShell from "../GuruShell";

type AssessmentItem = {
  _id: string;
  title: string;
  subject: string;
  kelas: string;
  type: "Kuis" | "Ujian" | "Penilaian" | "Tugas" | string;
  description?: string;
  link?: string;
  status?: string;
};

type MaterialItem = {
  _id: string;
  title: string;
  subject: string;
  kelas: string;
  description?: string;
};

type AssessmentType = "Kuis" | "Ujian" | "Penilaian" | "Tugas" | "Materi";
type SecondaryCardType = AssessmentType;

const courseOptions = ["Matematika", "Bahasa Indonesia", "IPA", "IPS", "Informatika", "Bahasa Inggris"];
const classOptions = ["XII RPL", "XI TKJ", "X PPLG", "XII TKJ", "XI RPL"];

export default function GuruAssesmenPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [selectedType, setSelectedType] = useState<AssessmentType | null>(null);
  const [uploadMode, setUploadMode] = useState<"link" | "file">("link");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState({ subject: "", kelas: "", link: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      const [assessmentRes, materialRes] = await Promise.all([
        fetch("/api/assessments"),
        fetch("/api/materials"),
      ]);

      const assessmentData = await assessmentRes.json();
      const materialData = await materialRes.json();

      if (assessmentData.success) setAssessments(assessmentData.assessments ?? []);
      if (materialData.success) setMaterials(materialData.materials ?? []);
    } catch {
      setAssessments([]);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const counts = {
      Kuis: assessments.filter((item) => item.type === "Kuis").length,
      Ujian: assessments.filter((item) => item.type === "Ujian").length,
      Penilaian: assessments.filter((item) => item.type === "Penilaian").length,
      Tugas: assessments.filter((item) => item.type === "Tugas").length,
      Materi: materials.length,
    };

    return counts;
  }, [assessments, materials]);

  const primaryCards = [
    { type: "Kuis" as const, label: "Kuis", count: stats.Kuis },
    { type: "Ujian" as const, label: "Ujian", count: stats.Ujian },
    { type: "Penilaian" as const, label: "Penilaian", count: stats.Penilaian },
  ];

  const secondaryCards = [
    { type: "Tugas" as const, label: "Tugas", count: stats.Tugas },
    { type: "Materi" as const, label: "Materi", count: stats.Materi },
  ];

  const cardIcons: Record<AssessmentType, LucideIcon> = {
    Kuis: ClipboardCheck,
    Ujian: NotebookPen,
    Penilaian: BadgeCheck,
    Tugas: FileText,
    Materi: BookOpenText,
  };

  function openModal(type: SecondaryCardType) {
    setSelectedType(type);
    setUploadMode(type === "Materi" ? "file" : "link");
    setSelectedFile(null);
    setForm({ subject: "", kelas: "", link: "", description: "" });
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedType) return;
    if (!form.subject || !form.kelas) {
      setError("Mata pelajaran dan kelas wajib diisi.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (selectedType === "Materi") {
        if (!selectedFile) {
          setError("File materi wajib diupload.");
          setSaving(false);
          return;
        }

        const body = new FormData();
        body.append("title", `${selectedType} ${form.subject}`);
        body.append("subject", form.subject);
        body.append("kelas", form.kelas);
        body.append("description", form.description);
        body.append("file", selectedFile);

        const res = await fetch("/api/materials", { method: "POST", body });
        const data = await res.json();

        if (!data.success) {
          setError(data.message ?? "Gagal menyimpan materi.");
          return;
        }
      } else {
        const payload = {
          title: `${selectedType} ${form.subject}`,
          subject: form.subject,
          kelas: form.kelas,
          link: uploadMode === "link" ? form.link : selectedFile?.name ?? "",
          description: form.description,
          type: selectedType,
        };

        const res = await fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!data.success) {
          setError(data.message ?? "Gagal menyimpan data.");
          return;
        }
      }

      setSelectedType(null);
      setForm({ subject: "", kelas: "", link: "", description: "" });
      setSelectedFile(null);
      setUploadMode("link");
      await loadData();
    } catch {
      setError("Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GuruShell>
      <div className="mx-auto max-w-[1100px]">
        <div className="mb-8 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe3ea] bg-[#eef2f8] text-[20px] text-[#1d2430]">▣</span>
          <h1 className="text-[40px] font-bold tracking-[-0.03em] text-[#1d2430]">Assessment</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {primaryCards.map(({ type, label, count }) => {
            const Icon = cardIcons[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => openModal(type)}
                className="group min-h-[190px] rounded-[20px] border border-[#dfe3ea] bg-[#f5f6f8] p-5 text-left shadow-[0_2px_12px_rgba(15,23,42,0.02)] transition hover:-translate-y-0.5 hover:border-[#cdd9ee] hover:bg-white"
              >
                <div className="flex h-full flex-col justify-between">
                  <div className="flex items-center gap-2 text-[28px] font-semibold text-[#1d2430]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4a5566] shadow-sm">
                      <Icon size={22} strokeWidth={2} />
                    </span>
                    {label}
                  </div>
                  <div className="mt-6 text-[42px] font-medium leading-none text-[#1d2430]">{loading ? "-" : count}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe3ea] bg-[#eef2f8] text-[20px] text-[#1d2430]">✎</span>
            <h2 className="text-[40px] font-bold tracking-[-0.03em] text-[#1d2430]">Tugas dan Materi</h2>
          </div>

          <div className="grid max-w-[760px] gap-6 md:grid-cols-2">
            {secondaryCards.map(({ type, label, count }) => {
              const Icon = cardIcons[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => openModal(type)}
                  className="min-h-[180px] rounded-[20px] border border-[#dfe3ea] bg-[#f5f6f8] p-5 text-left shadow-[0_2px_12px_rgba(15,23,42,0.02)] transition hover:-translate-y-0.5 hover:border-[#cdd9ee] hover:bg-white"
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-center gap-2 text-[28px] font-semibold text-[#1d2430]">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#4a5566] shadow-sm">
                        <Icon size={22} strokeWidth={2} />
                      </span>
                      {label}
                    </div>
                    <div className="mt-8 text-[42px] font-medium leading-none text-[#1d2430]">{loading ? "-" : count}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 px-4 backdrop-blur-[2px]">
          <div className="w-full max-w-[760px] rounded-[22px] border border-[#dfe3ea] bg-[#f3f4f7] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-[18px] font-medium text-[#1d2430]">Mata Pelajaran</label>
                <div className="relative">
                  <select
                    value={form.subject}
                    onChange={(event) => setForm((current) => ({ ...current, subject: event.target.value }))}
                    className="w-full appearance-none rounded-xl border border-[#d6dbe3] bg-white px-4 py-3 text-[16px] text-[#1d2430] outline-none transition focus:border-[#6ca3ff]"
                  >
                    <option value="">Pilih Mata Pelajaran</option>
                    {courseOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#44506a]">⌄</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[18px] font-medium text-[#1d2430]">Kelas</label>
                <div className="relative">
                  <select
                    value={form.kelas}
                    onChange={(event) => setForm((current) => ({ ...current, kelas: event.target.value }))}
                    className="w-full appearance-none rounded-xl border border-[#d6dbe3] bg-white px-4 py-3 text-[16px] text-[#1d2430] outline-none transition focus:border-[#6ca3ff]"
                  >
                    <option value="">Pilih Kelas</option>
                    {classOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[20px] text-[#44506a]">⌄</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[18px] font-medium text-[#1d2430]">
                  {selectedType === "Materi" ? "Upload File" : `Upload ${selectedType === "Tugas" ? "Link" : "File"}`}
                </label>
                <div className="rounded-xl border border-[#d6dbe3] bg-white p-1">
                  {selectedType !== "Materi" && (
                    <div className="mb-2 flex gap-2 rounded-lg bg-[#eef2f8] p-1">
                      <button
                        type="button"
                        onClick={() => setUploadMode("link")}
                        className={`flex-1 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                          uploadMode === "link" ? "bg-white text-[#1d2430] shadow-sm" : "text-[#5d6776]"
                        }`}
                      >
                        Paste Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode("file")}
                        className={`flex-1 rounded-lg px-3 py-2 text-[14px] font-medium transition ${
                          uploadMode === "file" ? "bg-white text-[#1d2430] shadow-sm" : "text-[#5d6776]"
                        }`}
                      >
                        Select File
                      </button>
                    </div>
                  )}

                  {selectedType === "Materi" || uploadMode === "file" ? (
                    <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-[#b9c4d8] bg-[#f9fafb] px-4 py-5 text-[16px] font-medium text-[#44506a]">
                      <span>{selectedFile ? selectedFile.name : "Select File"}</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                      />
                    </label>
                  ) : (
                    <input
                      value={form.link}
                      onChange={(event) => setForm((current) => ({ ...current, link: event.target.value }))}
                      placeholder="Paste Link"
                      className="w-full rounded-lg border border-[#dfe3ea] bg-[#f9fafb] px-4 py-3 text-[16px] text-[#1d2430] outline-none"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[18px] font-medium text-[#1d2430]">Deskripsi</label>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-[#d6dbe3] bg-white px-4 py-3 text-[16px] text-[#1d2430] outline-none transition focus:border-[#6ca3ff]"
                />
              </div>

              {error && <p className="text-[14px] font-medium text-red-600">{error}</p>}

              <div className="flex justify-end gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="rounded-xl border border-[#e25050] bg-white px-7 py-3 text-[16px] font-semibold text-[#d93a3a] transition hover:bg-red-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl border border-[#2ea469] bg-[#2ea469] px-8 py-3 text-[16px] font-semibold text-white transition hover:bg-[#26995f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuruShell>
  );
}