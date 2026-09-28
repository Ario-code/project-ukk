import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Assessment from "@/models/assessment";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    await connectDB();
    const assessments = await Assessment.find().sort({ deadline: 1 }).lean();
    return NextResponse.json({ success: true, assessments });
  } catch (error) {
    console.error("get assessments error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data assesmen" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["guru", "admin"].includes(user.role)) {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const title = String(body.title ?? "").trim();
    const subject = String(body.subject ?? "").trim();
    const type = String(body.type ?? "").trim();

    if (!title || !subject || !type) {
      return NextResponse.json({ success: false, message: "Judul, mapel, dan tipe wajib diisi" }, { status: 400 });
    }

    await connectDB();
    const assessment = await Assessment.create({
      title,
      subject,
      type,
      kelas: body.kelas ?? "General",
      link: body.link ?? "",
      description: body.description ?? "",
      deadline: body.deadline ? new Date(body.deadline) : undefined,
    });
    return NextResponse.json({ success: true, assessment }, { status: 201 });
  } catch (error) {
    console.error("create assessment error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan assesmen" }, { status: 500 });
  }
}