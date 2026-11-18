import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Grade from "@/models/grade";
import Student from "@/models/student";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || !["guru", "admin"].includes(user.role)) return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  try {
    await connectDB();
    const grades = await Grade.find().sort({ updatedAt: -1 }).limit(500).lean();
    return NextResponse.json({ success: true, grades });
  } catch (error) {
    console.error("get grades error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil rekap nilai" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["guru", "admin"].includes(user.role)) return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  try {
    const body = await request.json();
    const studentId = String(body.studentId ?? "");
    const assessmentTitle = String(body.assessmentTitle ?? "").trim();
    const className = String(body.className ?? "").trim();
    const assessmentType = String(body.assessmentType ?? "");
    const score = Number(body.score);
    if (!studentId || !assessmentTitle || !className || !["Tugas", "Kuis", "Ujian", "Penilaian"].includes(assessmentType) || !Number.isFinite(score) || score < 0 || score > 100) {
      return NextResponse.json({ success: false, message: "Data nilai tidak valid" }, { status: 400 });
    }
    await connectDB();
    const student = await Student.findOne({ _id: studentId, className }).select("name").lean();
    if (!student) return NextResponse.json({ success: false, message: "Murid tidak ditemukan di kelas tersebut" }, { status: 404 });
    const grade = await Grade.findOneAndUpdate(
      { studentId, assessmentTitle, className },
      { studentId, studentName: student.name, className, assessmentTitle, assessmentType, score, feedback: String(body.feedback ?? ""), gradedBy: user.id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return NextResponse.json({ success: true, grade });
  } catch (error) {
    console.error("save grade error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan nilai" }, { status: 500 });
  }
}
