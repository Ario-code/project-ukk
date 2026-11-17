import mongoose, { Document, Schema } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  subject: string;
  major: string;
  classes: string;
  status: "Active" | "Leave";
  classIds?: mongoose.Types.ObjectId[];
  userId?: mongoose.Types.ObjectId;
}

const teacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    major: { type: String, required: true, trim: true },
    classes: { type: String, required: true, default: "-", trim: true },
    status: { type: String, enum: ["Active", "Leave"], default: "Active" },
    classIds: [{ type: Schema.Types.ObjectId, ref: "SchoolClass" }],
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", teacherSchema);

export default Teacher;