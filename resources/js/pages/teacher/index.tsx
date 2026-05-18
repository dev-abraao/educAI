import { DashboardShell } from "@/components/auth/DashboardShell";
import { router } from "@inertiajs/react";
import { useState } from "react";

type TeacherDashboardProps = {
    classes: {
        active: boolean;
        created_at: string;
        id: number;
        invite_code: string;
        name: string;
        teacher_id: number;
        updated_at: string;
        students: {
            created_at: string;
            email: string;
            id: number;
            name: string;
            role: string;
            updated_at: string;
        }[]
    }[];
};

export default function index({ classes }: TeacherDashboardProps) {
    const [activeClassId, setActiveClassId] = useState<number | null>(classes[0]?.id ?? null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    const activeClass = classes.find((classItem) => classItem.id === activeClassId) ?? null;

    const copyInviteLink = (classItem: TeacherDashboardProps["classes"][number]) => {
        const fullUrl = `${window.location.origin}/student/classes/join/${classItem.invite_code}`;
        navigator.clipboard.writeText(fullUrl).then(() => {
            setCopiedId(classItem.id);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const removeStudent = (classId: number, studentId: number) => {
        if (!window.confirm("Deseja remover este aluno da turma?")) {
            return;
        }

        router.delete(`/teacher/classes/${classId}/students`, {
            data: { student_id: studentId },
            preserveScroll: true,
        });
    };

    return (
        <DashboardShell>
            <div className="space-y-6 p-6">
                <header>
                    <p className="mt-2 text-slate-400">
                        Aqui você pode criar e gerenciar suas turmas e quizzes.
                    </p>
                </header>

                {classes.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-slate-400">
                        Nenhuma turma encontrada.
                    </div>
                ) : (
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
                            {classes.map((classItem) => (
                                <button
                                    key={classItem.id}
                                    type="button"
                                    onClick={() => setActiveClassId(classItem.id)}
                                    className={`rounded-full cursor-pointer px-4 py-2 text-sm font-semibold transition-colors ${
                                        activeClassId === classItem.id
                                            ? "bg-indigo-500 text-white"
                                            : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                                    }`}
                                >
                                    {classItem.name}
                                </button>
                            ))}
                        </div>

                        {activeClass && (
                            <div className="pt-5">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-white">
                                            {activeClass.name}
                                        </h2>
                                        <p className="text-sm text-slate-400">
                                            {activeClass.students.length} aluno(s) •{" "}
                                            {activeClass.active ? "Turma Ativa" : "Inativa"}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => copyInviteLink(activeClass)}
                                        className={`text-sm flex cursor-pointer items-center transition-colors ${
                                            copiedId === activeClass.id
                                                ? "text-emerald-400"
                                                : "text-indigo-300 hover:text-indigo-200"
                                        }`}
                                    >
                                        {copiedId === activeClass.id ? (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                Copiar link de convite
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {activeClass.students.length === 0 ? (
                                        <p className="text-sm text-slate-400">
                                            Nenhum aluno ativo nesta turma.
                                        </p>
                                    ) : (
                                        activeClass.students.map((student) => (
                                            <div
                                                key={student.id}
                                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-100">
                                                        {student.name}
                                                    </p>
                                                    <p className="text-xs text-slate-400">{student.email}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeStudent(activeClass.id, student.id)}
                                                    className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardShell>
    );
}