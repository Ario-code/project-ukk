import GuruShell from "./GuruShell";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";
import Assessment from "@/models/assessment";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";
import Student from "@/models/student";
import Attendance from "@/models/attendance";
import Grade from "@/models/grade";

export const dynamic = "force-dynamic";

export default async function GuruDashboardPage() {
  const user = await getCurrentUser();
  await connectDB();

  const [latestMaterials, latestAssessments, students, attendanceCount, gradeCount, latestAttendance, latestGrades] = await Promise.all([
    Material.find().sort({ createdAt: -1 }).limit(3).lean(),
    Assessment.find().sort({ createdAt: -1 }).limit(3).lean(),
    Student.distinct("className"),
    Attendance.countDocuments(),
    Grade.countDocuments(),
    Attendance.find().sort({ updatedAt: -1 }).limit(3).lean(),
    Grade.find().sort({ updatedAt: -1 }).limit(3).lean(),
  ]);

  return (
    <GuruShell>
      <h1 className="mb-8 text-[36px] font-bold text-[#1d2430]">Selamat Datang, {user?.name ?? "Guru"}!</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/guru/kehadiran" className="rounded-2xl border border-[#dfe3ea] bg-white p-5 hover:border-[#168446]"><p className="text-sm text-slate-500">Absensi tersimpan</p><p className="mt-2 text-3xl font-bold">{attendanceCount}</p><p className="mt-2 text-sm font-semibold text-[#168446]">Catat kehadiran →</p></Link>
        <Link href="/guru/nilai" className="rounded-2xl border border-[#dfe3ea] bg-white p-5 hover:border-[#168446]"><p className="text-sm text-slate-500">Nilai tersimpan</p><p className="mt-2 text-3xl font-bold">{gradeCount}</p><p className="mt-2 text-sm font-semibold text-[#168446]">Input nilai & rekap →</p></Link>
        <Link href="/guru/murid" className="rounded-2xl border border-[#dfe3ea] bg-white p-5 hover:border-[#168446]"><p className="text-sm text-slate-500">Kelas terdaftar</p><p className="mt-2 text-3xl font-bold">{students.length}</p><p className="mt-2 text-sm font-semibold text-[#168446]">Lihat kelas →</p></Link>
      </div>

      <div className="rounded-[20px] border border-[#dfe3ea] bg-white">
        <div className="border-b border-[#e9edf2] bg-[#f7f9fb] px-6 py-4">
          <h2 className="text-[18px] font-bold text-[#1d2430]">Histori</h2>
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#5d6776]">Materi Ditambahkan</h3>
            {latestMaterials.length === 0 ? (
              <p className="text-[13px] text-[#8b93a1]">Belum ada materi.</p>
            ) : (
              <ul className="space-y-2 text-[14px] text-[#2d3543]">
                {latestMaterials.map((m) => (
                  <li key={String(m._id)}>{m.title} <span className="text-[#8b93a1]">({m.subject})</span></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#5d6776]">Assesmen Ditambahkan</h3>
            {latestAssessments.length === 0 ? (
              <p className="text-[13px] text-[#8b93a1]">Belum ada assesmen.</p>
            ) : (
              <ul className="space-y-2 text-[14px] text-[#2d3543]">
                {latestAssessments.map((a) => (
                  <li key={String(a._id)}>
                    {a.title} <span className="text-[#8b93a1]">(Deadline: {a.deadline ? new Date(a.deadline).toLocaleDateString("id-ID") : "belum ditentukan"})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#5d6776]">Histori Kehadiran</h3>
            {latestAttendance.length === 0 ? (
              <p className="text-[13px] text-[#8b93a1]">Belum ada absensi.</p>
            ) : (
              <ul className="space-y-2 text-[14px] text-[#2d3543]">
                {latestAttendance.map((item) => (
                  <li key={String(item._id)}>{item.className} <span className="text-[#8b93a1]">({new Date(`${item.date}T00:00:00`).toLocaleDateString("id-ID")})</span></li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-[13px] font-bold uppercase tracking-wide text-[#5d6776]">Nilai Terbaru</h3>
            {latestGrades.length === 0 ? (
              <p className="text-[13px] text-[#8b93a1]">Belum ada nilai.</p>
            ) : (
              <ul className="space-y-2 text-[14px] text-[#2d3543]">
                {latestGrades.map((item) => (
                  <li key={String(item._id)}>{item.studentName} — {item.assessmentTitle}: <span className="font-semibold">{item.score}</span></li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </GuruShell>
  );
}