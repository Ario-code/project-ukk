"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();

  function logout() {
    document.cookie = "token=; Max-Age=0; path=/";
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="flex items-center gap-2 rounded-lg border border-[#d4d8df] px-3 py-2 text-sm font-semibold text-[#706f70] transition hover:bg-[#ebedf1] hover:text-[#080808]"
    >
      <LogOut size={16} />
      Keluar
    </button>
  );
}
