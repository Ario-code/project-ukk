import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { connectDB } from "@/lib/mongodb";
import Submission from "@/models/submission";
import { getCurrentUser } from "@/lib/auth";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED = [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".zip", ".png", ".jpg", ".jpeg"];

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Belum login" }, { status: 401 });
  try {
    await connectDB();
    const submissions = await Submission.find({ userId: user.id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error("get submissions error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ success: false, message: "Belum login" }, { status: 401 });
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const file = formData.get("file");

    if (!title || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Judul dan file wajib diisi" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: "Ukuran file maksimal 10 MB" }, { status: 400 });
    }
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return NextResponse.json({ success: false, message: "Tipe file tidak diizinkan" }, { status: 400 });
    }

    const blob = await put(`submissions/${user.id}/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    await connectDB();
    const submission = await Submission.create({
      userId: user.id,
      title,
      fileName: file.name,
      fileUrl: blob.url,
      fileType: ext.slice(1).toUpperCase(),
      sizeLabel: formatSize(file.size),
    });
    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error("create submission error:", error);
    return NextResponse.json({ success: false, message: "Gagal upload file" }, { status: 500 });
  }
}