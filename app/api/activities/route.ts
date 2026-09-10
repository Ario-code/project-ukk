import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Activity from "@/models/activity";

export async function GET() {
  try {
    await connectDB();
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(5).lean();
    return NextResponse.json({ success: true, activities });
  } catch (error) {
    console.error("get activities error:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil aktivitas" }, { status: 500 });
  }
}