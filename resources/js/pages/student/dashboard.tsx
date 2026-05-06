import { Head, Link, usePage } from '@inertiajs/react';

type StudentAttempt = {
    id: number;
    started_at: string;
    submitted_at: string | null;
    score: number | null;
    max_score: number | null;
};

type StudentQuiz = {
    id: number;
    title: string;
    opens_at: string;
    closes_at: string;
    duration_minutes: number;
    can_start: boolean;
    attempt: StudentAttempt | null;
};

type StudentClass = {
    id: number;
    name: string;
    quizzes: StudentQuiz[];
};

type StudentDashboardProps = {
    classes: StudentClass[];
};

export default function StudentDashboard() {
    const { classes } = usePage<StudentDashboardProps>().props;
    const now = new Date();

    return (
        <>
            <Head title="Painel do Aluno" />
            <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
                <div className="mx-auto max-w-6xl space-y-8">
                    <header className="rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Painel do Aluno</p>
                        <h1 className="mt-3 text-3xl font-black">Suas turmas e quizzes</h1>
                        <p className="mt-3 text-slate-300">
                            Aqui voce acompanha os quizzes por turma e o seu progresso.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                            >
                                Sair
                            </Link>
                        </div>
                    </header>

                    <div className="space-y-6">
                        {classes.map((classItem) => (
                            <section
                                key={classItem.id}
                                className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-lg"
                            >
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">{classItem.name}</h2>
                                    <span className="text-xs text-slate-400">
                                        {classItem.quizzes.length} quiz(es)
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    {classItem.quizzes.map((quiz) => {
                                        const opensAt = new Date(quiz.opens_at);
                                        const closesAt = new Date(quiz.closes_at);
                                        const isOpen = now >= opensAt && now <= closesAt;
                                        const attempt = quiz.attempt;
                                        const submitted = Boolean(attempt?.submitted_at);

                                        return (
                                            <div
                                                key={quiz.id}
                                                className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-lg font-semibold text-slate-100">{quiz.title}</p>
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Abertura: {opensAt.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            Fechamento: {closesAt.toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-slate-400">
                                                            Duracao: {quiz.duration_minutes} min
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                            submitted
                                                                ? 'bg-emerald-500/10 text-emerald-300'
                                                                : isOpen
                                                                  ? 'bg-amber-500/10 text-amber-300'
                                                                  : now < opensAt
                                                                    ? 'bg-slate-800 text-slate-400'
                                                                    : 'bg-rose-500/10 text-rose-300'
                                                        }`}
                                                    >
                                                        {submitted
                                                            ? 'Enviado'
                                                            : isOpen
                                                              ? 'Disponivel'
                                                              : now < opensAt
                                                                ? 'Agendado'
                                                                : 'Encerrado'}
                                                    </span>
                                                </div>

                                                {attempt?.submitted_at && attempt.score !== null && attempt.max_score !== null && (
                                                    <p className="mt-3 text-sm text-emerald-300">
                                                        Pontuacao: {attempt.score}/{attempt.max_score}
                                                    </p>
                                                )}

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {submitted && (
                                                        <Link
                                                            href={`/student/quizzes/${quiz.id}`}
                                                            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800"
                                                        >
                                                            Ver resultado
                                                        </Link>
                                                    )}
                                                    {!submitted && attempt && (
                                                        <Link
                                                            href={`/student/quizzes/${quiz.id}`}
                                                            className="rounded-lg border border-amber-500/50 px-3 py-1.5 text-xs font-semibold text-amber-200 hover:bg-amber-500/10"
                                                        >
                                                            Continuar
                                                        </Link>
                                                    )}
                                                    {!attempt && isOpen && (
                                                        <Link
                                                            href={`/student/quizzes/${quiz.id}/start`}
                                                            method="post"
                                                            as="button"
                                                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-slate-900 hover:bg-amber-400"
                                                        >
                                                            Iniciar quiz
                                                        </Link>
                                                    )}
                                                    {!attempt && !isOpen && (
                                                        <span className="text-xs text-slate-500">
                                                            Aguarde o periodo de abertura.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {classItem.quizzes.length === 0 && (
                                        <p className="text-sm text-slate-400">
                                            Nenhum quiz cadastrado para esta turma ainda.
                                        </p>
                                    )}
                                </div>
                            </section>
                        ))}
                        {classes.length === 0 && (
                            <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-8 text-center text-slate-300">
                                Nenhuma turma vinculada. Use o link de convite do professor para entrar.
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}
