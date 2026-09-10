import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/student";
import { recordActivity } from "@/lib/activity";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID murid tidak valid" }, { status: 400 });

  try {
    await connectDB();
    const student = await Student.findById(id).lean();
    if (!student) return NextResponse.json({ success: false, message: "Murid tidak ditemukan" }, { status: 404 });
    await recordActivity(`Data murid diperbarui: ${student.name}`, "✎");
    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("get student error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data murid" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID murid tidak valid" }, { status: 400 });

  try {
    const body = await request.json();
    const update = {
      name: String(body.name ?? "").trim(),
      className: String(body.className ?? "").trim(),
      major: String(body.major ?? "-").trim(),
    };
    if (!update.name || !update.className || !update.major) return NextResponse.json({ success: false, message: "Nama, jurusan, dan kelas wajib diisi" }, { status: 400 });

    await connectDB();
    const student = await Student.findByIdAndUpdate(id, update, { new: true, runValidators: true }).lean();
    if (!student) return NextResponse.json({ success: false, message: "Murid tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true, student });
  } catch (error) {
    console.error("update student error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui data murid" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID murid tidak valid" }, { status: 400 });

  try {
    await connectDB();
    const student = await Student.findByIdAndDelete(id);
    if (!student) return NextResponse.json({ success: false, message: "Murid tidak ditemukan" }, { status: 404 });
    await recordActivity(`Murid dihapus: ${student.name}`, "▱");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete student error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus data murid" }, { status: 500 });
  }
}