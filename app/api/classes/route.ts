import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SchoolClass from "@/models/schoolClass";
import { recordActivity } from "@/lib/activity";

export async function GET() {
  try {
    await connectDB();
    const classes = await SchoolClass.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error("get classes error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data kelas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const grade = String(body.grade ?? "").trim();
    const major = String(body.major ?? "").trim();
    const homeroomTeacher = String(body.homeroomTeacher ?? "").trim();
    const studentCount = Number(body.studentCount);
    const room = String(body.room ?? "-").trim();

    if (!["X", "XI", "XII"].includes(grade) || !major || !homeroomTeacher || !Number.isInteger(studentCount) || studentCount < 1) {
      return NextResponse.json({ success: false, message: "Data kelas belum lengkap" }, { status: 400 });
    }

    await connectDB();
    const schoolClass = await SchoolClass.create({ name: `${grade}-${major}`, grade, major, homeroomTeacher, studentCount, room });
    await recordActivity(`Kelas baru dibuat: ${schoolClass.name}`, "◇");
    return NextResponse.json({ success: true, schoolClass }, { status: 201 });
  } catch (error) {
    console.error("create class error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data kelas" }, { status: 500 });
  }
}