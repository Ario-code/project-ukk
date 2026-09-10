import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SchoolClass from "@/models/schoolClass";
import { recordActivity } from "@/lib/activity";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID kelas tidak valid" }, { status: 400 });
  try {
    await connectDB();
    const schoolClass = await SchoolClass.findById(id).lean();
    if (!schoolClass) return NextResponse.json({ success: false, message: "Kelas tidak ditemukan" }, { status: 404 });
    await recordActivity(`Kelas diperbarui: ${schoolClass.name}`, "✎");
    return NextResponse.json({ success: true, schoolClass });
  } catch (error) {
    console.error("get class error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data kelas" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID kelas tidak valid" }, { status: 400 });
  try {
    const body = await request.json();
    const grade = String(body.grade ?? "").trim();
    const major = String(body.major ?? "").trim();
    const homeroomTeacher = String(body.homeroomTeacher ?? "").trim();
    const studentCount = Number(body.studentCount);
    const room = String(body.room ?? "-").trim();
    if (!["X", "XI", "XII"].includes(grade) || !major || !homeroomTeacher || !Number.isInteger(studentCount) || studentCount < 1) return NextResponse.json({ success: false, message: "Data kelas belum lengkap" }, { status: 400 });
    await connectDB();
    const schoolClass = await SchoolClass.findByIdAndUpdate(id, { name: `${grade}-${major}`, grade, major, homeroomTeacher, studentCount, room }, { new: true, runValidators: true }).lean();
    if (!schoolClass) return NextResponse.json({ success: false, message: "Kelas tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, schoolClass });
  } catch (error) {
    console.error("update class error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui kelas" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID kelas tidak valid" }, { status: 400 });
  try {
    await connectDB();
    const schoolClass = await SchoolClass.findByIdAndDelete(id);
    if (!schoolClass) return NextResponse.json({ success: false, message: "Kelas tidak ditemukan" }, { status: 404 });
    await recordActivity(`Kelas dihapus: ${schoolClass.name}`, "▱");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete class error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus kelas" }, { status: 500 });
  }
}