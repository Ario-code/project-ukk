"use client";

import { useMemo, useState } from "react";
import { ArrowDownToLine, FileText, Search } from "lucide-react";

type MaterialItem = {
  _id: string;
  title: string;
  subject: string;
  kelas: string;
  fileType: string;
  fileUrl: string;
  sizeLabel: string;
  createdAt: string | Date;
};

export default function MaterialsCatalog({ materials }: { materials: MaterialItem[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
    if (!normalizedQuery) return materials;
    return materials.filter((item) =>
      `${item.title} ${item.subject} ${item.kelas}`.toLocaleLowerCase("id-ID").includes(normalizedQuery)
    );
  }, [materials, query]);
  const cards = filtered.slice(0, 3);
  const history = filtered.slice(3);

  return (
    <>
      <label className="mb-6 flex items-center gap-2 rounded-lg border border-[#d4d8df] bg-white px-3">
        <Search className="h-4 w-4 shrink-0 text-[#706f70]" />
        <input
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-[#353536] outline-none placeholder:text-[#acadb1]"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari judul, mata pelajaran, atau kelas"
          aria-label="Cari materi"
        />
      </label>

      <h1 className="mb-6 text-3xl font-bold tracking-tight text-[#353536]">Materi</h1>
      {filtered.length === 0 ? (
        <p className="rounded-lg border border-[#d4d8df] bg-white px-5 py-8 text-sm text-[#706f70]">
          {materials.length ? "Tidak ada materi yang cocok dengan pencarian." : "Belum ada materi untuk kelasmu."}
        </p>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            {cards.map((item) => (
              <article key={item._id} className="rounded-lg border border-[#d4d8df] bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><FileText size={19} /></span>
                  <a href={item.fileUrl} aria-label={`Unduh ${item.title}`} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#d4d8df] text-[#706f70] hover:bg-[#ebedf1]"><ArrowDownToLine size={17} /></a>
                </div>
                <h2 className="font-semibold text-[#353536]">{item.title}</h2>
                <p className="mt-1 text-sm text-[#706f70]">{item.subject} · Kelas {item.kelas}</p>
                <p className="mt-3 border-t border-[#d4d8df] pt-3 text-xs text-[#706f70]">{item.fileType} · {item.sizeLabel} · {new Date(item.createdAt).toLocaleDateString("id-ID")}</p>
              </article>
            ))}
          </div>
          <section className="mt-8 overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
            <h2 className="border-b border-[#d4d8df] px-5 py-4 text-lg font-bold text-[#353536]">Materi lainnya</h2>
            {history.length ? history.map((item) => (
              <div key={item._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d4d8df] px-5 py-4 last:border-0">
                <div><p className="text-sm font-semibold text-[#353536]">{item.title}</p><p className="mt-1 text-xs text-[#706f70]">{item.subject} · {item.kelas} · {item.sizeLabel}</p></div>
                <a href={item.fileUrl} aria-label={`Unduh ${item.title}`} className="text-[#168446]"><ArrowDownToLine size={18} /></a>
              </div>
            )) : <p className="px-5 py-4 text-sm text-[#706f70]">Tidak ada materi lainnya.</p>}
          </section>
        </>
      )}
    </>
  );
}
