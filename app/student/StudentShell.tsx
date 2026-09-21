"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type StudentShellProps = {
  active: "dashboard" | "materi" | "assessment" | "upload" | "grades" | "profile";
  children: ReactNode;
};

const navigation = [
  ["dashboard", "▣", "Dashboard", "/student"],
  ["materi", "▤", "Materi", "/student/materi"],
  ["assessment", "▩", "Assessment", "/student/assessment"],
  ["upload", "⤴", "Upload Project & Tugas", "/student/upload"],
  ["grades", "★", "Grades", "/student/grades"],
  ["profile", "◌", "Profile", "/student/profile"],
] as const;

export default function StudentShell({ active, children }: StudentShellProps) {
  const router = useRouter();

  function handleLogout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#f3f4f7] text-[#1e2430]">
      <div className="flex min-h-screen">
        <aside className="flex w-[230px] shrink-0 flex-col bg-[#101a4a] text-white">
          <div className="px-[18px] pb-7 pt-7">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-[#f3f5d9] text-[13px] font-bold text-[#1f2d4d]">SM</div>
              <div>
                <p className="text-[17px] font-bold tracking-tight">SMK Link</p>
                <p className="text-[10px] text-[#b6bdd7]">Vocational Management</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1 px-2 pb-4 text-[13px] font-medium">
            {navigation.map(([key, icon, label, href]) => (
              <Link
                key={key}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-3 transition ${
                  active === key
                    ? "bg-[#2a2f60] text-white shadow-inner"
                    : "text-[#d0d7ef] hover:bg-[#1a234f]"
                }`}
              >
                <span className="w-4 text-center text-base">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-auto px-[18px] pb-8 text-left text-[12px] font-semibold text-[#f7b4b4] hover:text-red-300"
          >
            ↪ &nbsp; LogOut
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-end gap-4 border-b border-[#dfe3ea] bg-white/70 px-6 backdrop-blur-sm">
            <button type="button" aria-label="Notifications" className="text-xl text-[#3c4658]">◌</button>
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-[13px] font-semibold text-[#1f2430]">Alex Student</p>
                <p className="text-[10px] text-[#7c8290]">12 - PPLG</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfeaf6] text-[11px] font-bold text-[#44576f]">AS</div>
            </div>
          </header>

          <div className="px-7 py-8 lg:px-[32px]">{children}</div>
        </div>
      </div>
    </main>
  );
}
