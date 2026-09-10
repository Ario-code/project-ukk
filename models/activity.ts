import mongoose, { Document, Schema } from "mongoose";

export interface IActivity extends Document {
  icon: string;
  activity: string;
  user: string;
  status: "Completed" | "Pending";
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    icon: { type: String, required: true },
    activity: { type: String, required: true },
    user: { type: String, default: "Admin User" },
    status: { type: String, enum: ["Completed", "Pending"], default: "Completed" },
  },
  { timestamps: true }
);

const Activity = mongoose.models.Activity || mongoose.model<IActivity>("Activity", activitySchema);

export default Activity;