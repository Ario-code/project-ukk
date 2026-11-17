import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/teacher";
import User from "@/models/user";
import { recordActivity } from "@/lib/activity";
import { findAccountByName, findMatchingAccount, resolveTeacherMajor } from "@/lib/account-linking";

export async function GET() {
  try {
    await connectDB();
    const [teachers, accounts] = await Promise.all([
      Teacher.find().sort({ createdAt: -1 }).lean(),
      User.find({ role: "guru" }).select("_id nama email").lean(),
    ]);
    const teachersWithAccounts = teachers.map((teacher) => {
      const account = (teacher.userId && accounts.find((item) => String(item._id) === String(teacher.userId))) || findAccountByName(accounts, teacher.name);
      return { ...teacher, major: resolveTeacherMajor(teacher.major, teacher.classes), accountExists: Boolean(account), accountEmail: account?.email ?? null };
    });
    return NextResponse.json({ success: true, teachers: teachersWithAccounts });
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
    const major = String(body.major ?? "").trim();
    const classes = String(body.classes ?? "-").trim() || "-";

    if (!name || !subject || !major) {
      return NextResponse.json({ success: false, message: "Nama, mata pelajaran, dan jurusan wajib diisi" }, { status: 400 });
    }

    await connectDB();
    const account = await findMatchingAccount(name, "guru");
    const teacher = await Teacher.create({ name, subject, major, classes, ...(account ? { userId: account._id } : {}) });
    await recordActivity(`Guru baru ditambahkan: ${name}`, "♙");
    return NextResponse.json({ success: true, teacher }, { status: 201 });
  } catch (error) {
    console.error("create teacher error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data guru" }, { status: 500 });
  }
}