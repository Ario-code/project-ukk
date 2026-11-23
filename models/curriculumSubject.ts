import mongoose, { Document, Schema } from "mongoose";

export interface ICurriculumSubject extends Document {
  name: string;
  code: string;
  weeklyHours: number;
  classes: string[];
}

const curriculumSubjectSchema = new Schema<ICurriculumSubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true, unique: true },
    weeklyHours: { type: Number, required: true, min: 1 },
    classes: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

export default mongoose.models.CurriculumSubject ||
  mongoose.model<ICurriculumSubject>("CurriculumSubject", curriculumSubjectSchema);
