import mongoose, { Document, Schema } from "mongoose";

export interface ILessonSchedule extends Document {
  className: string;
  subject: string;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  day: string;
  startTime: string;
  endTime: string;
  academicPeriodId: mongoose.Types.ObjectId;
}

const lessonScheduleSchema = new Schema<ILessonSchedule>(
  {
    className: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
    teacherName: { type: String, required: true, trim: true },
    day: { type: String, required: true, enum: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"] },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    academicPeriodId: { type: Schema.Types.ObjectId, ref: "AcademicPeriod", required: true },
  },
  { timestamps: true }
);

lessonScheduleSchema.index({ day: 1, startTime: 1, endTime: 1 });

export default mongoose.models.LessonSchedule ||
  mongoose.model<ILessonSchedule>("LessonSchedule", lessonScheduleSchema);
