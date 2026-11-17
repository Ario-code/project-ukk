import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/student";
import User from "@/models/user";
import { recordActivity } from "@/lib/activity";
import { findAccountByName, findMatchingAccount } from "@/lib/account-linking";

export async function GET() {
  try {
    await connectDB();
    const [students, accounts] = await Promise.all([
      Student.find().sort({ createdAt: -1 }).lean(),
      User.find({ role: "murid" }).select("_id nama email").lean(),
    ]);
    const studentsWithAccounts = students.map((student) => {
      const account = (student.userId && accounts.find((item) => String(item._id) === String(student.userId))) || findAccountByName(accounts, student.name);
      return { ...student, accountExists: Boolean(account), accountEmail: account?.email ?? null };
    });
    return NextResponse.json({ success: true, students: studentsWithAccounts });
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
    const account = await findMatchingAccount(name, "murid");
    const student = await Student.create({ nis, name, className, major, ...(account ? { userId: account._id } : {}) });
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