import { Head, Link, router, usePage } from '@inertiajs/react';
import { Clock, ChevronRight, Lock } from 'lucide-react';
import { DashboardShell } from '../../components/auth/DashboardShell';

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

export default function StudentDashboard({ classes }: StudentDashboardProps) {
    const now = new Date();
    const { auth } = usePage().props as any;

    const handleStartQuiz = (quizId: number) => {
        router.post(`/student/quizzes/${quizId}/start`);
    };

    return (
        <>
            <DashboardShell>
            <Head title="Painel do Aluno" />
            <main className="min-h-screen bg-[rgb(1,10,29)] px-4 py-12 text-slate-200 sm:px-8">
                <div className="mx-20 max-w-4xl space-y-8">
                    <header className="">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">Portal do Aluno</p>
                                <h1 className="mt-2 text-3xl font-black text-white">Olá, {auth.user.name}!</h1>
                                <p className="mt-2 text-slate-400">Gerencie suas turmas e realize suas avaliações.</p>
                            </div>
                            
                        </div>
                    </header>

                    <div className="space-y-12">
                        {classes.map((classItem) => (
                            <section key={classItem.id} className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white tracking-wide">Turma: {classItem.name}</h2>
                                    <span className="text-[10px] font-bold text-blue-400 border border-blue-900/50 bg-blue-950/30 px-3 py-1 rounded-full uppercase">
                                        {classItem.quizzes.length} Atividades
                                    </span>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-5">
                                    {classItem.quizzes.map((quiz) => {
                                        const opensAt = new Date(quiz.opens_at);
                                        const closesAt = new Date(quiz.closes_at);
                                        const isOpen = now >= opensAt && now <= closesAt;
                                        const attempt = quiz.attempt;
                                        const submitted = Boolean(attempt?.submitted_at);

                                        return (
                                            <div 
                                                key={quiz.id} 
                                                className="group p-6 flex flex-col bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-slate-900/60 transition-all duration-300 shadow-lg"
                                            >
                                                <div className="flex justify-between items-start mb-5">
                                                    {submitted ? (
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Concluído</span>
                                                    ) : isOpen ? (
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">Disponível</span>
                                                    ) : now < opensAt ? (
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-slate-800 text-slate-400 border border-slate-700">Agendado</span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20">Expirado</span>
                                                    )}
                                                    
                                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                                        <Clock className="w-3.5 h-3.5" /> {quiz.duration_minutes}m
                                                    </span>
                                                </div>
                                                
                                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{quiz.title}</h3>
                                                
                                                <div className="text-[11px] text-slate-500 space-y-1 mb-8">
                                                    <p className="flex justify-between font-mono"><span>Início:</span> <span className="text-slate-300">{opensAt.toLocaleDateString()} às {opensAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                                                    <p className="flex justify-between font-mono"><span>Limite:</span> <span className="text-slate-300">{closesAt.toLocaleDateString()} às {closesAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></p>
                                                </div>
                                                
                                                <div className="mt-auto">
                                                    {submitted && attempt ? (
                                                        <div className="space-y-3">
                                                            <div className="bg-emerald-950/20 text-emerald-400 p-4 rounded-xl flex items-center justify-between border border-emerald-500/10">
                                                                <span className="text-xs font-bold uppercase tracking-wider opacity-70">Resultado</span>
                                                                <span className="font-black text-xl">{attempt.score}<span className="text-xs opacity-50 ml-1">/ {attempt.max_score}</span></span>
                                                            </div>
                                                            <Link
                                                                href={`/student/quizzes/${quiz.id}`}
                                                                className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-widest"
                                                            >
                                                                Revisar
                                                            </Link>
                                                        </div>
                                                    ) : isOpen ? (
                                                        <button 
                                                            onClick={() => handleStartQuiz(quiz.id)}
                                                            className="w-full group/btn flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-900/20"
                                                        >
                                                            {attempt ? 'CONTINUAR' : 'INICIAR AGORA'}
                                                            <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                                        </button>
                                                    ) : (
                                                        <button disabled className="w-full flex items-center justify-center px-4 py-3 bg-slate-800/50 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed border border-slate-800">
                                                            <Lock className="w-3.5 h-3.5 mr-2" /> 
                                                            {now < opensAt ? 'BLOQUEADO' : 'ENCERRADO'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>
            </main>
            </DashboardShell>
        </>
    );
}