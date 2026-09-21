"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        const roleLabel = selectedRole === "wakakurikulum" ? "Kurikulum" : selectedRole[0].toUpperCase() + selectedRole.slice(1);
        setError(`Akun ini bukan akun ${roleLabel.toLowerCase()}.`);
        return;
      }

      const destination = data.user.role === "admin" ? "/admin" : "/student";
      router.push(destination);
      router.refresh();
    } catch {
      setError("Server tidak dapat dihubungi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-4 py-8">
      <section className="w-full max-w-[336px] rounded-md border border-[#e3e5e8] bg-white px-3 py-7 shadow-[0_2px_8px_rgba(15,23,42,0.06)] sm:px-[13px]">
        <div className="mb-12 text-center">
          <img
            className="mx-auto mb-5 h-12 w-12 object-contain"
            src="https://spmbcitranegara.id/uploads/logo/img_6513a6f0d01074-64787516-20579791.jpg"
            alt="Logo SMK Citra Negara"
          />
          <h1 className="text-[40px] font-bold leading-none tracking-[-2px] text-black">K<span className="font-normal">elasin</span></h1>
          <p className="mt-8 text-[12px] text-[#555b64]">Log In to your account</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-[10px] font-semibold text-[#333943]">
            Username or Email
            <span className="relative mt-1 block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b8bec7]">♙</span>
              <input className="h-7 w-full rounded-[2px] border border-[#cbd0d7] bg-[#fafbfc] pl-8 pr-3 text-[11px] text-slate-900 outline-none transition placeholder:text-[#c5cad2] focus:border-blue-500 focus:ring-1 focus:ring-blue-200" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your username" required />
            </span>
          </label>
          <label className="block text-[10px] font-semibold text-[#333943]">
            Password
            <span className="relative mt-1 block">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#b8bec7]">▣</span>
              <input className="h-7 w-full rounded-[2px] border border-[#cbd0d7] bg-[#fafbfc] pl-8 pr-3 text-[11px] text-slate-900 outline-none transition placeholder:text-[#c5cad2] focus:border-blue-500 focus:ring-1 focus:ring-blue-200" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required />
            </span>
          </label>

          <div className="flex gap-2 pt-1">
            {["admin", "guru", "murid", "kepsek", "wakakurikulum"].map((role) => (
              <button className={`h-8 flex-1 rounded-[2px] px-1 text-[10px] font-semibold text-white transition ${selectedRole === role ? "bg-[#06499a] ring-2 ring-[#06499a]/20" : "bg-[#06499a] opacity-90 hover:opacity-100"}`} type="button" key={role} onClick={() => setSelectedRole(role)}>
                {role === "wakakurikulum" ? "Kurikulum" : role[0].toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>

          {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button className="mt-1 h-8 w-full rounded-[2px] bg-[#06499a] text-[11px] font-semibold text-white transition hover:bg-[#053d82] disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={loading}>{loading ? "Logging in..." : "Log In  →"}</button>
        </form>
      </section>
    </main>
  );
}