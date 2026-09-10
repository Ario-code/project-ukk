import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/teacher";
import { recordActivity } from "@/lib/activity";

export async function GET() {
  try {
    await connectDB();
    const teachers = await Teacher.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, teachers });
  } catch (error) {
    console.error("get teachers error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data guru" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const classes = String(body.classes ?? "").trim();

    if (!name || !subject || !classes) {
      return NextResponse.json({ success: false, message: "Nama, mata pelajaran, dan kelas wajib diisi" }, { status: 400 });
    }

    await connectDB();
    const teacher = await Teacher.create({ name, subject, classes });
    await recordActivity(`Guru baru ditambahkan: ${name}`, "♙");
    return NextResponse.json({ success: true, teacher }, { status: 201 });
  } catch (error) {
    console.error("create teacher error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data guru" }, { status: 500 });
  }
}