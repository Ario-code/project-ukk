import mongoose, { Document, Schema } from "mongoose";

export interface IMaterial extends Document {
  title: string;
  subject: string;
  kelas: string;
  fileType: string;
  fileUrl: string;
  sizeLabel: string;
  description?: string;
  uploadedBy?: string;
}

const materialSchema = new Schema<IMaterial>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    kelas: { type: String, default: "General", trim: true },
    fileType: { type: String, default: "PDF", trim: true },
    fileUrl: { type: String, required: true, trim: true },
    sizeLabel: { type: String, default: "-", trim: true },
    description: { type: String, default: "" },
    uploadedBy: { type: String },
  },
  { timestamps: true }
);

const Material = mongoose.models.Material || mongoose.model<IMaterial>("Material", materialSchema);
export default Material;