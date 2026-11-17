import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/user";
import { recordActivity } from "@/lib/activity";
import {
  AccountProfileConflictError,
  createOrLinkStudentProfile,
  createOrLinkTeacherProfile,
  syncSchoolDataAccountLink,
  type AccountRole,
} from "@/lib/account-linking";

const allowedRoles = ["admin", "guru", "murid", "kepsek", "wakakurikulum"] as const;

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function generateLoginEmail(fullName: string) {
  const cleaned = normalizeName(fullName);
  if (!cleaned) return "";
  return `${cleaned.split(" ").join(".")}@kelasin.id`;
}

function generateDefaultPassword(fullName: string) {
  const cleaned = normalizeName(fullName).replace(/\s+/g, "");
  return cleaned ? `${cleaned}123` : "kelasin123";
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("get users error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data akun" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase() || generateLoginEmail(name);
    const password = String(body.password ?? "").trim() || generateDefaultPassword(name);
    const role = String(body.role ?? "").trim();
    const teacherProfile = body.teacherProfile ?? {};
    const studentProfile = body.studentProfile ?? {};

    if (!name) {
      return NextResponse.json({ success: false, message: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      return NextResponse.json({ success: false, message: "Role tidak valid" }, { status: 400 });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return NextResponse.json({ success: false, message: "Format email tidak valid" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: "Password minimal 6 karakter" }, { status: 400 });
    }

    if (role === "guru" && (!String(teacherProfile.subject ?? "").trim() || !String(teacherProfile.major ?? "").trim())) {
      return NextResponse.json({ success: false, message: "Mata pelajaran dan jurusan wajib diisi untuk akun guru" }, { status: 400 });
    }

    if (role === "murid" && (!String(studentProfile.nis ?? "").trim() || !String(studentProfile.className ?? "").trim() || !String(studentProfile.major ?? "").trim())) {
      return NextResponse.json({ success: false, message: "NIS, kelas, dan jurusan wajib diisi untuk akun murid" }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email sudah terdaftar" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      nama: name,
      email,
      password: hashedPassword,
      role,
    });

    try {
      if (role === "guru") {
        await createOrLinkTeacherProfile(user._id, name, String(teacherProfile.subject).trim(), String(teacherProfile.major).trim());
      } else if (role === "murid") {
        await createOrLinkStudentProfile(
          user._id,
          name,
          String(studentProfile.nis).trim(),
          String(studentProfile.className).trim(),
          String(studentProfile.major).trim()
        );
      } else {
        await syncSchoolDataAccountLink(user._id, name, role as AccountRole);
      }
    } catch (profileError) {
      await User.findByIdAndDelete(user._id);
      throw profileError;
    }

    await recordActivity(`Akun baru dibuat: ${name} (${role})`, "👤");

    return NextResponse.json(
      {
        success: true,
        user: { id: user._id, name: user.nama, email: user.email, role: user.role },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof AccountProfileConflictError) {
      return NextResponse.json({ success: false, message: error.message }, { status: 409 });
    }

    if (error instanceof Error && "code" in error && error.code === 11000) {
      return NextResponse.json({ success: false, message: "Email atau data identitas sudah terdaftar" }, { status: 409 });
    }

    console.error("create user error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan akun" }, { status: 500 });
  }
}
