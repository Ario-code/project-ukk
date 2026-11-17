"use client";

import Link from "next/link";
import { type ChangeEvent, type DragEvent, type FormEvent, useState } from "react";
import { ArrowLeft, Check, Download, FileSpreadsheet, Upload, X } from "lucide-react";
import AdminShell from "../../AdminShell";

type ImportResult = {
  createdCount: number;
  skippedCount: number;
  created: string[];
  skipped: string[];
};

const templateCsv = "nama,role,mata_pelajaran,jurusan,nis,kelas\nAhmad Fauzi,guru,Matematika,PPLG,,\nSiti Rahma,murid,,PPLG,24001,X-PPLG\nBambang Setiawan,kepsek,,,,\n";

export default function ImportUsersPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState("");

  function setSelectedFile(selectedFile: File | null) {
    setFile(selectedFile);
    setError("");
    setResult(null);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    const droppedFile = event.dataTransfer.files[0] ?? null;
    if (!droppedFile) return;

    if (!/\.(csv|xls|xlsx)$/i.test(droppedFile.name)) {
      setFile(null);
      setError("Pilih file dengan format CSV, XLS, atau XLSX.");
      return;
    }

    setSelectedFile(droppedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!file) {
      setError("Pilih file Excel atau CSV terlebih dahulu.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/users/import", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Gagal mengimpor akun.");
        return;
      }

      setResult({
        createdCount: data.createdCount ?? 0,
        skippedCount: data.skippedCount ?? 0,
        created: data.created ?? [],
        skipped: data.skipped ?? [],
      });
      setFile(null);
      form.reset();
    } catch {
      setError("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminShell active="users">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[#706f70] transition hover:text-[#353536]" href="/admin/users">
              <ArrowLeft size={16} /> Kembali ke pengguna
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#706f70]">Manajemen pengguna</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Impor akun massal</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Tambahkan banyak akun sekaligus dari satu spreadsheet. Siapkan nama dan role, lalu unggah file-nya.</p>
          </div>
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-[#d4d8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#353536] transition hover:border-[#acadb1] hover:bg-[#ebedf1]"
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(templateCsv)}`}
            download="template-impor-akun.csv"
          >
            <Download size={16} /> Unduh template
          </a>
        </div>

        <form className="overflow-hidden rounded-xl border border-[#d4d8df] bg-white" onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-[1.4fr_0.8fr]">
            <div className="p-6 sm:p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><Upload size={19} /></span>
                <div>
                  <h2 className="text-base font-bold text-[#353536]">Pilih file spreadsheet</h2>
                  <p className="mt-0.5 text-xs text-[#706f70]">Format CSV, XLS, atau XLSX</p>
                </div>
              </div>

              <label
                className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed px-5 py-8 text-center transition ${isDragging ? "border-[#706f70] bg-[#ebedf1]" : "border-[#d4d8df] bg-white hover:border-[#acadb1] hover:bg-[#ebedf1]"}`}
                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <input className="sr-only" type="file" accept=".csv,.xls,.xlsx" onChange={handleFileChange} required={!file} />
                {file ? (
                  <>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><FileSpreadsheet size={22} /></span>
                    <span className="mt-4 max-w-full truncate text-sm font-semibold text-[#353536]">{file.name}</span>
                    <span className="mt-1 text-xs text-[#706f70]">{(file.size / 1024).toFixed(1)} KB · Klik untuk mengganti file</span>
                  </>
                ) : (
                  <>
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><Upload size={21} /></span>
                    <span className="mt-4 text-sm font-semibold text-[#353536]">Seret file ke sini</span>
                    <span className="mt-1 text-xs text-[#706f70]">atau klik untuk memilih dari perangkat</span>
                    <span className="mt-4 rounded-md border border-[#d4d8df] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#706f70]">CSV · XLS · XLSX</span>
                  </>
                )}
              </label>

              {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#706f70]">Akun yang email-nya sudah terdaftar akan dilewati.</p>
                <button
                  className="inline-flex min-w-36 items-center justify-center gap-2 rounded-lg bg-[#168446] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#106d38] disabled:cursor-not-allowed disabled:bg-slate-300"
                  type="submit"
                  disabled={loading || !file}
                >
                  {loading ? "Mengimpor..." : <><Upload size={16} /> Mulai impor</>}
                </button>
              </div>
            </div>

            <aside className="border-t border-[#d4d8df] bg-[#ebedf1] p-6 sm:p-8 lg:border-l lg:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#706f70]">Sebelum mengunggah</p>
              <div className="mt-5 space-y-5">
                <div>
                  <p className="text-sm font-semibold text-[#353536]">Kolom wajib</p>
                  <p className="mt-1 text-xs leading-5 text-[#706f70]">Baris pertama harus berisi nama kolom.</p>
                  <div className="mt-3 flex gap-2">
                    <code className="rounded border border-[#d4d8df] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#353536]">nama</code>
                    <code className="rounded border border-[#d4d8df] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#353536]">role</code>
                  </div>
                </div>
                <div className="border-t border-[#d4d8df] pt-4">
                  <p className="text-sm font-semibold text-[#353536]">Role yang tersedia</p>
                  <p className="mt-1 text-xs leading-5 text-[#706f70]">Guru wajib memiliki mata_pelajaran dan jurusan. Murid wajib memiliki NIS, kelas, dan jurusan. Role lain cukup nama dan role.</p>
                </div>
                <div className="border-t border-[#d4d8df] pt-4">
                  <p className="text-sm font-semibold text-[#353536]">Contoh isi</p>
                  <pre className="mt-2 overflow-x-auto rounded-lg border border-[#d4d8df] bg-white p-3 text-xs leading-5 text-[#353536]">{"nama,role,mata_pelajaran,jurusan,nis,kelas\nAhmad Fauzi,guru,Matematika,PPLG,,\nSiti Rahma,murid,,PPLG,24001,X-PPLG"}</pre>
                </div>
                <p className="text-[11px] leading-5 text-[#706f70]">Email dan password akun dibuat otomatis berdasarkan nama lengkap.</p>
              </div>
            </aside>
          </div>
        </form>

        {result && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"><Check size={18} /></span>
              <div>
                <h2 className="font-bold text-slate-900">Impor selesai</h2>
                <p className="mt-1 text-sm text-slate-500">Berikut ringkasan hasil pemrosesan file.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Berhasil dibuat</p>
                <p className="mt-1 text-3xl font-bold text-emerald-700">{result.createdCount}</p>
              </div>
              <div className="sm:border-l sm:border-slate-200 sm:pl-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Dilewati</p>
                <p className="mt-1 text-3xl font-bold text-amber-600">{result.skippedCount}</p>
              </div>
            </div>
            {result.created.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-semibold text-slate-800">Akun yang ditambahkan</p>
                <ul className="mt-2 divide-y divide-slate-100 text-sm text-slate-600">
                  {result.created.map((item) => <li className="py-2" key={item}>{item}</li>)}
                </ul>
              </div>
            )}
            {result.skipped.length > 0 && (
              <div className="mt-5">
                <p className="flex items-center gap-2 text-sm font-semibold text-slate-800"><X size={15} className="text-amber-600" /> Baris yang dilewati</p>
                <ul className="mt-2 divide-y divide-slate-100 text-sm text-slate-600">
                  {result.skipped.map((item) => <li className="py-2" key={item}>{item}</li>)}
                </ul>
              </div>
            )}
          </section>
        )}
      </div>
    </AdminShell>
  );
}