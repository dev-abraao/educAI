import { Head, Link, router } from '@inertiajs/react';
import { Check, Copy, Users } from 'lucide-react';
import { useState } from 'react';
import { ActivityLogCard, type ActivityLogItem } from '@/components/ActivityLogCard';
import { DashboardShell } from '@/components/auth/DashboardShell';
import { EmptyState } from '@/components/EmptyState';
import { Paginator } from '@/components/Paginator';
import type { PaginatedData } from '@/components/Paginator';
import { DashboardSkeleton } from '@/components/Skeleton';
import { MetricCard, PageContainer, PageHeader, Panel, StatusBadge } from '@/components/ui';
import { useNavigationLoading } from '@/hooks/useNavigationLoading';

type TeacherClass = {
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
  }[];
};

type ClassQuiz = {
  id: number;
  class_id: number;
  title: string;
  opens_at: string;
  closes_at: string;
  duration_minutes: number;
  created_at: string;
};

type TeacherDashboardProps = {
  classes: TeacherClass[];
  activeClassId: number | null;
  quizzes: PaginatedData<ClassQuiz>;
  activityLogs: ActivityLogItem[];
};

function quizStatus(quiz: ClassQuiz) {
  const now = new Date();
  const opensAt = new Date(quiz.opens_at);
  const closesAt = new Date(quiz.closes_at);

  if (now < opensAt) {
    return { label: 'Agendado', variant: 'slate' as const };
  }

  if (now > closesAt) {
    return { label: 'Encerrado', variant: 'rose' as const };
  }

  return { label: 'Aberto', variant: 'emerald' as const };
}

