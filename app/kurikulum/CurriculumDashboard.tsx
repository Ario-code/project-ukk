"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, CalendarDays, ClipboardList, Download, GraduationCap, LayoutDashboard, School, Users, type LucideIcon } from "lucide-react";
import LogoutButton from "../kepsek/LogoutButton";

export type CurriculumSection = "dashboard" | "jadwal" | "mapel" | "monitoring" | "laporan";
type Entity = { _id: string; [key: string]: string | number | boolean | string[] | undefined };
type DashboardData = {
  success: boolean;
  message?: string;
  subjects: Array<Entity & { name: string; code: string; weeklyHours: number; classes: string[] }>;
  periods: Array<Entity & { academicYear: string; semester: string; active: boolean }>;
  schedules: Array<Entity & { className: string; subject: string; teacherId: string; teacherName: string; day: string; startTime: string; endTime: string; academicPeriodId: string }>;
  classes: Array<{ _id: string; name: string }>;
  teachers: Array<{ _id: string; name: string; subject: string }>;
  analytics: {
    students: number;
    teachers: number;
    classes: number;
    grades: number;
    teacherLoad: Array<{ name: string; scheduleCount: number; gradeCount: number }>;
    activities: Array<{ title: string; actor: string; createdAt: string; kind: string }>;
  };
};

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const inputClass = "mt-1 h-10 w-full rounded-md border border-[#d4d8df] bg-white px-3 text-sm outline-none focus:border-sky-600";
const buttonClass = "rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-60";

const navigation: Array<{ key: CurriculumSection; label: string; href: string; icon: LucideIcon }> = [
  { key: "dashboard", label: "Dashboard", href: "/kurikulum", icon: LayoutDashboard },
  { key: "jadwal", label: "Jadwal Pelajaran", href: "/kurikulum/jadwal", icon: CalendarDays },
  { key: "mapel", label: "Kurikulum & Mapel", href: "/kurikulum/mapel", icon: BookOpen },
  { key: "monitoring", label: "Monitoring", href: "/kurikulum/monitoring", icon: ClipboardList },
  { key: "laporan", label: "Laporan Akademik", href: "/kurikulum/laporan", icon: GraduationCap },
];

