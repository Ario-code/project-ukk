import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/material";
import { getCurrentUser } from "@/lib/auth";

const MAX_SIZE = 50 * 1024 * 1024;
const ALLOWED = [".pdf", ".doc", ".docx", ".ppt", ".pptx"];

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} KB`;
}

export async function GET() {
  try {
    await connectDB();
    const materials = await Material.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, materials });
  } catch (error) {
    console.error("get materials error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data materi" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !["guru", "admin"].includes(user.role)) {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }
  try {
    const formData = await request.formData();
    const title = String(formData.get("title") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const kelas = String(formData.get("kelas") ?? "General").trim();
    const description = String(formData.get("description") ?? "").trim();
    const file = formData.get("file");

    if (!title || !subject || !(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Judul, mapel, dan file wajib diisi" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, message: "Ukuran file maksimal 50 MB" }, { status: 400 });
    }
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!ALLOWED.includes(ext)) {
      return NextResponse.json({ success: false, message: "Tipe file harus PDF, DOC, atau PPT" }, { status: 400 });
    }

    const blob = await put(`materials/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    await connectDB();
    const material = await Material.create({
      title,
      subject,
      kelas,
      description,
      fileUrl: blob.url,
      fileType: ext.slice(1).toUpperCase(),
      sizeLabel: formatSize(file.size),
      uploadedBy: user.id,
    });
    return NextResponse.json({ success: true, material }, { status: 201 });
  } catch (error) {
    console.error("create material error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan materi" }, { status: 500 });
  }
}