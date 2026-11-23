import mongoose, { Document, Schema } from "mongoose";

export interface IAcademicPeriod extends Document {
  academicYear: string;
  semester: "Ganjil" | "Genap";
  active: boolean;
}

const academicPeriodSchema = new Schema<IAcademicPeriod>(
  {
    academicYear: { type: String, required: true, trim: true },
    semester: { type: String, enum: ["Ganjil", "Genap"], required: true },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.AcademicPeriod ||
  mongoose.model<IAcademicPeriod>("AcademicPeriod", academicPeriodSchema);
