import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

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

function pickValue(row: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const match = Object.entries(row).find(([entryKey]) => entryKey.toLowerCase().trim() === key.toLowerCase().trim());
    if (match) {
      const value = match[1];
      if (typeof value === "string" && value.trim()) return value.trim();
      if (value !== undefined && value !== null && value !== "") return String(value).trim();
    }
  }
  return "";
}

function normalizeRole(rawRole: string) {
  const candidate = rawRole.toLowerCase().trim();
  const map: Record<string, string> = {
    admin: "admin",
    guru: "guru",
    teacher: "guru",
    pengajar: "guru",
    murid: "murid",
    siswa: "murid",
    student: "murid",
    kepsek: "kepsek",
    kepala: "kepsek",
    kepala_sekolah: "kepsek",
    wakakurikulum: "wakakurikulum",
    wakil: "wakakurikulum",
    kurikulum: "wakakurikulum",
  };

  return map[candidate] ?? (allowedRoles.includes(candidate as (typeof allowedRoles)[number]) ? candidate : "guru");
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "File impor wajib diupload" }, { status: 400 });
    }

    const allowedExtensions = [".csv", ".xls", ".xlsx"];
    const fileName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((extension) => fileName.endsWith(extension));

    if (!isAllowed) {
      return NextResponse.json({ success: false, message: "Format file harus CSV, XLS, atau XLSX" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ success: false, message: "File tidak berisi data" }, { status: 400 });
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });

    if (!rows.length) {
      return NextResponse.json({ success: false, message: "Tidak ada data yang bisa diimpor" }, { status: 400 });
    }

    await connectDB();

    const created: string[] = [];
    const skipped: string[] = [];

    for (const row of rows) {
      const name = pickValue(row, ["nama", "name", "full_name", "full name", "fullname", "nama lengkap"]);
      if (!name) {
        skipped.push("Baris tanpa nama lengkap");
        continue;
      }

      const role = normalizeRole(pickValue(row, ["role", "roles", "jabatan", "peran"]) || "guru");
      const email = generateLoginEmail(name);
      const password = generateDefaultPassword(name);
      const subject = pickValue(row, ["mata_pelajaran", "mata pelajaran", "subject"]);
      const major = pickValue(row, ["jurusan", "major"]);
      const nis = pickValue(row, ["nis", "nisn"]);
      const className = pickValue(row, ["kelas", "class", "class_name"]);

      if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
        skipped.push(`${name}: role tidak valid`);
        continue;
      }

      if (role === "guru" && (!subject || !major)) {
        skipped.push(`${name}: akun guru membutuhkan kolom mata_pelajaran dan jurusan`);
        continue;
      }

      if (role === "murid" && (!nis || !className || !major)) {
        skipped.push(`${name}: akun murid membutuhkan kolom nis, kelas, dan jurusan`);
        continue;
      }

      const existing = await User.findOne({ email });
      if (existing) {
        skipped.push(`${name}: email ${email} sudah ada`);
        continue;
      }

      let userId: string | undefined;
      try {
        const hashedPassword = await import("bcryptjs").then(({ default: bcrypt }) => bcrypt.hash(password, 10));
        const user = await User.create({ nama: name, email, password: hashedPassword, role });
        userId = String(user._id);

        if (role === "guru") {
          await createOrLinkTeacherProfile(user._id, name, subject, major);
        } else if (role === "murid") {
          await createOrLinkStudentProfile(user._id, name, nis, className, major);
        } else {
          await syncSchoolDataAccountLink(user._id, name, role as AccountRole);
        }
        created.push(`${name} (${role})`);
      } catch (rowError) {
        if (userId) await User.findByIdAndDelete(userId);
        if (rowError instanceof AccountProfileConflictError) {
          skipped.push(`${name}: ${rowError.message}`);
          continue;
        }
        if (rowError instanceof Error && "code" in rowError && rowError.code === 11000) {
          skipped.push(`${name}: email atau NIS sudah terdaftar`);
          continue;
        }
        throw rowError;
      }
    }

    await recordActivity(`Impor akun massal selesai: ${created.length} akun ditambahkan`, "📥");

    return NextResponse.json(
      {
        success: true,
        createdCount: created.length,
        skippedCount: skipped.length,
        created,
        skipped,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("import users error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengimpor data akun" }, { status: 500 });
  }
}
