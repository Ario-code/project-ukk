import Link from "next/link";
import { CheckCircle2, UserPlus } from "lucide-react";

export type AccountLinkStatusProps = {
  name: string;
  role: "guru" | "murid";
  accountExists: boolean;
  accountEmail: string | null;
  subject?: string;
  major?: string;
  nis?: string;
  className?: string;
};

export default function AccountLinkStatus({ name, role, accountExists, accountEmail, subject, major, nis, className }: AccountLinkStatusProps) {
  if (!accountExists) {
    const params = new URLSearchParams({ name, role });
    if (subject) params.set("subject", subject);
    if (major) params.set("major", major);
    if (nis) params.set("nis", nis);
    if (className) params.set("className", className);
    return <Link className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#168446] hover:underline" href={`/admin/users/new?${params.toString()}`}><UserPlus size={14} /> Buat akun</Link>;
  }

  return (
    <span className="flex flex-col gap-1">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#39865a]"><CheckCircle2 size={14} /> Akun tersedia</span>
      {accountEmail && <span className="text-[11px] text-[#706f70]">{accountEmail}</span>}
    </span>
  );
}
