import mongoose, { Document, Schema } from "mongoose";

export interface IGrade extends Document {
  studentId: string;
  studentName: string;
  className: string;
  assessmentTitle: string;
  assessmentType: "Tugas" | "Kuis" | "Ujian" | "Penilaian";
  score: number;
  feedback?: string;
  submissionId?: string;
  gradedBy: string;
}

const gradeSchema = new Schema<IGrade>(
  {
    studentId: { type: String, required: true, index: true },
    studentName: { type: String, required: true },
    className: { type: String, required: true, index: true },
    assessmentTitle: { type: String, required: true },
    assessmentType: { type: String, enum: ["Tugas", "Kuis", "Ujian", "Penilaian"], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    feedback: { type: String, default: "" },
    submissionId: { type: String, sparse: true, unique: true },
    gradedBy: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Grade || mongoose.model<IGrade>("Grade", gradeSchema);
