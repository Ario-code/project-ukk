"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { LayoutGrid, GraduationCap, ClipboardList, CalendarCheck, BarChart3, LogOut, School, type LucideIcon } from "lucide-react";

type GuruShellProps = { children: ReactNode };

type NavItem = { key: string; icon: LucideIcon; label: string; href: string };

const navigation: NavItem[] = [
  { key: "dashboard", icon: LayoutGrid, label: "Dashboard", href: "/guru" },
  { key: "murid", icon: GraduationCap, label: "Lihat Murid & Kelas", href: "/guru/murid" },
  { key: "assesmen", icon: ClipboardList, label: "Assesmen", href: "/guru/assesmen" },
  { key: "kehadiran", icon: CalendarCheck, label: "Kehadiran", href: "/guru/kehadiran" },
  { key: "nilai", icon: BarChart3, label: "Penilaian & Rekap", href: "/guru/nilai" },
];

export default function GuruShell({ children }: GuruShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string } | null>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => d.success && setUser(d.user))
      .catch(() => {});
  }, []);

  const initials = (user?.name ?? "G").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  function handleLogout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#ebedf1] text-[#353536]">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="flex w-full shrink-0 flex-col border-b border-[#d4d8df] bg-white lg:min-h-screen lg:w-[250px] lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3 px-5 py-4 lg:px-6 lg:py-7">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#ebedf1] text-[#353536]"><School size={21} /></span>
            <div><p className="truncate text-sm font-bold">Kelasin</p><p className="mt-1 text-[11px] text-[#706f70]">portal guru</p></div>
          </div>
          <nav aria-label="Navigasi guru" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-3">
            {navigation.map(({ key, icon: Icon, label, href }) => (
              <Link
                key={key}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                className={`flex min-w-max items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  pathname === href ? "bg-[#ebedf1] text-[#353536]" : "text-[#706f70] hover:bg-[#ebedf1] hover:text-[#353536]"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto hidden px-6 pb-6 pt-10 text-[11px] text-[#acadb1] lg:block">Portal Manajemen Sekolah</div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex min-h-16 items-center justify-between border-b border-[#d4d8df] bg-white px-4 sm:px-7">
            <div><p className="text-[11px] font-medium text-[#706f70]">Akademik Sekolah / Guru</p><p className="mt-1 text-sm font-semibold text-[#353536]">{navigation.find((item) => item.href === pathname)?.label ?? "Portal Guru"}</p></div>
            <div className="flex items-center gap-3"><div className="hidden text-right leading-tight sm:block"><p className="text-xs font-semibold">{user?.name ?? "Guru"}</p><p className="mt-1 text-[10px] text-[#706f70]">Pengajar</p></div><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebedf1] text-xs font-bold text-[#353536]">{initials}</div><span className="h-7 border-l border-[#d4d8df]" /><button type="button" onClick={handleLogout} aria-label="Keluar" title="Keluar" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#706f70] hover:bg-[#ebedf1] hover:text-[#080808]"><LogOut size={17} /></button></div>
          </header>

          <div className="px-4 py-6 sm:px-7 sm:py-8 lg:px-9">{children}</div>
        </div>
      </div>
    </main>
  );
}