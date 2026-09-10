import mongoose, { Document, Schema } from "mongoose";

export interface ISchoolClass extends Document {
  name: string;
  grade: "X" | "XI" | "XII";
  major: string;
  homeroomTeacher: string;
  studentCount: number;
  room: string;
  homeroomTeacherId?: mongoose.Types.ObjectId;
}

const schoolClassSchema = new Schema<ISchoolClass>(
  {
    name: { type: String, required: true, trim: true },
    grade: { type: String, enum: ["X", "XI", "XII"], required: true },
    major: { type: String, required: true, trim: true },
    homeroomTeacher: { type: String, required: true, trim: true },
    studentCount: { type: Number, required: true, min: 1 },
    room: { type: String, default: "-", trim: true },
    homeroomTeacherId: { type: Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
);

const SchoolClass = mongoose.models.SchoolClass || mongoose.model<ISchoolClass>("SchoolClass", schoolClassSchema);

export default SchoolClass;