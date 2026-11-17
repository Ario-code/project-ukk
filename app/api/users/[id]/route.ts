import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";

import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/user";
import { recordActivity } from "@/lib/activity";
import { syncSchoolDataAccountLink, type AccountRole } from "@/lib/account-linking";

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

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID akun tidak valid" }, { status: 400 });

  try {
    await connectDB();
    const user = await User.findById(id).select("nama email role createdAt").lean();
    if (!user) return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("get user error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data akun" }, { status: 500 });
  }
}

export async function PUT(request: Request, context: Context) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID akun tidak valid" }, { status: 400 });

  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const role = String(body.role ?? "").trim();

    if (!name) {
      return NextResponse.json({ success: false, message: "Nama lengkap wajib diisi" }, { status: 400 });
    }

    if (role && !allowedRoles.includes(role as (typeof allowedRoles)[number])) {
      return NextResponse.json({ success: false, message: "Role tidak valid" }, { status: 400 });
    }

    await connectDB();
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });
    }

    const email = generateLoginEmail(name);
    const password = await bcrypt.hash(generateDefaultPassword(name), 10);

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        nama: name,
        email,
        password,
        role,
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });
    }

    await syncSchoolDataAccountLink(updatedUser._id, updatedUser.nama, updatedUser.role as AccountRole);
    await recordActivity(`Akun diperbarui: ${name}`, "✎");
    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("update user error:", error);
    return NextResponse.json({ success: false, message: "Gagal memperbarui akun" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: Context) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) return NextResponse.json({ success: false, message: "ID akun tidak valid" }, { status: 400 });

  try {
    await connectDB();
    const user = await User.findById(id);
    if (!user) return NextResponse.json({ success: false, message: "Akun tidak ditemukan" }, { status: 404 });

    await syncSchoolDataAccountLink(user._id, user.nama, "admin");
    await User.findByIdAndDelete(id);
    await recordActivity(`Akun dihapus: ${user.nama}`, "▱");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete user error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus akun" }, { status: 500 });
  }
}
