import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { recordActivity } from "@/lib/activity";
import Teacher from "@/models/teacher";
import User from "@/models/user";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await context.params;
  if (!isValidObjectId(id)) {
    return NextResponse.json({ success: false, message: "ID guru tidak valid" }, { status: 400 });
  }

  try {
    await connectDB();
    const teacher = await Teacher.findById(id);
    if (!teacher) {
      return NextResponse.json({ success: false, message: "Data guru tidak ditemukan" }, { status: 404 });
    }

    if (teacher.userId) {
      await User.deleteOne({ _id: teacher.userId, role: "guru" });
    }
    await Teacher.findByIdAndDelete(id);
    await recordActivity(`Data guru dihapus: ${teacher.name}`, "▱");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete teacher error:", error);
    return NextResponse.json({ success: false, message: "Gagal menghapus data guru" }, { status: 500 });
  }
}
