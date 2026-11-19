import StudentShell from "../StudentShell";

export default function StudentGradesPage() {
  return (
    <StudentShell active="grades">
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-[#353536]">Grades</h1>
      <div className="rounded-lg border border-[#d4d8df] bg-white p-6 shadow-sm">
        <div className="grid grid-cols-4 gap-4 text-sm font-semibold text-[#706f70]">
          <span>Subject</span>
          <span>Assessment</span>
          <span>Score</span>
          <span>Status</span>
        </div>
        <div className="mt-6 space-y-4 text-[15px] text-[#1f2a37]">
          <div className="grid grid-cols-4 gap-4 rounded-lg bg-[#ebedf1] px-4 py-3">
            <span>Math</span>
            <span>Quiz</span>
            <span>88</span>
            <span className="text-[#168446]">Passed</span>
          </div>
          <div className="grid grid-cols-4 gap-4 rounded-lg bg-[#ebedf1] px-4 py-3">
            <span>Web Dev</span>
            <span>Project</span>
            <span>91</span>
            <span className="text-[#168446]">Passed</span>
          </div>
          <div className="grid grid-cols-4 gap-4 rounded-lg bg-[#ebedf1] px-4 py-3">
            <span>English</span>
            <span>Oral</span>
            <span>83</span>
            <span className="text-[#168446]">Passed</span>
          </div>
        </div>
      </div>
    </StudentShell>
  );
}
