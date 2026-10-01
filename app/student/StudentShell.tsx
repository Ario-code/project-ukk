"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
  Bell,
  BookOpenText,
  ClipboardCheck,
  FileUp,
  LayoutGrid,
  LogOut,
  Trophy,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

type StudentShellProps = {
  active: "dashboard" | "materi" | "assessment" | "upload" | "grades" | "profile";
  children: ReactNode;
};

type NavItem = { key: StudentShellProps["active"]; icon: LucideIcon; label: string; href: string };

const navigation: NavItem[] = [
  { key: "dashboard", icon: LayoutGrid, label: "Dashboard", href: "/student" },
  { key: "materi", icon: BookOpenText, label: "Materi", href: "/student/materi" },
  { key: "assessment", icon: ClipboardCheck, label: "Assessment", href: "/student/assessment" },
  { key: "upload", icon: FileUp, label: "Upload Project & Tugas", href: "/student/upload" },
  { key: "grades", icon: Trophy, label: "Grades", href: "/student/grades" },
  { key: "profile", icon: UserCircle2, label: "Profile", href: "/student/profile" },
];

export default function StudentShell({ active, children }: StudentShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.success && setUser(d.user))
      .catch(() => {});
  }, []);

  const initials = (user?.name ?? "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

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
            {navigation.map(({ key, icon: Icon, label, href }) => (
              <Link
                key={key}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-3 transition ${
                  active === key
                    ? "bg-[#2a2f60] text-white shadow-inner"
                    : "text-[#d0d7ef] hover:bg-[#1a234f]"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-auto flex items-center gap-2 px-[18px] pb-8 text-left text-[12px] font-semibold text-[#f7b4b4] hover:text-red-300"
          >
            <LogOut size={16} /> LogOut
          </button>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[72px] items-center justify-end gap-4 border-b border-[#dfe3ea] bg-white/70 px-6 backdrop-blur-sm">
            <button type="button" aria-label="Notifications" className="text-[#3c4658]"><Bell size={20} /></button>
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <p className="text-[13px] font-semibold text-[#1f2430]">{user?.name ?? "..."}</p>
                <p className="text-[10px] uppercase text-[#7c8290]">{user?.role ?? ""}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dfeaf6] text-[11px] font-bold text-[#44576f]">{initials}</div>
            </div>
          </header>

          <div className="px-7 py-8 lg:px-[32px]">{children}</div>
        </div>
      </div>
    </main>
  );
}