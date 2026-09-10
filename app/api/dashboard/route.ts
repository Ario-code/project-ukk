import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/teacher";
import Student from "@/models/student";
import SchoolClass from "@/models/schoolClass";

export async function GET() {
  try {
    await connectDB();
    const [teachers, students, classes] = await Promise.all([Teacher.countDocuments(), Student.countDocuments(), SchoolClass.countDocuments()]);
    return NextResponse.json({ success: true, statistics: { teachers, students, classes } });
  } catch (error) {
    console.error("get dashboard statistics error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil statistik dashboard" }, { status: 500 });
  }
}