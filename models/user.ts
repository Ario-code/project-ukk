import mongoose, { Schema, Document} from "mongoose";

export interface IUser extends Document {
    nama: string;
    email: string;
    password: string;
    role: "admin" | "guru" | "murid" | "kepsek" | "wakakurikulum";
}

const userSchema = new Schema<IUser>(
    {
        nama: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true },
        role: { type: String, enum: ["admin", "guru", "murid", "kepsek", "wakakurikulum"], default: "murid" },
    },
    {
        timestamps: true,
    }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;