import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/student";
import { recordActivity } from "@/lib/activity";

export async function GET() {
  try {
    await connectDB();
    const students = await Student.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error("get students error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data murid" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nis = String(body.nis ?? "").trim();
    const name = String(body.name ?? "").trim();
    const className = String(body.className ?? "").trim();
    const major = String(body.major ?? "-").trim();

    if (!nis || !name || !className) {
      return NextResponse.json({ success: false, message: "NIS, nama, dan kelas wajib diisi" }, { status: 400 });
    }

    await connectDB();
    const student = await Student.create({ nis, name, className, major });
    await recordActivity(`Murid baru ditambahkan: ${name}`, "♟");
    return NextResponse.json({ success: true, student }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json({ success: false, message: "NIS murid sudah terdaftar" }, { status: 409 });
    }
    console.error("create student error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data murid" }, { status: 500 });
  }
}