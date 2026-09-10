import mongoose, { Document, Schema } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  subject: string;
  classes: string;
  status: "Active" | "Leave";
  classIds?: mongoose.Types.ObjectId[];
}

const teacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    classes: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Active", "Leave"], default: "Active" },
    classIds: [{ type: Schema.Types.ObjectId, ref: "SchoolClass" }],
  },
  { timestamps: true }
);

const Teacher = mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", teacherSchema);

export default Teacher;