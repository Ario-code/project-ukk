"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import GuruShell from "../../GuruShell";

export default function GuruUploadMateriPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [kelas, setKelas] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title || !subject || !file) return setError("Judul, mapel, dan file wajib diisi");
    setLoading(true);
    setError("");
    const body = new FormData();
    body.append("title", title);
    body.append("subject", subject);
    body.append("kelas", kelas || "General");
    body.append("description", description);
    body.append("file", file);

    const res = await fetch("/api/materials", { method: "POST", body });
    const data = await res.json();
    setLoading(false);
    if (!data.success) return setError(data.message);
    router.push("/guru/materi");
  }

  return (
    <GuruShell>
      <div className="mb-6 rounded-lg bg-[#f4f5f7] px-6 py-4">
        <h1 className="text-[22px] font-bold text-[#1d2430]">Upload Materi</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-5 rounded-[16px] border border-[#dfe3ea] bg-white p-6">
        <div>
          <label className="mb-1 block text-[13px] font-medium text-[#3d4a5c]">Judul Materi</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-lg border border-[#dfe3ea] px-4 py-3 text-[14px] outline-none" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#3d4a5c]">Mata Pelajaran</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-[#dfe3ea] px-4 py-3 text-[14px] outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-[13px] font-medium text-[#3d4a5c]">Kelas</label>
            <input value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="cth. 12 PPLG" className="w-full rounded-lg border border-[#dfe3ea] px-4 py-3 text-[14px] outline-none" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-medium text-[#3d4a5c]">Deskripsi (Optional)</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-[#dfe3ea] px-4 py-3 text-[14px] outline-none" />
        </div>
        <div>
          <label className="mb-1 block text-[13px] font-medium text-[#3d4a5c]">Upload File (PDF, DOC, PPT — max 50MB)</label>
          <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-[14px]" />
        </div>
        {error && <p className="text-[13px] text-red-600">{error}</p>}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push("/guru/materi")} className="rounded-lg border border-red-300 px-5 py-2.5 text-[14px] font-semibold text-red-600">
            Batal
          </button>
          <button type="submit" disabled={loading} className="rounded-lg bg-[#1f7a4d] px-5 py-2.5 text-[14px] font-semibold text-white disabled:opacity-60">
            {loading ? "Mengupload..." : "Upload Materi"}
          </button>
        </div>
      </form>
    </GuruShell>
  );
}