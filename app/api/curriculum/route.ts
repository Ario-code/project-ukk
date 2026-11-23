import { NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import AcademicPeriod from "@/models/academicPeriod";
import Activity from "@/models/activity";
import Assessment from "@/models/assessment";
import CurriculumSubject from "@/models/curriculumSubject";
import Grade from "@/models/grade";
import LessonSchedule from "@/models/lessonSchedule";
import Material from "@/models/material";
import SchoolClass from "@/models/schoolClass";
import Student from "@/models/student";
import Teacher from "@/models/teacher";

const isCurriculumUser = (role: string) => role === "wakakurikulum";
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !isCurriculumUser(user.role)) {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    await connectDB();
    const [subjects, periods, schedules, classes, teachers, students, grades, assessments, materials, activities] = await Promise.all([
      CurriculumSubject.find().sort({ name: 1 }).lean(),
      AcademicPeriod.find().sort({ createdAt: -1 }).lean(),
      LessonSchedule.find().sort({ day: 1, startTime: 1 }).lean(),
      SchoolClass.find().sort({ grade: 1, major: 1 }).select("name").lean(),
      Teacher.find({ status: "Active" }).sort({ name: 1 }).select("name subject userId").lean(),
      Student.countDocuments(),
      Grade.find().sort({ updatedAt: -1 }).limit(500).lean(),
      Assessment.find().sort({ createdAt: -1 }).limit(20).lean(),
      Material.find().sort({ createdAt: -1 }).limit(20).lean(),
      Activity.find().sort({ createdAt: -1 }).limit(10).lean(),
    ]);
    const teacherLoad = teachers.map((teacher) => ({
      name: teacher.name,
      scheduleCount: schedules.filter((schedule) => String(schedule.teacherId) === String(teacher._id)).length,
      gradeCount: grades.filter((grade) => teacher.userId && grade.gradedBy === String(teacher.userId)).length,
    }));
    return NextResponse.json({
      success: true,
      subjects,
      periods,
      schedules,
      classes,
      teachers,
      analytics: {
        students,
        teachers: teachers.length,
        classes: classes.length,
        grades: grades.length,
        teacherLoad,
        activities: [
          ...activities.map((item) => ({ title: item.activity, actor: item.user, createdAt: item.createdAt, kind: "Aktivitas" })),
          ...assessments.map((item) => ({ title: item.title, actor: item.subject, createdAt: item.createdAt, kind: "Asesmen" })),
          ...materials.map((item) => ({ title: item.title, actor: item.uploadedBy ?? item.subject, createdAt: item.createdAt, kind: "Materi" })),
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10),
      },
    });
  } catch (error) {
    console.error("get curriculum data error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data kurikulum" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isCurriculumUser(user.role)) {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    const body = await request.json();
    await connectDB();

    if (body.entity === "subject") {
      const name = String(body.name ?? "").trim();
      const code = String(body.code ?? "").trim().toUpperCase();
      const weeklyHours = Number(body.weeklyHours);
      const classes = Array.isArray(body.classes) ? body.classes.map((item: unknown) => String(item).trim()).filter(Boolean) : [];
      if (!name || !code || !Number.isInteger(weeklyHours) || weeklyHours < 1) {
        return NextResponse.json({ success: false, message: "Nama, kode, dan alokasi jam mapel wajib valid" }, { status: 400 });
      }
      const subject = await CurriculumSubject.create({ name, code, weeklyHours, classes });
      return NextResponse.json({ success: true, subject }, { status: 201 });
    }

    if (body.entity === "period") {
      const academicYear = String(body.academicYear ?? "").trim();
      const semester = String(body.semester ?? "");
      if (!academicYear || !["Ganjil", "Genap"].includes(semester)) {
        return NextResponse.json({ success: false, message: "Tahun ajaran dan semester wajib diisi" }, { status: 400 });
      }
      const active = Boolean(body.active);
      if (active) await AcademicPeriod.updateMany({}, { active: false });
      const period = await AcademicPeriod.create({ academicYear, semester, active });
      return NextResponse.json({ success: true, period }, { status: 201 });
    }

    if (body.entity === "schedule") {
      const className = String(body.className ?? "").trim();
      const subject = String(body.subject ?? "").trim();
      const teacherId = String(body.teacherId ?? "");
      const day = String(body.day ?? "");
      const startTime = String(body.startTime ?? "");
      const endTime = String(body.endTime ?? "");
      const academicPeriodId = String(body.academicPeriodId ?? "");
      const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      if (!className || !subject || !Types.ObjectId.isValid(teacherId) || !Types.ObjectId.isValid(academicPeriodId) ||
        !days.includes(day) || !timePattern.test(startTime) || !timePattern.test(endTime) || startTime >= endTime) {
        return NextResponse.json({ success: false, message: "Data jadwal tidak valid" }, { status: 400 });
      }
      const [teacher, period, schoolClass, existing] = await Promise.all([
        Teacher.findOne({ _id: teacherId, status: "Active" }).select("name").lean(),
        AcademicPeriod.findById(academicPeriodId).lean(),
        SchoolClass.findOne({ name: className }).select("_id").lean(),
        LessonSchedule.find({ day, academicPeriodId }).lean(),
      ]);
      if (!teacher || !period || !schoolClass) {
        return NextResponse.json({ success: false, message: "Guru, kelas, atau periode akademik tidak ditemukan" }, { status: 404 });
      }
      const overlaps = existing.some((item) =>
        item.startTime < endTime && startTime < item.endTime &&
        (String(item.teacherId) === teacherId || item.className === className)
      );
      if (overlaps) {
        return NextResponse.json({ success: false, message: "Jadwal bentrok: guru atau kelas sudah memiliki jadwal pada rentang waktu tersebut." }, { status: 409 });
      }
      const schedule = await LessonSchedule.create({
        className, subject, teacherId, teacherName: teacher.name, day, startTime, endTime, academicPeriodId,
      });
      return NextResponse.json({ success: true, schedule }, { status: 201 });
    }

    return NextResponse.json({ success: false, message: "Jenis data tidak dikenal" }, { status: 400 });
  } catch (error) {
    console.error("save curriculum data error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data kurikulum" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isCurriculumUser(user.role)) {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const entity = searchParams.get("entity");
    const id = searchParams.get("id");
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "ID data tidak valid" }, { status: 400 });
    }
    await connectDB();
    if (!entity || !["subject", "period", "schedule"].includes(entity)) {
      return NextResponse.json({ success: false, message: "Jenis data tidak dikenal" }, { status: 400 });
    }
    if (entity === "period") {
      const period = await AcademicPeriod.findById(id).lean();
      if (!period) return NextResponse.json({ success: false, message: "Periode tidak ditemukan" }, { status: 404 });
      if (period.active) return NextResponse.json({ success: false, message: "Jadikan periode lain aktif sebelum menghapus periode ini" }, { status: 409 });
      if (await LessonSchedule.exists({ academicPeriodId: id })) {
        return NextResponse.json({ success: false, message: "Periode masih digunakan oleh jadwal pembelajaran" }, { status: 409 });
      }
    }
    if (entity === "subject") {
      const subject = await CurriculumSubject.findById(id).lean();
      if (!subject) return NextResponse.json({ success: false, message: "Mata pelajaran tidak ditemukan" }, { status: 404 });
      if (await LessonSchedule.exists({ subject: subject.name })) {
        return NextResponse.json({ success: false, message: "Mata pelajaran masih digunakan oleh jadwal pembelajaran" }, { status: 409 });
      }
    }
    const result = entity === "subject"
      ? await CurriculumSubject.findByIdAndDelete(id)
      : entity === "period"
        ? await AcademicPeriod.findByIdAndDelete(id)
        : await LessonSchedule.findByIdAndDelete(id);
    if (!result) return NextResponse.json({ success: false, message: "Data tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete curriculum data error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus data kurikulum" }, { status: 500 });
  }
}
