"use client";

import { FormEvent, useEffect, useState } from "react";
import StudentShell from "../StudentShell";

type Submission = { _id: string; title: string; fileName: string; fileUrl: string; fileType: string; sizeLabel: string };

export default function StudentUploadPage() {
  const [items, setItems] = useState<Submission[]>([]);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/submissions");
    const data = await res.json();
    if (data.success) setItems(data.submissions);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file) return setError("Pilih file dulu");
    setLoading(true);
    setError("");
    const body = new FormData();
    body.append("title", title);
    body.append("file", file);
    const res = await fetch("/api/submissions", { method: "POST", body });
    const data = await res.json();
    setLoading(false);
    if (!data.success) return setError(data.message);
    setTitle("");
    setFile(null);
    setOpen(false);
    load();
  }

  return (
    <StudentShell active="upload">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Upload Project & Tugas</h1>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-xl bg-[#111b46] px-5 py-3 text-[14px] font-semibold text-white shadow-sm">
          ⤴ Upload
        </button>
      </div>

      {open && (
        <div className="mb-8 max-w-xl rounded-[22px] border border-[#dfe3ea] bg-white p-6">
          <div className="space-y-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul project / tugas"
              className="w-full rounded-lg border border-[#dfe3ea] px-4 py-3 text-[14px] outline-none"
            />
            <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="w-full text-[14px]" />
            {error && <p className="text-[13px] text-red-600">{error}</p>}
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit as unknown as () => void}
              className="rounded-xl bg-[#111b46] px-5 py-3 text-[14px] font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Mengupload..." : "Kirim"}
            </button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-[14px] text-[#667085]">Belum ada file yang diupload.</p>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="rounded-[22px] border border-[#dfe3ea] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)]">
              <div className="mb-6 flex h-44 items-center justify-center rounded-[18px] border border-[#dfe3ea] bg-[#eceef0] text-[64px] text-[#1a2230]">▣</div>
              <div className="mb-3 inline-flex rounded-full bg-[#edf1f7] px-2 py-1 text-[11px] font-medium text-[#3d4c65]">{item.fileType}</div>
              <div className="text-[22px] font-semibold leading-tight text-[#1d2430]">{item.title}</div>
              <div className="mt-2 text-[13px] text-[#667085]">{item.fileName} · {item.sizeLabel}</div>
              <a href={item.fileUrl} className="mt-4 inline-block text-[14px] font-medium text-[#2a6fdd]">Download ↓</a>
            </div>
          ))}
        </div>
      )}
    </StudentShell>
  );
}