export default function CurriculumDashboard({ userName, section }: { userName: string; section: CurriculumSection }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  const loadData = useCallback(async () => {
    const response = await fetch("/api/curriculum");
    const result = await response.json();
    if (!response.ok) throw new Error(result.message ?? "Gagal memuat data kurikulum");
    setData(result);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/curriculum")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message ?? "Gagal memuat data kurikulum");
        return result as DashboardData;
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((loadError: Error) => {
        if (!cancelled) setError(loadError.message);
      });
    return () => { cancelled = true; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>, entity: string, extra: Record<string, string | boolean | string[]>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    try {
      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      const response = await fetch("/api/curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, ...extra, entity }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "Gagal menyimpan data");
      form.reset();
      await loadData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan data");
    } finally {
      setBusy(false);
    }
  }

  async function remove(entity: string, id: string) {
    if (!window.confirm("Hapus data ini?")) return;
    setError("");
    const response = await fetch(`/api/curriculum?entity=${entity}&id=${id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.message ?? "Gagal menghapus data");
      return;
    }
    await loadData();
  }

  async function downloadReport(format: "xlsx" | "pdf") {
    setReportMessage("");
    const response = await fetch(`/api/curriculum/reports?format=${format}`);
    if (!response.ok) {
      const result = await response.json();
      setError(result.message ?? "Gagal mengunduh laporan");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-akademik.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    setReportMessage("Laporan berhasil disiapkan.");
  }

  if (!data) {
    return <main className="min-h-screen bg-[#ebedf1] p-8 text-sm text-[#706f70]">{error || "Memuat dashboard kurikulum..."}</main>;
  }

  const stats = [
    { label: "Guru aktif", value: data.analytics.teachers, icon: Users },
    { label: "Murid", value: data.analytics.students, icon: GraduationCap },
    { label: "Kelas", value: data.analytics.classes, icon: School },
    { label: "Mata pelajaran", value: data.subjects.length, icon: BookOpen },
    { label: "Nilai tersimpan", value: data.analytics.grades, icon: CalendarDays },
  ];

  return (
    <main className="min-h-screen bg-[#ebedf1] text-[#353536]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="group flex w-full shrink-0 flex-col border-b border-[#d4d8df] bg-white transition-[width] duration-200 lg:sticky lg:top-0 lg:min-h-screen lg:w-[72px] lg:border-b-0 lg:border-r lg:hover:w-[250px]">
          <div className="flex items-center justify-center gap-3 overflow-hidden px-5 py-4 lg:px-4 lg:py-7 lg:group-hover:justify-start">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ebedf1]"><School size={21} /></span>
            <div className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-[180px] lg:group-hover:opacity-100"><p className="text-sm font-bold">Kelasin</p><p className="mt-1 text-[11px] text-[#706f70]">portal kurikulum</p></div>
          </div>
          <nav aria-label="Navigasi kurikulum" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:w-full lg:flex-col lg:overflow-visible">
            {navigation.map(({ key, label, href, icon: Icon }) => (
              <Link key={key} href={href} title={label} aria-current={section === key ? "page" : undefined}
                className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition lg:min-w-0 lg:w-full lg:justify-center lg:group-hover:justify-start ${section === key ? "bg-[#ebedf1] text-[#353536]" : "text-[#706f70] hover:bg-[#ebedf1] hover:text-[#353536]"}`}>
                <Icon size={17} /><span className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-[180px] lg:group-hover:opacity-100">{label}</span>
              </Link>
            ))}
          </nav>
          <div className="mt-auto hidden overflow-hidden whitespace-nowrap px-6 pb-6 pt-10 text-[11px] text-[#acadb1] opacity-0 transition-opacity lg:block lg:group-hover:opacity-100">Portal Manajemen Sekolah</div>
        </aside>
        <div className="min-w-0 flex-1">
      <header className="flex min-h-16 items-center justify-between border-b border-[#d4d8df] bg-white px-4 sm:px-7">
        <div><p className="text-[11px] text-[#706f70]">Akademik Sekolah / Kurikulum</p><p className="mt-1 text-sm font-semibold">{navigation.find((item) => item.key === section)?.label}</p></div>
        <div className="flex items-center gap-3"><div className="text-right"><p className="text-sm font-semibold">{userName}</p><p className="text-xs text-[#706f70]">Wakil Kurikulum</p></div><LogoutButton /></div>
      </header>
      <div className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-7 lg:px-9">
        <div><h1 className="text-3xl font-bold tracking-tight">{navigation.find((item) => item.key === section)?.label}</h1><p className="mt-2 text-sm text-[#706f70]">Kelola dan pantau kegiatan akademik sekolah.</p></div>
        {error && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {section === "dashboard" && <section aria-label="Statistik akademik" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {stats.map(({ label, value, icon: Icon }) => <article key={label} className="rounded-lg border border-[#d4d8df] bg-white p-5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#ebedf1] text-[#706f70]"><Icon size={18} /></span><p className="mt-4 text-sm text-[#706f70]">{label}</p><p className="mt-1 text-3xl font-bold">{value}</p></article>)}
        </section>}

        {section === "mapel" && <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-[#d4d8df] bg-white p-5">
            <h2 className="font-bold">Tambah mata pelajaran</h2>
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => save(event, "subject", { classes: String(new FormData(event.currentTarget).get("classes") ?? "").split(",").map((name) => name.trim()).filter(Boolean) })}>
              <label className="text-xs font-medium">Nama mapel<input className={inputClass} name="name" required /></label>
              <label className="text-xs font-medium">Kode<input className={inputClass} name="code" required /></label>
              <label className="text-xs font-medium">Jam per minggu<input className={inputClass} name="weeklyHours" type="number" min="1" required /></label>
              <label className="text-xs font-medium">Kelas (pisahkan dengan koma)<input className={inputClass} name="classes" placeholder="X RPL 1, XI RPL 1" /></label>
              <button className={`${buttonClass} sm:col-span-2`} disabled={busy}>Simpan mapel</button>
            </form>
            <div className="mt-5 divide-y divide-[#ebedf1]">
              {data.subjects.map((subject) => <div key={subject._id} className="flex items-center justify-between gap-3 py-3 text-sm"><div><p className="font-semibold">{subject.name} <span className="font-normal text-[#706f70]">({subject.code})</span></p><p className="text-xs text-[#706f70]">{subject.weeklyHours} jam/minggu · {subject.classes.join(", ") || "Belum dipetakan"}</p></div><button className="text-xs font-semibold text-red-700" onClick={() => remove("subject", subject._id)}>Hapus</button></div>)}
              {!data.subjects.length && <p className="py-4 text-sm text-[#706f70]">Belum ada data mapel Kurikulum.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-[#d4d8df] bg-white p-5">
            <h2 className="font-bold">Tahun ajaran dan semester</h2>
            <form className="mt-4 grid gap-3 sm:grid-cols-2" onSubmit={(event) => save(event, "period", { active: new FormData(event.currentTarget).get("active") === "on" })}>
              <label className="text-xs font-medium">Tahun ajaran<input className={inputClass} name="academicYear" placeholder="2025/2026" required /></label>
              <label className="text-xs font-medium">Semester<select className={inputClass} name="semester"><option>Ganjil</option><option>Genap</option></select></label>
              <label className="flex items-center gap-2 text-xs sm:col-span-2"><input name="active" type="checkbox" /> Jadikan periode aktif</label>
              <button className={`${buttonClass} sm:col-span-2`} disabled={busy}>Tambah periode</button>
            </form>
            <div className="mt-5 divide-y divide-[#ebedf1]">
              {data.periods.map((period) => <div key={period._id} className="flex items-center justify-between py-3 text-sm"><p className="font-semibold">{period.academicYear} · {period.semester} {period.active && <span className="text-xs font-normal text-emerald-700">Aktif</span>}</p><button className="text-xs font-semibold text-red-700" onClick={() => remove("period", period._id)}>Hapus</button></div>)}
              {!data.periods.length && <p className="py-4 text-sm text-[#706f70]">Belum ada tahun ajaran atau semester.</p>}
            </div>
          </div>
        </section>}

        {section === "jadwal" && <section className="rounded-lg border border-[#d4d8df] bg-white p-5">
          <h2 className="font-bold">Tambah jadwal pembelajaran</h2>
          <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" onSubmit={(event) => save(event, "schedule", {})}>
            <label className="text-xs font-medium">Kelas<select className={inputClass} name="className" required><option value="">Pilih kelas</option>{data.classes.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}</select></label>
            <label className="text-xs font-medium">Mata pelajaran<select className={inputClass} name="subject" required><option value="">Pilih mapel</option>{data.subjects.map((item) => <option key={item._id} value={item.name}>{item.name}</option>)}</select></label>
            <label className="text-xs font-medium">Guru pengampu<select className={inputClass} name="teacherId" required><option value="">Pilih guru</option>{data.teachers.map((item) => <option key={item._id} value={item._id}>{item.name} · {item.subject}</option>)}</select></label>
            <label className="text-xs font-medium">Hari<select className={inputClass} name="day">{days.map((day) => <option key={day}>{day}</option>)}</select></label>
            <label className="text-xs font-medium">Jam mulai<input className={inputClass} name="startTime" type="time" required /></label>
            <label className="text-xs font-medium">Jam selesai<input className={inputClass} name="endTime" type="time" required /></label>
            <label className="text-xs font-medium">Periode akademik<select className={inputClass} name="academicPeriodId" required><option value="">Pilih periode</option>{data.periods.map((item) => <option key={item._id} value={item._id}>{item.academicYear} · {item.semester}{item.active ? " (Aktif)" : ""}</option>)}</select></label>
            <button className={`${buttonClass} self-end`} disabled={busy}>Simpan jadwal</button>
          </form>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-[#d4d8df] text-xs text-[#706f70]"><tr><th className="py-3">Hari / Waktu</th><th>Kelas</th><th>Mata pelajaran</th><th>Guru</th><th></th></tr></thead><tbody className="divide-y divide-[#ebedf1]">
              {data.schedules.map((item) => <tr key={item._id}><td className="py-3">{item.day}, {item.startTime}-{item.endTime}</td><td>{item.className}</td><td>{item.subject}</td><td>{item.teacherName}</td><td><button className="text-xs font-semibold text-red-700" onClick={() => remove("schedule", item._id)}>Hapus</button></td></tr>)}
              {!data.schedules.length && <tr><td className="py-5 text-[#706f70]" colSpan={5}>Belum ada jadwal.</td></tr>}
            </tbody></table>
          </div>
        </section>}

        {section === "monitoring" && <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg border border-[#d4d8df] bg-white p-5">
            <h2 className="font-bold">Monitoring pembelajaran guru</h2>
            <p className="mt-1 text-xs text-[#706f70]">Jumlah jadwal mengajar dan nilai yang tersimpan.</p>
            <div className="mt-4 divide-y divide-[#ebedf1]">{data.analytics.teacherLoad.map((teacher) => <div key={teacher.name} className="flex justify-between py-3 text-sm"><span>{teacher.name}</span><span className="text-[#706f70]">{teacher.scheduleCount} jadwal · {teacher.gradeCount} nilai</span></div>)}</div>
          </article>
          <article className="rounded-lg border border-[#d4d8df] bg-white p-5">
            <h2 className="font-bold">Aktivitas akademik terbaru</h2>
            <div className="mt-4 divide-y divide-[#ebedf1]">{data.analytics.activities.map((item, index) => <div key={`${item.kind}-${item.title}-${index}`} className="py-3"><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-[#706f70]">{item.kind} · {item.actor} · {new Date(item.createdAt).toLocaleDateString("id-ID")}</p></div>)}{!data.analytics.activities.length && <p className="text-sm text-[#706f70]">Belum ada aktivitas.</p>}</div>
          </article>
        </section>}

        {section === "laporan" && <section className="rounded-lg border border-[#d4d8df] bg-white p-5">
          <h2 className="font-bold">Laporan akademik</h2>
          <p className="mt-1 text-sm text-[#706f70]">Unduh rekap nilai, jadwal, asesmen, materi, dan aktivitas pembelajaran.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3"><button className={`${buttonClass} inline-flex items-center gap-2`} onClick={() => downloadReport("xlsx")}><Download size={16} />Unduh Excel</button><button className={`${buttonClass} inline-flex items-center gap-2`} onClick={() => downloadReport("pdf")}><Download size={16} />Unduh PDF</button>{reportMessage && <span role="status" className="text-sm text-emerald-700">{reportMessage}</span>}</div>
        </section>}
      </div>
        </div>
      </div>
    </main>
  );
}
