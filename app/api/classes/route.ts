import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SchoolClass from "@/models/schoolClass";
import Teacher from "@/models/teacher";
import User from "@/models/user";
import { recordActivity } from "@/lib/activity";
import { findAccountByName, findRecordByName } from "@/lib/account-linking";

export async function GET() {
  try {
    await connectDB();
    const [classes, teachers, accounts] = await Promise.all([
      SchoolClass.find().sort({ createdAt: -1 }).lean(),
      Teacher.find().select("_id name userId").lean(),
      User.find({ role: "guru" }).select("_id nama email").lean(),
    ]);
    const classesWithAccountStatus = classes.map((schoolClass) => {
      const teacher = (schoolClass.homeroomTeacherId && teachers.find((item) => String(item._id) === String(schoolClass.homeroomTeacherId))) || findRecordByName(teachers, schoolClass.homeroomTeacher);
      const account = (teacher?.userId && accounts.find((item) => String(item._id) === String(teacher.userId))) || findAccountByName(accounts, teacher?.name ?? schoolClass.homeroomTeacher);
      return {
        ...schoolClass,
        homeroomTeacherId: teacher?._id ?? schoolClass.homeroomTeacherId ?? null,
        homeroomTeacherAccountExists: Boolean(account),
        homeroomTeacherAccountEmail: account?.email ?? null,
      };
    });
    return NextResponse.json({ success: true, classes: classesWithAccountStatus });
  } catch (error) {
    console.error("get classes error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data kelas" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const grade = String(body.grade ?? "").trim();
    const major = String(body.major ?? "").trim();
    const homeroomTeacher = String(body.homeroomTeacher ?? "").trim();
    const studentCount = Number(body.studentCount);
    const room = String(body.room ?? "-").trim();

    if (!["X", "XI", "XII"].includes(grade) || !major || !homeroomTeacher || !Number.isInteger(studentCount) || studentCount < 1) {
      return NextResponse.json({ success: false, message: "Data kelas belum lengkap" }, { status: 400 });
    }

    await connectDB();
    const schoolClass = await SchoolClass.create({
      name: `${grade}-${major}`,
      grade,
      major,
      homeroomTeacher,
      studentCount,
      room,
    });
    await recordActivity(`Kelas baru dibuat: ${schoolClass.name}`, "◇");
    return NextResponse.json({ success: true, schoolClass }, { status: 201 });
  } catch (error) {
    console.error("create class error:", error);
    return NextResponse.json({ success: false, message: "Gagal menyimpan data kelas" }, { status: 500 });
  }
}