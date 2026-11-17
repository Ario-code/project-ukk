import { Types } from "mongoose";
import Student from "@/models/student";
import Teacher from "@/models/teacher";
import User from "@/models/user";

export class AccountProfileConflictError extends Error {}

export type AccountRole = "admin" | "guru" | "murid" | "kepsek" | "wakakurikulum";
export const schoolMajors = ["PPLG", "DKV", "BDR", "MPLB", "PH", "TJKT"] as const;

export function normalizePersonName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function findAccountByName<T extends { nama: string }>(accounts: T[], name: string) {
  const normalizedName = normalizePersonName(name);
  if (!normalizedName) return undefined;
  return accounts.find((account) => normalizePersonName(account.nama) === normalizedName);
}

export function findRecordByName<T extends { name: string }>(records: T[], name: string) {
  const normalizedName = normalizePersonName(name);
  if (!normalizedName) return undefined;
  return records.find((record) => normalizePersonName(record.name) === normalizedName);
}

export function resolveTeacherMajor(major?: string, classes?: string) {
  const normalizedMajor = normalizePersonName(major ?? "").toUpperCase();
  const directMajor = schoolMajors.find((item) => item === normalizedMajor);
  if (directMajor) return directMajor;

  const normalizedClasses = normalizePersonName(classes ?? "").toUpperCase();
  return schoolMajors.find((item) => normalizedClasses.includes(item)) ?? "";
}

export function teacherMatchesMajor(teacher: { major?: string; classes?: string }, major: string) {
  return resolveTeacherMajor(teacher.major, teacher.classes) === major;
}

export async function findMatchingAccount(name: string, role: "guru" | "murid") {
  const accounts = await User.find({ role }).select("_id nama email role").lean();
  return findAccountByName(accounts, name);
}

export async function createOrLinkTeacherProfile(userId: string | Types.ObjectId, name: string, subject: string, major: string) {
  const teachers = await Teacher.find().select("_id name userId").lean();
  const existingTeacher = findRecordByName(teachers, name);

  if (existingTeacher?.userId && String(existingTeacher.userId) !== String(userId)) {
    throw new AccountProfileConflictError("Data guru dengan nama ini sudah terhubung ke akun lain");
  }

  if (existingTeacher) {
    return Teacher.findByIdAndUpdate(
      existingTeacher._id,
      { name, subject, major, userId },
      { new: true, runValidators: true }
    );
  }

  return Teacher.create({ name, subject, major, classes: "-", userId });
}

export async function createOrLinkStudentProfile(
  userId: string | Types.ObjectId,
  name: string,
  nis: string,
  className: string,
  major: string
) {
  const [students, studentWithNis] = await Promise.all([
    Student.find().select("_id name userId nis").lean(),
    Student.findOne({ nis }).select("_id name userId").lean(),
  ]);
  const existingStudent = findRecordByName(students, name);

  if (studentWithNis && (!existingStudent || String(studentWithNis._id) !== String(existingStudent._id))) {
    throw new AccountProfileConflictError("NIS ini sudah digunakan murid lain");
  }
  if (existingStudent?.userId && String(existingStudent.userId) !== String(userId)) {
    throw new AccountProfileConflictError("Data murid dengan nama ini sudah terhubung ke akun lain");
  }

  if (existingStudent) {
    return Student.findByIdAndUpdate(
      existingStudent._id,
      { name, nis, className, major, userId },
      { new: true, runValidators: true }
    );
  }

  return Student.create({ name, nis, className, major, userId });
}

export async function syncSchoolDataAccountLink(accountId: string | Types.ObjectId, name: string, role: AccountRole) {
  await Promise.all([
    Teacher.updateMany({ userId: accountId }, { $unset: { userId: 1 } }),
    Student.updateMany({ userId: accountId }, { $unset: { userId: 1 } }),
  ]);

  const normalizedName = normalizePersonName(name);
  if (!normalizedName) return;

  if (role === "guru") {
    const teachers = await Teacher.find().select("_id name userId").lean();
    const teacher = teachers.find((item) => normalizePersonName(item.name) === normalizedName && (!item.userId || String(item.userId) === String(accountId)));
    if (teacher) await Teacher.updateOne({ _id: teacher._id }, { $set: { userId: accountId } });
  }

  if (role === "murid") {
    const students = await Student.find().select("_id name userId").lean();
    const student = students.find((item) => normalizePersonName(item.name) === normalizedName && (!item.userId || String(item.userId) === String(accountId)));
    if (student) await Student.updateOne({ _id: student._id }, { $set: { userId: accountId } });
  }
}