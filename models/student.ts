import mongoose, { Document, Schema } from "mongoose";

export interface IStudent extends Document {
  nis: string;
  name: string;
  className: string;
  major: string;
  status: "Active" | "Inactive";
  classId?: mongoose.Types.ObjectId;
}

const studentSchema = new Schema<IStudent>(
  {
    nis: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    major: { type: String, default: "-", trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    classId: { type: Schema.Types.ObjectId, ref: "SchoolClass" },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model<IStudent>("Student", studentSchema);

export default Student;