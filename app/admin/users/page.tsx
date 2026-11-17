"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, Upload, UserRound, X } from "lucide-react";
import AdminShell from "../AdminShell";

type UserRecord = {
  _id: string;
  nama: string;
  email: string;
  role: "admin" | "guru" | "murid" | "kepsek" | "wakakurikulum";
  createdAt?: string;
};

const roleLabels: Record<UserRecord["role"], string> = {
  admin: "Admin",
  guru: "Guru",
  murid: "Murid",
  kepsek: "Kepsek",
  wakakurikulum: "Wakil Kurikulum",
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [userToDelete, setUserToDelete] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [query, setQuery] = useState("");

  async function loadUsers() {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Gagal mengambil data akun");
      setUsers(data.users ?? []);
    } catch (requestError: unknown) {
      setError(requestError instanceof Error ? requestError.message : "Gagal mengambil data akun");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function confirmDelete() {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        setActionError(data.message ?? "Gagal menghapus akun");
        return;
      }
      setUsers((currentUsers) => currentUsers.filter((item) => item._id !== userToDelete._id));
      setUserToDelete(null);
      setActionError("");
    } catch {
      setActionError("Server tidak dapat dihubungi");
    }
  }

  const filteredUsers = users.filter((item) => `${item.nama} ${item.email} ${roleLabels[item.role]}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <AdminShell active="users">
      {userToDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#080808]/45 px-4 backdrop-blur-sm" role="presentation" onClick={() => setUserToDelete(null)}>
          <div className="w-full max-w-md rounded-xl border border-[#d4d8df] bg-white p-6 shadow-2xl sm:p-7" role="dialog" aria-modal="true" aria-labelledby="delete-user-title" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9e8e5] text-[#a34c3d]"><Trash2 size={19} /></span>
              <button className="rounded-md p-1 text-[#706f70] hover:bg-[#ebedf1]" type="button" aria-label="Tutup" onClick={() => { setUserToDelete(null); setActionError(""); }}><X size={18} /></button>
            </div>
            <h2 id="delete-user-title" className="mt-5 text-lg font-bold text-[#353536]">Hapus akun ini?</h2>
            <p className="mt-2 text-sm leading-6 text-[#706f70]">Akun <strong className="font-semibold text-[#706f70]">{userToDelete.nama}</strong> akan dihapus dari sistem. Tindakan ini tidak dapat dibatalkan.</p>
            {actionError && <p className="mt-3 text-sm text-red-700">{actionError}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button className="rounded-lg border border-[#d4d8df] px-4 py-2.5 text-sm font-semibold text-[#706f70] hover:bg-[#ebedf1]" type="button" onClick={() => { setUserToDelete(null); setActionError(""); }}>Batal</button>
              <button className="rounded-lg bg-[#a34539] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#873a31]" type="button" onClick={confirmDelete}>Hapus akun</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#706f70]">Direktori sekolah</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#353536]">Akun pengguna</h1>
          <p className="mt-2 text-sm text-[#706f70]">Kelola akses admin, guru, murid, dan staf sekolah.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="inline-flex items-center gap-2 rounded-lg border border-[#d4d8df] bg-white px-4 py-2.5 text-sm font-semibold text-[#706f70] transition hover:bg-[#ebedf1]" href="/admin/users/import">
            <Upload size={16} /> Impor akun
          </Link>
          <Link className="inline-flex items-center gap-2 rounded-lg bg-[#168446] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#106d38]" href="/admin/users/new">
            <Plus size={16} /> Buat akun
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-[#d4d8df] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d4d8df] px-4 py-4 sm:px-6">
          <div><p className="text-sm font-bold text-[#353536]">Semua akun</p><p className="mt-1 text-xs text-[#706f70]">{users.length} akun terdaftar</p></div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-[#d4d8df] bg-[#ebedf1] px-3 sm:w-72">
            <Search size={16} className="shrink-0 text-[#acadb1]" />
            <input className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#acadb1]" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, email, role" aria-label="Cari akun" />
          </label>
        </div>

        {loading && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Memuat data akun...</p>}
        {error && <p className="px-5 py-12 text-center text-sm text-red-700">{error}</p>}
        {!loading && !error && users.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Belum ada akun. Buat akun pertama untuk mulai mengelola pengguna.</p>}
        {!loading && !error && users.length > 0 && filteredUsers.length === 0 && <p className="px-5 py-12 text-center text-sm text-[#706f70]">Tidak ada akun yang cocok dengan pencarian.</p>}

        {!loading && !error && filteredUsers.length > 0 && (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[720px] text-left">
                <thead className="bg-[#ebedf1] text-[11px] font-semibold uppercase tracking-wide text-[#706f70]"><tr><th className="px-6 py-3">Pengguna</th><th className="px-4 py-3">Peran</th><th className="px-4 py-3">Status</th><th className="px-6 py-3 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y divide-[#d4d8df]">
                  {filteredUsers.map((item) => <tr className="text-sm" key={item._id}>
                    <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><UserRound size={17} /></span><span><strong className="block font-semibold text-[#353536]">{item.nama}</strong><span className="mt-1 block text-xs text-[#706f70]">{item.email}</span></span></div></td>
                    <td className="px-4 py-4"><span className="rounded-md bg-[#ebedf1] px-2.5 py-1.5 text-xs font-medium text-[#353536]">{roleLabels[item.role]}</span></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-xs font-medium text-[#39865a]"><span className="h-1.5 w-1.5 rounded-full bg-[#58a66d]" /> Aktif</span></td>
                    <td className="px-6 py-4"><div className="flex justify-end gap-1"><Link className="rounded-md p-2 text-[#706f70] hover:bg-[#ebedf1] hover:text-[#353536]" href={`/admin/users/new?id=${item._id}`} aria-label={`Edit ${item.nama}`} title="Edit akun"><Pencil size={16} /></Link><button className="rounded-md p-2 text-[#9b5b50] hover:bg-[#f9e8e5]" type="button" aria-label={`Hapus ${item.nama}`} title="Hapus akun" onClick={() => { setActionError(""); setUserToDelete(item); }}><Trash2 size={16} /></button></div></td>
                  </tr>)}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-[#d4d8df] sm:hidden">
              {filteredUsers.map((item) => <article className="flex items-start justify-between gap-3 px-4 py-4" key={item._id}>
                <div className="flex min-w-0 items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ebedf1] text-[#706f70]"><UserRound size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#353536]">{item.nama}</p><p className="mt-1 truncate text-xs text-[#706f70]">{item.email}</p><span className="mt-2 inline-flex rounded-md bg-[#ebedf1] px-2 py-1 text-[11px] font-medium text-[#353536]">{roleLabels[item.role]}</span></div></div>
                <div className="flex shrink-0 gap-1"><Link className="rounded-md p-2 text-[#706f70] hover:bg-[#ebedf1]" href={`/admin/users/new?id=${item._id}`} aria-label={`Edit ${item.nama}`}><Pencil size={16} /></Link><button className="rounded-md p-2 text-[#9b5b50] hover:bg-[#f9e8e5]" type="button" aria-label={`Hapus ${item.nama}`} onClick={() => { setActionError(""); setUserToDelete(item); }}><Trash2 size={16} /></button></div>
              </article>)}
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}