export default function Index({
  classes,
  activeClassId: initialActiveClassId,
  quizzes,
  activityLogs,
}: TeacherDashboardProps) {
  const [activeClassId, setActiveClassId] = useState<number | null>(initialActiveClassId ?? null);
  const [prevInitialActiveClassId, setPrevInitialActiveClassId] = useState(initialActiveClassId);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const navigationLoading = useNavigationLoading();

  if (prevInitialActiveClassId !== initialActiveClassId) {
    setPrevInitialActiveClassId(initialActiveClassId);
    setActiveClassId(initialActiveClassId ?? null);
  }

  const activeClass = classes.find((classItem) => classItem.id === activeClassId) ?? null;
  const totalStudents = classes.reduce((sum, classItem) => sum + classItem.students.length, 0);
  const activeClasses = classes.filter((classItem) => classItem.active).length;
  const totalQuizzes = quizzes.total ?? quizzes.meta?.total ?? quizzes.data.length;

  const copyInviteLink = (classItem: TeacherClass) => {
    const fullUrl = `${window.location.origin}/student/classes/join/${classItem.invite_code}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedId(classItem.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const removeStudent = (classId: number, studentId: number) => {
    if (!window.confirm('Deseja remover este aluno da turma?')) {
      return;
    }

    router.delete(`/teacher/classes/${classId}/students`, {
      data: { student_id: studentId },
      preserveScroll: true,
    });
  };

  const selectClass = (classId: number) => {
    setActiveClassId(classId);
    router.get('/teacher/classes', { class_id: classId }, { preserveState: true, replace: true });
  };

  if (navigationLoading) {
    return (
      <DashboardShell>
        <DashboardSkeleton variant="classes" />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <Head title="Gerenciar Turmas" />
      <PageContainer className="mx-auto w-full max-w-7xl">
        <PageHeader
          title="Gerenciar Turmas"
          description="Acompanhe alunos, convites e quizzes vinculados as suas turmas."
        />

        <div className="grid gap-6 md:grid-cols-4">
          <MetricCard label="Total de turmas" value={classes.length} />
          <MetricCard label="Turmas ativas" value={activeClasses} accent="text-emerald-400" />
          <MetricCard label="Total de alunos" value={totalStudents} accent="text-cyan-300" />
          <MetricCard label="Quizzes da turma" value={activeClass ? totalQuizzes : 0} />
        </div>

        {classes.length === 0 ? (
          <EmptyState
            title="Nenhuma turma vinculada"
            description="Voce ainda nao possui turmas alocadas. Solicite ao administrador o vinculo de uma turma para gerenciar alunos e publicar quizzes."
            icon={<Users className="h-5 w-5" />}
          />
        ) : (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <Panel className="space-y-6">
              <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4">
                {classes.map((classItem) => (
                  <button
                    key={classItem.id}
                    type="button"
                    onClick={() => selectClass(classItem.id)}
                    className={`rounded-full cursor-pointer px-4 py-2 text-sm font-semibold transition-colors ${
                      activeClassId === classItem.id
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {classItem.name}
                  </button>
                ))}
              </div>

              {activeClass && (
                <>
                  <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-xl font-black text-white">{activeClass.name}</h2>
                        <StatusBadge variant={activeClass.active ? 'emerald' : 'slate'}>
                          {activeClass.active ? 'Ativa' : 'Inativa'}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {activeClass.students.length} aluno(s) vinculados • criada em{' '}
                        {new Date(activeClass.created_at).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500">Convite: {activeClass.invite_code}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyInviteLink(activeClass)}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                        copiedId === activeClass.id
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/10'
                      }`}
                    >
                      {copiedId === activeClass.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedId === activeClass.id ? 'Copiado' : 'Copiar convite'}
                    </button>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Alunos</h3>
                      <div className="mt-4 space-y-3">
                        {activeClass.students.length === 0 ? (
                          <EmptyState
                            compact
                            title="Nenhum aluno ativo nesta turma"
                            description="Compartilhe o link de convite para que alunos possam entrar."
                          />
                        ) : (
                          activeClass.students.map((student) => (
                            <div
                              key={student.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
                            >
                              <div>
                                <p className="text-sm font-semibold text-slate-100">{student.name}</p>
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
                    </section>

                    <section>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Quizzes da turma</h3>
                      {quizzes.data.length === 0 ? (
                        <div className="mt-4">
                          <EmptyState
                            compact
                            title="Nenhum quiz criado para esta turma"
                            description="Os quizzes publicados para esta turma aparecerao aqui."
                          />
                        </div>
                      ) : (
                        <div className="mt-4 space-y-2">
                          {quizzes.data.map((quiz) => {
                            const status = quizStatus(quiz);

                            return (
                              <Link
                                key={quiz.id}
                                href={`/teacher/quizzes/${quiz.id}`}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-left transition-colors hover:border-indigo-500/50 hover:bg-slate-900/60"
                              >
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-100">{quiz.title}</p>
                                    <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
                                  </div>
                                  <p className="mt-1 text-xs text-slate-400">Duracao: {quiz.duration_minutes} min</p>
                                </div>
                                <div className="text-xs text-slate-500">
                                  {new Date(quiz.opens_at).toLocaleString('pt-BR')} -{' '}
                                  {new Date(quiz.closes_at).toLocaleString('pt-BR')}
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                      <Paginator pagination={quizzes} />
                    </section>
                  </div>
                </>
              )}
            </Panel>

            <div className="space-y-6">
              <ActivityLogCard logs={activityLogs ?? []} />
              <Panel>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">Acoes rapidas</p>
                <h2 className="mt-2 text-xl font-black text-white">Operacao da turma</h2>
                <div className="mt-5 space-y-3">
                  {activeClass && (
                    <button
                      type="button"
                      onClick={() => copyInviteLink(activeClass)}
                      className="w-full rounded-xl border border-indigo-500/30 px-4 py-3 text-left text-sm font-semibold text-indigo-300 transition-colors hover:bg-indigo-500/10"
                    >
                      Copiar link de convite
                    </button>
                  )}
                  <Link
                    href="/teacher/dashboard"
                    className="block w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-slate-800"
                  >
                    Ir para Quizzes
                  </Link>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </PageContainer>
    </DashboardShell>
  );
}
