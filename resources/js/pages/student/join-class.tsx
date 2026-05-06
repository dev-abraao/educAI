import { Head, Link, usePage } from '@inertiajs/react';

type JoinClassProps = {
    class: {
        id: number;
        name: string;
        active: boolean;
    };
    alreadyJoined: boolean;
    joinUrl: string;
};

export default function JoinClass() {
    const { class: classInfo, alreadyJoined, joinUrl } = usePage<JoinClassProps>().props;

    return (
        <>
            <Head title="Entrar na turma" />
            <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
                <div className="mx-auto max-w-lg rounded-3xl border border-slate-700 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">Convite de turma</p>
                    <h1 className="mt-3 text-2xl font-black">{classInfo.name}</h1>
                    <p className="mt-2 text-sm text-slate-300">
                        {classInfo.active
                            ? 'Esta turma esta ativa e pronta para receber alunos.'
                            : 'Esta turma esta inativa no momento.'}
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                        {alreadyJoined ? (
                            <Link
                                href="/student/dashboard"
                                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                            >
                                Ir para o painel
                            </Link>
                        ) : (
                            <Link
                                href={joinUrl}
                                method="post"
                                as="button"
                                className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                            >
                                Entrar na turma
                            </Link>
                        )}
                        <Link
                            href="/student/dashboard"
                            className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                        >
                            Voltar
                        </Link>
                    </div>
                </div>
            </main>
        </>
    );
}
