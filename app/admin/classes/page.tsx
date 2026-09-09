import Link from "next/link";
import AdminShell from "../AdminShell";

const classes = [
  ["X-TKJ-1", "Budi Santoso, S.Kom", "36", "Lab TKJ-1", "X"],
  ["XI-RPL-2", "Siti Aminah, M.T", "32", "Lab RPL-4", "XI"],
  ["XII-DKV-1", "Andi Wijaya, S.Sn", "34", "Std. DKV-1", "XII"],
  ["XI-PH-1", "Dra. Ratna Sari", "35", "R. PH-1", "XI"],
  ["X-RPL-1", "Agus Pratama, S.T", "36", "Lab RPL-1", "X"],
];

export default function ClassesPage() {
  return (
    <AdminShell active="classes">
      <div className="mb-6 flex items-center justify-between"><h1 className="text-[25px] font-bold">Manage Classes</h1><Link className="rounded-lg bg-[#168446] px-5 py-3 text-[11px] font-semibold text-white hover:bg-[#106d38]" href="/admin/classes/new">＋ Buat Kelas Baru</Link></div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {classes.map(([className, teacher, count, room, grade]) => <article className="min-h-[215px] rounded-lg border border-[#d6d9df] bg-white p-5" key={className}><span className="rounded bg-[#e8eef8] px-2 py-1 text-[9px] font-semibold uppercase text-[#5f6b7e]">Grade {grade}</span><h2 className="mt-3 text-[20px] font-semibold">{className}</h2><p className="mt-4 min-h-[38px] text-[12px] font-semibold leading-tight">👤 &nbsp;{teacher}</p><div className="mt-4 grid grid-cols-2 border-t border-[#e5e7eb] pt-3 text-[10px] text-[#777d86]"><span>STUDENTS<strong className="mt-1 block text-[12px] text-[#30343a]">♟ {count}</strong></span><span>ROOM<strong className="mt-1 block text-[12px] text-[#30343a]">{room}</strong></span></div></article>)}
        <Link className="flex min-h-[215px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#cbd0d7] text-[#858b95] hover:bg-white" href="/admin/classes/new"><span className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0f4] text-2xl">＋</span><span className="text-[12px]">Tambah Kelas Baru</span></Link>
      </div>
    </AdminShell>
  );
}
