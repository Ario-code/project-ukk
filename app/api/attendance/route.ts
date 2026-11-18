import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import Attendance from "@/models/attendance";
import Student from "@/models/student";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["guru", "admin"].includes(user.role)) return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  try {
    await connectDB();
    const url = new URL(request.url);
    const className = url.searchParams.get("className");
    const date = url.searchParams.get("date");
    if (className && date) {
      const attendance = await Attendance.findOne({ className, date }).lean();
      const students = await Student.find({ className, status: "Active" }).sort({ name: 1 }).lean();
      return NextResponse.json({ success: true, attendance, students });
    }
    const records = await Attendance.find().sort({ date: -1 }).limit(100).lean();
    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("get attendance error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil absensi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["guru", "admin"].includes(user.role)) return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  try {
    const body = await request.json();
    const className = String(body.className ?? "").trim();
    const date = String(body.date ?? "").trim();
    const records = body.records;
    if (!className || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Array.isArray(records) || !records.length) {
      return NextResponse.json({ success: false, message: "Kelas, tanggal, dan data absensi wajib diisi" }, { status: 400 });
    }
    const validStatuses = ["Hadir", "Izin", "Sakit", "Alpa"];
    if (records.some((item) => !item.studentId || !validStatuses.includes(item.status))) {
      return NextResponse.json({ success: false, message: "Data status absensi tidak valid" }, { status: 400 });
    }
    await connectDB();
    const students = await Student.find({ className, status: "Active" }).select("_id name").lean();
    const studentMap = new Map(students.map((student) => [String(student._id), student.name]));
    if (records.some((item) => !studentMap.has(String(item.studentId)))) {
      return NextResponse.json({ success: false, message: "Daftar murid tidak cocok dengan kelas" }, { status: 400 });
    }
    const normalized = records.map((item) => ({
      studentId: String(item.studentId),
      studentName: studentMap.get(String(item.studentId))!,
      status: item.status,
    }));
    const attendance = await Attendance.findOneAndUpdate(
      { className, date },
      { className, date, records: normalized, recordedBy: user.id },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    return NextResponse.json({ success: true, attendance });
  } catch (error) {
    console.error("save attendance error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan absensi" }, { status: 500 });
  }
}
