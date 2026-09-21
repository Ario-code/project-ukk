import StudentShell from "../StudentShell";

export default function StudentProfilePage() {
  return (
    <StudentShell active="profile">
      <h1 className="mb-8 text-[52px] font-bold tracking-[-1.5px] text-[#1d2430]">Profile</h1>
      <div className="max-w-3xl rounded-[24px] border border-[#dfe3ea] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dfeaf6] text-[24px] font-bold text-[#3c4f73]">AS</div>
          <div>
            <h2 className="text-[30px] font-bold text-[#1d2430]">Alex Student</h2>
            <p className="text-[16px] text-[#5e697b]">12 - PPLG</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl bg-[#f7f9fb] p-4">
            <div className="text-[12px] uppercase text-[#707b89]">Email</div>
            <div className="mt-2 text-[16px] font-semibold text-[#1d2430]">alex@student.smkn1.com</div>
          </div>
          <div className="rounded-xl bg-[#f7f9fb] p-4">
            <div className="text-[12px] uppercase text-[#707b89]">Phone</div>
            <div className="mt-2 text-[16px] font-semibold text-[#1d2430]">+62 812-3456-7890</div>
          </div>
          <div className="rounded-xl bg-[#f7f9fb] p-4">
            <div className="text-[12px] uppercase text-[#707b89]">School</div>
            <div className="mt-2 text-[16px] font-semibold text-[#1d2430]">SMK Link</div>
          </div>
          <div className="rounded-xl bg-[#f7f9fb] p-4">
            <div className="text-[12px] uppercase text-[#707b89]">Status</div>
            <div className="mt-2 text-[16px] font-semibold text-[#1d8a4d]">Active</div>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
