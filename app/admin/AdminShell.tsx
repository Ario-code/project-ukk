"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { BookOpen, GraduationCap, LayoutDashboard, LogOut, School, Users, type LucideIcon } from "lucide-react";

type AdminShellProps = {
  active: "dashboard" | "teachers" | "students" | "classes" | "users";
  children: ReactNode;
};

type NavItem = { key: AdminShellProps["active"]; icon: LucideIcon; label: string; href: string };

const navigation: NavItem[] = [
  { key: "dashboard", icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { key: "users", icon: Users, label: "Akun Pengguna", href: "/admin/users" },
  { key: "teachers", icon: BookOpen, label: "Data Guru", href: "/admin/teachers" },
  { key: "students", icon: GraduationCap, label: "Data Murid", href: "/admin/students" },
  { key: "classes", icon: School, label: "Data Kelas", href: "/admin/classes" },
];

export default function AdminShell({ active, children }: AdminShellProps) {
  const router = useRouter();
  const activeItem = navigation.find((item) => item.key === active);

  function handleLogout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#ebedf1] text-[#353536]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-[#d4d8df] bg-white text-[#353536] lg:min-h-screen lg:w-[250px] lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-4 lg:px-6 lg:py-7">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ebedf1] text-[#353536]"><School size={21} strokeWidth={2.2} /></span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight">Kelasin</p>
              <p className="mt-1 text-[11px] text-[#706f70]">administrasi</p>
            </div>
          </div>
          <nav aria-label="Navigasi admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
            {navigation.map(({ key, icon: Icon, label, href }) => (
              <Link
                aria-current={active === key ? "page" : undefined}
                className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active === key ? "bg-[#ebedf1] text-[#353536]" : "text-[#706f70] hover:bg-[#ebedf1] hover:text-[#353536]"
                }`}
                href={href}
                key={key}
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto hidden px-6 pb-6 pt-10 text-[11px] text-[#acadb1] lg:block">Portal Manajemen Sekolah</div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-16 items-center justify-between border-b border-[#d4d8df] bg-white px-4 sm:px-7">
            <div>
              <p className="text-[11px] font-medium text-[#706f70]">Administrasi Sekolah <span className="px-1 text-[#acadb1]">/</span> Admin</p>
              <p className="mt-1 text-sm font-semibold text-[#353536]">{activeItem?.label}</p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="hidden text-right leading-tight sm:block">
                <p className="text-xs font-semibold">Admin User</p>
                <p className="mt-1 text-[10px] text-[#706f70]">Administrator</p>
              </div>
              <div aria-label="Admin User" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebedf1] text-xs font-bold text-[#353536]">AU</div>
              <span className="h-7 border-l border-[#e0e6e1]" />
              <button className="flex h-9 w-9 items-center justify-center rounded-lg text-[#706f70] transition hover:bg-[#ebedf1] hover:text-[#080808]" onClick={handleLogout} title="Keluar" aria-label="Keluar">
                <LogOut size={17} />
              </button>
            </div>
          </header>
          <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">{children}</div>
        </div>
      </div>
    </main>
  );
}