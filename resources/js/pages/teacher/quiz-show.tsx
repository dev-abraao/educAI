import { Head, Link, usePage } from '@inertiajs/react';
import { EmptyState } from '@/components/EmptyState';
import { DashboardShell } from '../../components/auth/DashboardShell';

type Quiz = {
  id: number;
  title: string;
  description: string | null;
  opens_at: string;
  closes_at: string;
  duration_minutes: number;
  shuffle: boolean;
  class: { id: number; name: string } | null;
};

type QuizOption = {
  id: number;
  text: string;
  is_correct: boolean;
};

type QuizQuestion = {
  id: number;
  text: string;
  points: number;
  options: QuizOption[];
};

type Attempt = {
  id: number;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  max_score: number | null;
};

type StudentRow = {
  id: number;
  name: string;
  email: string;
  attempt: Attempt | null;
};

type Stats = {
  students: number;
  started: number;
  submitted: number;
  not_started: number;
  pending: number;
};

type TeacherQuizShowProps = {
  quiz: Quiz;
  questions: QuizQuestion[];
  students: StudentRow[];
  stats: Stats;
};

export default function TeacherQuizShow() {
  const { quiz, questions, students, stats } = usePage<TeacherQuizShowProps>().props;
  const opensAt = new Date(quiz.opens_at);
  const closesAt = new Date(quiz.closes_at);

  return (
    <DashboardShell>
      <Head title={quiz.title} />
      <main className="min-h-screen bg-[rgb(2,7,23)] px-6 py-10 text-slate-200">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <header className="space-y-3">
            <Link
              href="/teacher/dashboard"
              className="text-2xl font-semibold uppercase tracking-[0.25em] text-indigo-300"
            >
              ←
            </Link>
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black text-white">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-sm text-slate-400">{quiz.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="rounded-full bg-slate-800 px-3 py-1">
                  Turma: {quiz.class?.name ?? 'Turma removida'}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1">
                  Abertura: {opensAt.toLocaleString('pt-BR')}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1">
                  Fechamento: {closesAt.toLocaleString('pt-BR')}
                </span>
                <span className="rounded-full bg-slate-800 px-3 py-1">
                  Duracao: {quiz.duration_minutes} min
                </span>
              </div>
            </div>
          </header>

          <section className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs font-semibold text-slate-400">Alunos</div>
              <div className="text-2xl font-bold text-white">{stats.students}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs font-semibold text-slate-400">Iniciaram</div>
              <div className="text-2xl font-bold text-indigo-300">{stats.started}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs font-semibold text-slate-400">Enviaram</div>
              <div className="text-2xl font-bold text-emerald-300">{stats.submitted}</div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <div className="text-xs font-semibold text-slate-400">Nao iniciaram</div>
              <div className="text-2xl font-bold text-rose-300">{stats.not_started}</div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Tentativas por aluno</h2>
            {students.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  compact
                  title={quiz.class ? 'Nenhum aluno encontrado' : 'Turma nao vinculada'}
                  description={
                    quiz.class
                      ? 'Esta turma ainda nao possui alunos vinculados.'
                      : 'Este quiz nao possui uma turma vinculada para listar alunos.'
                  }
                />
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-400 uppercase border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Aluno</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Inicio</th>
                      <th className="px-4 py-3">Envio</th>
                      <th className="px-4 py-3 text-right">Pontuacao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const attempt = student.attempt;
                      const status = attempt
                        ? attempt.submitted_at
                          ? 'Enviado'
                          : 'Em andamento'
                        : 'Nao iniciou';

                      return (
                        <tr
                          key={student.id}
                          className="border-b border-slate-800 last:border-0"
                        >
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-200">{student.name}</div>
                            <div className="text-xs text-slate-500">{student.email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                status === 'Enviado'
                                  ? 'bg-emerald-500/10 text-emerald-300'
                                  : status === 'Em andamento'
                                    ? 'bg-amber-500/10 text-amber-300'
                                    : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {attempt?.started_at
                              ? new Date(attempt.started_at).toLocaleString('pt-BR')
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {attempt?.submitted_at
                              ? new Date(attempt.submitted_at).toLocaleString('pt-BR')
                              : '-'}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-200">
                            {attempt?.submitted_at && attempt.score !== null && attempt.max_score !== null
                              ? `${attempt.score}/${attempt.max_score}`
                              : '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-6">
            <h2 className="text-xl font-bold text-white">Questoes</h2>
            <div className="mt-4 space-y-4">
              {questions.map((question, index) => (
                <div
                  key={question.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-400">Questao {index + 1}</p>
                    <span className="text-xs text-slate-400">{question.points} ponto(s)</span>
                  </div>
                  <p className="mt-2 text-base font-semibold text-slate-100">{question.text}</p>
                  <div className="mt-3 space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          option.is_correct
                            ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300'
                        }`}
                      >
                        {option.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {questions.length === 0 && (
                <EmptyState
                  compact
                  title="Nenhuma questao cadastrada"
                  description="As questoes deste quiz aparecerao aqui quando existirem."
                />
              )}
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}
