import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Activity from "@/models/activity";
import Assessment from "@/models/assessment";
import Grade from "@/models/grade";
import LessonSchedule from "@/models/lessonSchedule";
import Material from "@/models/material";

function createPdf(lines: string[]) {
  const escaped = lines.map((line) => line.replace(/[^\x20-\x7E]/g, "?").replace(/([\\()])/g, "\\$1"));
  const pages = Array.from({ length: Math.max(1, Math.ceil(escaped.length / 48)) }, (_, index) => escaped.slice(index * 48, (index + 1) * 48));
  const pageRefs = pages.map((_, index) => `${4 + index * 2} 0 R`).join(" ");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageRefs}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  pages.forEach((page, index) => {
    const commands = ["BT", "/F1 9 Tf", "45 755 Td"];
    page.forEach((line, lineIndex) => {
      if (lineIndex) commands.push("0 -14 Td");
      commands.push(`(${line.slice(0, 110)}) Tj`);
    });
    commands.push("ET");
    const stream = commands.join("\n");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + index * 2} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`);
  });
  let document = "%PDF-1.4\n";
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(Buffer.byteLength(document, "ascii"));
    document += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xrefOffset = Buffer.byteLength(document, "ascii");
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    document += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(document, "ascii");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "wakakurikulum") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }
  try {
    await connectDB();
    const [grades, schedules, assessments, materials, activities] = await Promise.all([
      Grade.find().sort({ className: 1, studentName: 1 }).lean(),
      LessonSchedule.find().sort({ day: 1, startTime: 1 }).lean(),
      Assessment.find().sort({ createdAt: -1 }).limit(500).lean(),
      Material.find().sort({ createdAt: -1 }).limit(500).lean(),
      Activity.find().sort({ createdAt: -1 }).limit(500).lean(),
    ]);
    const rows = [
      ...grades.map((grade) => ({
        "Jenis laporan": "Rekap nilai",
        "Nama siswa": grade.studentName,
        Kelas: grade.className,
        Kegiatan: `${grade.assessmentTitle} (${grade.assessmentType})`,
        Nilai: grade.score,
        "Guru / Pengguna": grade.gradedBy,
        Tanggal: grade.updatedAt ? new Date(grade.updatedAt).toLocaleDateString("id-ID") : "",
      })),
      ...schedules.map((schedule) => ({
        "Jenis laporan": "Jadwal pembelajaran",
        "Nama siswa": "",
        Kelas: schedule.className,
        Kegiatan: `${schedule.day}, ${schedule.startTime}-${schedule.endTime}: ${schedule.subject}`,
        Nilai: "",
        "Guru / Pengguna": schedule.teacherName,
        Tanggal: "",
      })),
      ...assessments.map((item) => ({
        "Jenis laporan": "Aktivitas asesmen",
        "Nama siswa": "",
        Kelas: item.kelas,
        Kegiatan: `${item.title} (${item.subject})`,
        Nilai: "",
        "Guru / Pengguna": "",
        Tanggal: new Date(item.createdAt).toLocaleDateString("id-ID"),
      })),
      ...materials.map((item) => ({
        "Jenis laporan": "Aktivitas materi",
        "Nama siswa": "",
        Kelas: item.kelas,
        Kegiatan: `${item.title} (${item.subject})`,
        Nilai: "",
        "Guru / Pengguna": item.uploadedBy ?? "",
        Tanggal: new Date(item.createdAt).toLocaleDateString("id-ID"),
      })),
      ...activities.map((item) => ({
        "Jenis laporan": "Aktivitas akademik",
        "Nama siswa": "",
        Kelas: "",
        Kegiatan: item.activity,
        Nilai: "",
        "Guru / Pengguna": item.user,
        Tanggal: new Date(item.createdAt).toLocaleDateString("id-ID"),
      })),
    ];
    const format = new URL(request.url).searchParams.get("format");
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(rows), "Laporan Akademik");
    const filename = `laporan-akademik-${new Date().toISOString().slice(0, 10)}`;
    if (format === "pdf") {
      const lines = [
        "Laporan Akademik",
        `Dibuat: ${new Date().toLocaleDateString("id-ID")}`,
        `Total rekap nilai: ${grades.length}`,
        `Total jadwal: ${schedules.length}`,
        `Total aktivitas: ${assessments.length + materials.length + activities.length}`,
        ...rows.map((row) => `${row["Jenis laporan"]} | ${row.Kelas} | ${row.Kegiatan} | ${row["Nama siswa"]} | ${row.Nilai}`),
      ];
      return new NextResponse(createPdf(lines), {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}.pdf"`,
        },
      });
    }
    if (format !== "xlsx") {
      return NextResponse.json({ success: false, message: "Format laporan tidak didukung" }, { status: 400 });
    }
    const file = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return new NextResponse(file, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("export curriculum report error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengunduh laporan akademik" }, { status: 500 });
  }
}
