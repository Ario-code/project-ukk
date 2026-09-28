import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Teacher from "@/models/teacher";
import Student from "@/models/student";
import SchoolClass from "@/models/schoolClass";
import Material from "@/models/material";
import Assessment from "@/models/assessment";

export async function GET() {
  try {
    await connectDB();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const [teachers, students, classes, materials, tugas, kuis] = await Promise.all([
      Teacher.countDocuments(),
      Student.countDocuments(),
      SchoolClass.countDocuments(),
      Material.countDocuments(),
      Assessment.countDocuments({ type: "Tugas" }),
      Assessment.countDocuments({ type: "Kuis", deadline: { $lte: sevenDaysFromNow } }),
    ]);

    return NextResponse.json({
      success: true,
      statistics: { teachers, students, classes, materials, tugas, kuis },
    });
  } catch (error) {
    console.error("get dashboard statistics error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil statistik dashboard" }, { status: 500 });
  }
}