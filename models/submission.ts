import mongoose, { Document, Schema } from "mongoose";

export interface ISubmission extends Document {
  userId: string;
  title: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  sizeLabel: string;
}

const submissionSchema = new Schema<ISubmission>(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, default: "FILE" },
    sizeLabel: { type: String, default: "-" },
  },
  { timestamps: true }
);

const Submission = mongoose.models.Submission || mongoose.model<ISubmission>("Submission", submissionSchema);
export default Submission;