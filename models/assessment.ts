import mongoose, { Document, Schema } from "mongoose";

export interface IAssessment extends Document {
  title: string;
  subject: string;
  kelas: string;
  type: "Kuis" | "Ujian" | "Tugas" | "Penilaian";
  deadline?: Date;
  link?: string;
  description?: string;
  status: "Pending" | "Selesai" | "Active" | "Closed";
}

const assessmentSchema = new Schema<IAssessment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    kelas: { type: String, default: "General", trim: true },
    type: { type: String, enum: ["Kuis", "Ujian", "Tugas", "Penilaian"], required: true },
    deadline: { type: Date },
    link: { type: String, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["Pending", "Selesai", "Active", "Closed"], default: "Pending" },
  },
  { timestamps: true }
);

const Assessment = mongoose.models.Assessment || mongoose.model<IAssessment>("Assessment", assessmentSchema);
export default Assessment;