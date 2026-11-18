import mongoose, { Document, Schema } from "mongoose";

export interface IAttendance extends Document {
  className: string;
  date: string;
  records: Array<{ studentId: string; studentName: string; status: "Hadir" | "Izin" | "Sakit" | "Alpa" }>;
  recordedBy: string;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    className: { type: String, required: true, trim: true },
    date: { type: String, required: true, index: true },
    records: [{
      studentId: { type: String, required: true },
      studentName: { type: String, required: true },
      status: { type: String, enum: ["Hadir", "Izin", "Sakit", "Alpa"], required: true },
    }],
    recordedBy: { type: String, required: true },
  },
  { timestamps: true }
);
attendanceSchema.index({ className:  1, date: 1 }, { unique: true });

export default mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", attendanceSchema);
