"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import {
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
    <main className="min-h-screen bg-[#ebedf1] text-[#353536]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="group flex w-full shrink-0 flex-col border-b border-[#d4d8df] bg-white transition-[width] duration-200 lg:sticky lg:top-0 lg:min-h-screen lg:w-[72px] lg:border-b-0 lg:border-r lg:hover:w-[250px]">
          <div className="flex items-center justify-center gap-3 overflow-hidden px-5 py-4 lg:px-4 lg:py-7 lg:group-hover:justify-start">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ebedf1] text-[#353536]"><UserCircle2 size={21} /></span>
            <div className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-[180px] lg:group-hover:opacity-100"><p className="truncate text-sm font-bold tracking-tight">Kelasin</p><p className="mt-1 text-[11px] text-[#706f70]">portal murid</p></div>
          </div>

          <nav aria-label="Navigasi murid" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:w-full lg:flex-col lg:overflow-visible">
            {navigation.map(({ key, icon: Icon, label, href }) => (
              <Link
                aria-current={active === key ? "page" : undefined}
                key={key}
                href={href}
                title={label}
                className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition lg:min-w-0 lg:w-full lg:justify-center lg:group-hover:justify-start ${
                  active === key
                    ? "bg-[#ebedf1] text-[#353536]"
                    : "text-[#706f70] hover:bg-[#ebedf1] hover:text-[#353536]"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                <span className="overflow-hidden whitespace-nowrap opacity-100 transition-opacity lg:max-w-0 lg:opacity-0 lg:group-hover:max-w-[180px] lg:group-hover:opacity-100">{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto hidden overflow-hidden whitespace-nowrap px-6 pb-6 pt-10 text-[11px] text-[#acadb1] opacity-0 transition-opacity lg:block lg:group-hover:opacity-100">Portal Manajemen Sekolah</div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-16 items-center justify-between border-b border-[#d4d8df] bg-white px-4 sm:px-7">
            <div><p className="text-[11px] font-medium text-[#706f70]">Akademik Sekolah / Murid</p><p className="mt-1 text-sm font-semibold text-[#353536]">{navigation.find((item) => item.key === active)?.label}</p></div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right leading-tight sm:block"><p className="text-xs font-semibold">{user?.name ?? "..."}</p><p className="mt-1 text-[10px] text-[#706f70]">Murid</p></div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebedf1] text-xs font-bold text-[#353536]">{initials}</div>
              <span className="h-7 border-l border-[#d4d8df]" />
              <button type="button" onClick={handleLogout} aria-label="Keluar" title="Keluar" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#706f70] hover:bg-[#ebedf1] hover:text-[#080808]"><LogOut size={17} /></button>
            </div>
          </header>

          <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">{children}</div>
        </div>
      </div>
    </main>
  );
}