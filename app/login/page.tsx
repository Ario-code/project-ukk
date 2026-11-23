"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";

const roles = ["admin", "guru", "murid", "kepsek", "wakakurikulum"] as const;
type Role = (typeof roles)[number];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role>("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = (role: Role) => {
    if (role === "kepsek") return "Kepsek";
    if (role === "wakakurikulum") return "Kurikulum";
    return role[0].toUpperCase() + role.slice(1);
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Login gagal");
        return;
      }

      if (data.user.role !== selectedRole) {
        setError(`Akun ini bukan akun ${roleLabel(selectedRole).toLowerCase()}.`);
        return;
      }

      const destination = data.user.role === "admin" ? "/admin" : data.user.role === "guru" ? "/guru" : data.user.role === "kepsek" ? "/kepsek" : data.user.role === "wakakurikulum" ? "/kurikulum" : "/student";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#eff6ff_0%,_#e0e7ff_28%,_#f8fafc_58%,_#ecfeff_100%)] px-4 py-10">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.15)] lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-sky-700 via-blue-800 to-indigo-900 p-8 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_40%)]" />
          <div className="relative z-10">
            <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-sm">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src="https://spmbcitranegara.id/uploads/logo/img_6513a6f0d01074-64787516-20579791.jpg"
                alt="Logo SMK Citra Negara"
              />
              <span className="text-sm font-semibold tracking-[0.2em] uppercase">Kelasin</span>
            </div>

            <div className="max-w-xs">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-sky-100">Learning Management System</p>
              <h2 className="mt-5 text-4xl font-bold leading-tight">Belajar lebih terarah.</h2>
              <p className="mt-4 text-base text-sky-100/90">
                Kelola kelas, materi, tugas, dan penilaian dalam satu platform yang lebih terstruktur.
              </p>
            </div>
          </div>

          <div className="relative z-10 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-sky-100">Platform</p>
            <p className="mt-2 text-lg font-semibold">Akademik Digital Sekolah</p>
          </div>
        </aside>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-600"></p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Masuk ke akun</h1>
              <p className="mt-2 text-sm text-slate-500">Akses dashboard sesuai peran Anda.</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-700">
                Email atau username
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={18} />
                  </span>
                  <input
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Masukkan email Anda"
                    required
                  />
                </div>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Password
                <div className="relative mt-2">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={18} />
                  </span>
                  <input
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-100"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukkan password"
                    required
                  />
                </div>
              </label>

              <div className="pt-1">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pilih role</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {roles.map((role) => (
                    <button
                      className={`h-10 rounded-xl border text-xs font-semibold transition ${
                        selectedRole === role
                          ? "border-sky-600 bg-sky-600 text-white shadow-lg shadow-sky-200"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:border-sky-200 hover:bg-sky-50"
                      }`}
                      type="button"
                      key={role}
                      onClick={() => setSelectedRole(role)}
                    >
                      {role === "wakakurikulum" ? "Kurikulum" : role === "kepsek" ? "Kepsek" : role[0].toUpperCase() + role.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <button
                className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(14,116,144,0.28)] transition hover:from-sky-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
                type="submit"
                disabled={loading}
              >
                {loading ? "Memproses..." : "Log In"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}