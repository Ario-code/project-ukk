"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

type AdminShellProps = {
  active: "dashboard" | "teachers" | "students" | "classes" | "subjects";
  children: ReactNode;
};

const navigation = [
  ["dashboard", "▦", "Dashboard", "/admin"],
  ["teachers", "♙", "Manage Teachers", "/admin/teachers"],
  ["students", "♟", "Manage Students", "/admin/students"],
  ["classes", "◇", "Manage Classes", "/admin/classes"],
  ["subjects", "▣", "Manage Subjects", "#"],
] as const;

export default function AdminShell({ active, children }: AdminShellProps) {
  const router = useRouter();

  function handleLogout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-[#f8f9fb] text-[#202329]">
      <div className="flex min-h-screen">
        <aside className="flex w-[210px] shrink-0 flex-col bg-[#100b32] text-white">
          <div className="px-[18px] pb-7 pt-7"><p className="text-[17px] font-bold tracking-tight">SMK Citra Negara</p><p className="mt-1 text-[10px] text-[#a5a1bd]">Admin Management</p></div>
          <nav className="space-y-1 text-[12px] font-medium">
            {navigation.map(([key, icon, label, href]) => href === "#" ? <span className="flex items-center gap-3 px-[18px] py-3 text-[#b7b4ca]" key={key}><span className="w-3 text-center text-base">{icon}</span>{label}</span> : <Link className={`flex items-center gap-3 border-l-4 px-[14px] py-3 ${active === key ? "border-white bg-[#2a254b] text-white" : "border-transparent text-[#b7b4ca] hover:bg-[#1c1740]"}`} href={href} key={key}><span className="w-3 text-center text-base">{icon}</span>{label}</Link>)}
          </nav>
          <button className="mt-auto px-[18px] pb-8 text-left text-[12px] font-medium text-[#d4523f] hover:text-red-300" onClick={handleLogout}>↪ &nbsp; LogOut</button>
        </aside>
        <div className="min-w-0 flex-1"><header className="flex h-12 items-center justify-end gap-4 border-b border-[#dfe2e7] bg-white px-6"><span className="text-lg text-[#555a63]">♧</span><span className="h-7 border-l border-[#dfe2e7]" /><div className="text-right leading-tight"><p className="text-[12px] font-bold">Admin User</p><p className="text-[9px] text-[#8b9098]">Admin</p></div><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dce5ee] text-xs font-bold text-[#31445b]">AU</div></header><div className="px-7 py-8 lg:px-[30px]">{children}</div></div>
      </div>
    </main>
  );
}