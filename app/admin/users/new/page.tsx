"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminShell from "../../AdminShell";

const roles = ["admin", "guru", "murid", "kepsek", "wakakurikulum"] as const;
const majors = ["PPLG", "DKV", "BDR", "MPLB", "PH", "TJKT"];
const subjects = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Pendidikan Pancasila", "Informatika", "IPA", "IPS", "Produktif", "Seni Budaya", "PJOK"];

type Role = (typeof roles)[number];
type SchoolClassOption = { _id: string; name: string; major: string };

function normalizeName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

function generateLoginEmail(fullName: string) {
  const cleaned = normalizeName(fullName);
  if (!cleaned) return "";
  const parts = cleaned.split(" ").filter(Boolean);
  const slug = parts.join(".");
  return `${slug}@kelasin.id`;
}

function generateDefaultPassword(fullName: string) {
  const cleaned = normalizeName(fullName).replace(/\s+/g, "");
  return cleaned ? `${cleaned}123` : "kelasin123";
}

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  guru: "Guru",
  murid: "Murid",
  kepsek: "Kepsek",
  wakakurikulum: "Wakil Kurikulum",
};

export default function NewUserPage() {
  const router = useRouter();
  const [editId, setEditId] = useState<string | null>(null);
  const isEditMode = Boolean(editId);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("guru");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [teacherMajor, setTeacherMajor] = useState("");
  const [studentNis, setStudentNis] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [studentMajor, setStudentMajor] = useState("");
  const [schoolClasses, setSchoolClasses] = useState<SchoolClassOption[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const id = params.get("id");
      setEditId(id);

      if (!id) {
        const requestedName = params.get("name") ?? "";
        setName(requestedName);
        const requestedRole = params.get("role");
        if (roles.includes(requestedRole as Role)) {
          setRole(requestedRole as Role);
          if (requestedRole === "guru" || requestedRole === "murid") {
            const profileUrl = requestedRole === "guru" ? "/api/teachers" : "/api/students";
            void fetch(profileUrl)
              .then(async (response) => {
                const data = await response.json();
                if (!response.ok) return;
                const records = requestedRole === "guru" ? data.teachers ?? [] : data.students ?? [];
                const existing = records.find((record: { name: string }) => normalizeName(record.name) === normalizeName(requestedName));

                if (requestedRole === "guru") {
                  setTeacherSubject(params.get("subject") ?? existing?.subject ?? "");
                  setTeacherMajor(params.get("major") ?? existing?.major ?? "");
                } else {
                  setStudentNis(params.get("nis") ?? existing?.nis ?? "");
                  setStudentClass(params.get("className") ?? existing?.className ?? "");
                  setStudentMajor(params.get("major") ?? existing?.major ?? "");
                }
              })
              .catch(() => undefined);
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/classes")
      .then(async (response) => {
        const data = await response.json();
        if (response.ok) setSchoolClasses(data.classes ?? []);
      })
      .catch(() => undefined);
  }, []);

  const studentClassOptions = schoolClasses.filter((schoolClass) => schoolClass.major === studentMajor);

  useEffect(() => {
    if (!editId) return;

    async function loadUser() {
      try {
        const response = await fetch(`/api/users/${editId}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.message ?? "Gagal mengambil data akun");
          return;
        }

        const nextName = data.user.nama ?? "";
        const nextRole = (data.user.role ?? "guru") as Role;
        setName(nextName);
        setRole(nextRole);
        setEmail(nextName ? generateLoginEmail(nextName) : "");
        setPassword(nextName ? generateDefaultPassword(nextName) : "");
      } catch {
        setError("Server tidak dapat dihubungi");
      }
    }

    loadUser();
  }, [editId]);

  useEffect(() => {
    if (!name.trim()) {
      setEmail("");
      setPassword("");
      return;
    }

    if (!isEditMode) {
      setEmail(generateLoginEmail(name));
      setPassword(generateDefaultPassword(name));
    }
  }, [name, isEditMode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const payload = {
      name,
      email: generateLoginEmail(name),
      password: generateDefaultPassword(name),
      role,
      ...(role === "guru" ? { teacherProfile: { subject: teacherSubject, major: teacherMajor } } : {}),
      ...(role === "murid" ? { studentProfile: { nis: studentNis, className: studentClass, major: studentMajor } } : {}),
    };

    try {
      const response = await fetch(isEditMode ? `/api/users/${editId}` : "/api/users", {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Gagal menyimpan akun");
        return;
      }

      setShowNotification(true);
      setTimeout(() => router.push("/admin/users"), 1500);
    } catch {
      setError("Server tidak dapat dihubungi");
    }
  }

  return (
    <AdminShell active="users">
      {showNotification && (
        <div className="fixed right-6 top-5 z-50 flex w-[296px] items-start gap-3 rounded-xl border border-[#b8f0c7] bg-white px-4 py-4 shadow-[0_5px_16px_rgba(24,120,54,0.22)]" role="status">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#baffc7] text-sm font-bold text-[#0dce35]">✓</span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-[14px] font-bold text-[#06a928]">Berhasil Nihh!</p>
            <p className="mt-1 text-[12px] text-[#4d5157]">{isEditMode ? "Akun berhasil diperbarui" : "Akun baru berhasil dibuat"}</p>
          </div>
          <button className="text-xl leading-none text-[#4b4b4b] hover:text-black" type="button" aria-label="Tutup notifikasi" onClick={() => setShowNotification(false)}>×</button>
        </div>
      )}

      <div className="mx-auto max-w-2xl overflow-hidden rounded-lg border border-[#d4d8df] bg-white shadow-sm">
        <h1 className="border-b border-[#d4d8df] px-6 py-5 text-lg font-bold text-[#353536]">{isEditMode ? "Edit Akun" : "Buat Akun Baru"}</h1>

        <form className="space-y-5 p-6 sm:p-8" onSubmit={handleSubmit}>
          <label className="block text-xs font-semibold text-[#706f70]">
            Nama Lengkap
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Ahmad Fauzi"
              required
            />
          </label>

          <label className="block text-xs font-semibold text-[#706f70]">
            Email login otomatis
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#706f70] outline-none"
              type="email"
              value={email}
              readOnly
              placeholder="contoh@email.com"
            />
          </label>

          <label className="block text-xs font-semibold text-[#706f70]">
            Password default
            <input
              className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#706f70] outline-none"
              type="text"
              value={password}
              readOnly
              placeholder="Minimal 6 karakter"
            />
          </label>

          <p className="-mt-1 text-[10px] text-slate-500">
            Sistem otomatis membuat email dan password dari nama lengkap. Password default bersifat konsisten dan mudah diingat, misalnya: <span className="font-semibold text-slate-700">ahmadfauzi123</span>.
          </p>

          <label className="block text-xs font-semibold text-[#706f70]">
            Role Akun
            <select
              className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 text-sm text-[#353536] outline-none transition focus:border-[#353536] focus:ring-4 focus:ring-[#d4d8df]"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              {roles.map((item) => (
                <option key={item} value={item}>
                  {roleLabels[item]}
                </option>
              ))}
            </select>
          </label>

          {role === "guru" && (
            <section className="space-y-5 rounded-lg border border-[#d4d8df] bg-[#ebedf1] p-4 sm:p-5">
              <div><h2 className="text-sm font-bold text-[#353536]">Data guru</h2><p className="mt-1 text-xs text-[#706f70]">Akun ini juga akan dibuat atau ditautkan ke data guru.</p></div>
              <label className="block text-xs font-semibold text-[#706f70]">Mata pelajaran
                <select className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-white px-3 text-sm text-[#353536] outline-none focus:border-[#706f70]" value={teacherSubject} onChange={(event) => setTeacherSubject(event.target.value)} required={!isEditMode}>
                  <option value="">Pilih mata pelajaran</option>
                  {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </label>
              <label className="block text-xs font-semibold text-[#706f70]">Jurusan
                <select className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-white px-3 text-sm text-[#353536] outline-none focus:border-[#706f70]" value={teacherMajor} onChange={(event) => setTeacherMajor(event.target.value)} required={!isEditMode}>
                  <option value="">Pilih jurusan</option>
                  {majors.map((major) => <option key={major} value={major}>{major}</option>)}
                </select>
              </label>
              <p className="text-xs text-[#706f70]">Kelas wali/pengajaran bisa dihubungkan dari menu Data Kelas.</p>
            </section>
          )}

          {role === "murid" && (
            <section className="space-y-5 rounded-lg border border-[#d4d8df] bg-[#ebedf1] p-4 sm:p-5">
              <div><h2 className="text-sm font-bold text-[#353536]">Data murid</h2><p className="mt-1 text-xs text-[#706f70]">Akun ini juga akan dibuat atau ditautkan ke data murid.</p></div>
              <label className="block text-xs font-semibold text-[#706f70]">NIS
                <input className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-white px-3 text-sm text-[#353536] outline-none focus:border-[#706f70]" value={studentNis} onChange={(event) => setStudentNis(event.target.value)} required={!isEditMode} />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#706f70]">Kelas
                  <select className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-white px-3 text-sm text-[#353536] outline-none focus:border-[#706f70]" value={studentClass} onChange={(event) => setStudentClass(event.target.value)} required={!isEditMode}>
                    <option value="">{!studentMajor ? "Pilih jurusan dahulu" : studentClassOptions.length ? "Pilih kelas" : "Belum ada kelas untuk jurusan ini"}</option>
                    {studentClassOptions.map((schoolClass) => <option key={schoolClass._id} value={schoolClass.name}>{schoolClass.name}</option>)}
                  </select>
                  {studentMajor && studentClassOptions.length === 0 && <span className="mt-2 block text-xs text-[#706f70]">Buat kelas untuk jurusan ini terlebih dahulu di <Link className="font-semibold text-[#168446] hover:underline" href="/admin/classes/new">Data Kelas</Link>.</span>}
                </label>
                <label className="block text-xs font-semibold text-[#706f70]">Jurusan
                  <select className="mt-2 h-11 w-full rounded-lg border border-[#d4d8df] bg-white px-3 text-sm text-[#353536] outline-none focus:border-[#706f70]" value={studentMajor} onChange={(event) => setStudentMajor(event.target.value)} required={!isEditMode}>
                    <option value="">Pilih jurusan</option>
                    {majors.map((major) => <option key={major} value={major}>{major}</option>)}
                  </select>
                </label>
              </div>
            </section>
          )}

          {error && <p className="rounded bg-red-50 px-3 py-2 text-[11px] text-red-700">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-[#d4d8df] pt-5">
            <Link className="rounded-lg border border-[#d4d8df] px-5 py-2.5 text-sm font-semibold text-[#706f70] transition hover:bg-[#ebedf1]" href="/admin/users">
              Batal
            </Link>
            <button className="rounded-lg bg-[#168446] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106d38]" type="submit">
              {isEditMode ? "Simpan Perubahan" : "Simpan Akun"}
            </button>
          </div>
        </form>
      </div>
    </AdminShell>
  );
}
