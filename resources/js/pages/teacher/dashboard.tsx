import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { DashboardShell } from '../../components/auth/DashboardShell';

type TeacherClass = {
  id: number;
  name: string;
  active: boolean;
  invite_code: string;
  students_count: number;
};

type TeacherQuiz = {
  id: number;
  class_id: number;
  title: string;
  opens_at: string;
  closes_at: string;
  duration_minutes: number;
  created_at: string;
  class: { id: number; name: string } | null;
};

type TeacherDashboardProps = {
  classes: TeacherClass[];
  quizzes: TeacherQuiz[];
};

type QuizFormOption = {
  text: string;
  is_correct: boolean;
};

type QuizFormQuestion = {
  text: string;
  points: number;
  options: QuizFormOption[];
};

type QuizFormData = {
  class_id: number | '';
  title: string;
  description: string;
  opens_at: string;
  closes_at: string;
  duration_minutes: number;
  questions: QuizFormQuestion[];
};

const defaultQuestion: QuizFormQuestion = {
  text: '',
  points: 1,
  options: [
    { text: '', is_correct: true },
    { text: '', is_correct: false },
  ],
};

function TeacherDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  
  const closeModal = () => setIsOpen(false);
  const { classes, quizzes } = usePage<TeacherDashboardProps>().props;
  const { auth } = usePage().props as any;
  const totalStudents = useMemo(
    () => classes.reduce((sum, classItem) => sum + classItem.students_count, 0),
    [classes],
  );

  const quizForm = useForm<QuizFormData>({
    class_id: classes[0]?.id ?? '',
    title: '',
    description: '',
    opens_at: '',
    closes_at: '',
    duration_minutes: 10,
    questions: [{ ...defaultQuestion }],
  });

  const addQuestion = () => {
    quizForm.setData('questions', [...quizForm.data.questions, { ...defaultQuestion }]);
  };

  const removeQuestion = (index: number) => {
    if (quizForm.data.questions.length <= 1) {
      return;
    }

    const next = quizForm.data.questions.filter((_, idx) => idx !== index);
    quizForm.setData('questions', next);
  };

  const updateQuestion = (index: number, updates: Partial<QuizFormQuestion>) => {
    const next = [...quizForm.data.questions];
    next[index] = { ...next[index], ...updates };
    quizForm.setData('questions', next);
  };

  const updateOption = (questionIndex: number, optionIndex: number, updates: Partial<QuizFormOption>) => {
    const next = [...quizForm.data.questions];
    const options = [...next[questionIndex].options];
    options[optionIndex] = { ...options[optionIndex], ...updates };
    next[questionIndex] = { ...next[questionIndex], options };
    quizForm.setData('questions', next);
  };

  const addOption = (questionIndex: number) => {
    const next = [...quizForm.data.questions];
    next[questionIndex] = {
      ...next[questionIndex],
      options: [...next[questionIndex].options, { text: '', is_correct: false }],
    };
    quizForm.setData('questions', next);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const next = [...quizForm.data.questions];

    if (next[questionIndex].options.length <= 2) {
      return;
    }

    const filtered = next[questionIndex].options.filter((_, idx) => idx !== optionIndex);

    if (!filtered.some((option) => option.is_correct)) {
      filtered[0] = { ...filtered[0], is_correct: true };
    }

    next[questionIndex] = {
      ...next[questionIndex],
      options: filtered,
    };
    quizForm.setData('questions', next);
  };

  const setCorrectOption = (questionIndex: number, optionIndex: number) => {
    const next = [...quizForm.data.questions];
    next[questionIndex] = {
      ...next[questionIndex],
      options: next[questionIndex].options.map((option, idx) => ({
        ...option,
        is_correct: idx === optionIndex,
      })),
    };
    quizForm.setData('questions', next);
  };

  const submitQuiz = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    quizForm.post('/teacher/quizzes', {
      preserveScroll: true,
      onSuccess: () => {
        quizForm.reset();
        quizForm.setData('class_id', classes[0]?.id ?? '');
        quizForm.setData('questions', [{ ...defaultQuestion }]);
      },
    });
  };

  return (
    <DashboardShell>
      <div className="space-y-8 p-6 bg-[rgb(2,7,23)] min-h-screen font-sans w-[80%] mx-auto">
        <header className="">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="mt-2 text-3xl font-black text-white">Olá, {auth.user.name}!</h1>
                                <p className="mt-2 text-slate-400">Gerencie suas turmas e realize suas avaliações.</p>
                            </div>
                            
                        </div>
                    </header>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <div className="text-slate-400 text-sm font-medium mb-1">Turmas ativas</div>
            <div className="text-3xl font-bold text-white">
              {classes.filter((classItem) => classItem.active).length}
            </div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <div className="text-slate-400 text-sm font-medium mb-1">Total de alunos</div>
            <div className="text-3xl font-bold text-emerald-400">{totalStudents}</div>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 shadow-sm backdrop-blur-sm">
            <div className="text-slate-400 text-sm font-medium mb-1">Quizzes criados</div>
            <div className="text-3xl font-bold text-white">{quizzes.length}</div>
          </div>
        </div>
              <h3 className="text-2xl font-bold text-white mb-4">Quizzes recentes</h3>
<div className="bg-slate-900/50 rounded-3xl border border-slate-800 shadow-sm p-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-indigo-500 text-gray-200 px-2 py-1 text-sm rounded-xl font-medium flex items-center transition-colors shadow-lg shadow-indigo-900/20"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Criar Novo Quiz
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 uppercase bg-slate-900/80 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Titulo</th>
                    <th className="px-4 py-3">Turma</th>
                    <th className="px-4 py-3">Abertura</th>
                    <th className="px-4 py-3">Fechamento</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr
                      key={quiz.id}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-200">{quiz.title}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {quiz.class ? quiz.class.name : 'Turma removida'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(quiz.opens_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(quiz.closes_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {quizzes.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                        Nenhum quiz criado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        <div>
          <h3 className="text-2xl font-bold text-white mb-4">Suas turmas</h3>
          <div className="bg-slate-900/50 rounded-xl border border-slate-800 shadow-sm p-5 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
        </div>
            <div className="space-y-3">
              {classes.map((classItem) => {
                const invitePath = `/student/classes/join/${classItem.invite_code}`;

                return (
                  <div
                    key={classItem.id}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-100 font-semibold">{classItem.name}</p>
                        <p className="text-xs text-slate-400">
                          {classItem.students_count} aluno(s) •{' '}
                          {classItem.active ? 'Ativa' : 'Inativa'}
                        </p>
                      </div>
                      <Link
                        href={invitePath}
                        className="text-indigo-300 text-sm hover:text-indigo-200"
                      >
                        Link de convite
                      </Link>
                    </div>
                  </div>
                );
              })}
              {classes.length === 0 && (
                <p className="text-sm text-slate-400">
                  Nenhuma turma vinculada. Solicite ao admin o cadastro da turma.
                </p>
              )}
            </div>
          </div>

          
        </div>

        {isOpen && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4'>
          <div id="quiz-form" className="bg-slate-900/50 rounded-xl border border-slate-800 shadow-sm p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">Criar novo quiz</h3>
          {classes.length === 0 ? (
            <p className="text-sm text-slate-400">
              Voce precisa de uma turma para criar um quiz.
            </p>
          ) : (
            <form onSubmit={submitQuiz} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-200">Turma</label>
                  <select
                    value={quizForm.data.class_id}
                    onChange={(event) =>
                      quizForm.setData('class_id', Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100"
                    required
                  >
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                  {quizForm.errors.class_id && (
                    <p className="mt-1 text-sm text-rose-400">{quizForm.errors.class_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">Duracao (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    value={quizForm.data.duration_minutes}
                    onChange={(event) =>
                      quizForm.setData('duration_minutes', Number(event.target.value))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100"
                    required
                  />
                  {quizForm.errors.duration_minutes && (
                    <p className="mt-1 text-sm text-rose-400">
                      {quizForm.errors.duration_minutes}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">Titulo</label>
                  <input
                    value={quizForm.data.title}
                    onChange={(event) => quizForm.setData('title', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100"
                    required
                  />
                  {quizForm.errors.title && (
                    <p className="mt-1 text-sm text-rose-400">{quizForm.errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">Descricao</label>
                  <input
                    value={quizForm.data.description}
                    onChange={(event) => quizForm.setData('description', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">Abertura</label>
                  <input
                    type="datetime-local"
                    value={quizForm.data.opens_at}
                    onChange={(event) => quizForm.setData('opens_at', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100"
                    required
                  />
                  {quizForm.errors.opens_at && (
                    <p className="mt-1 text-sm text-rose-400">{quizForm.errors.opens_at}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200">Fechamento</label>
                  <input
                    type="datetime-local"
                    value={quizForm.data.closes_at}
                    onChange={(event) => quizForm.setData('closes_at', event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-100"
                    required
                  />
                  {quizForm.errors.closes_at && (
                    <p className="mt-1 text-sm text-rose-400">{quizForm.errors.closes_at}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-semibold text-white">Questoes</h4>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="rounded-lg border border-indigo-500/40 px-3 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/10"
                  >
                    Adicionar questao
                  </button>
                </div>

                {quizForm.data.questions.map((question, questionIndex) => (
                  <div
                    key={questionIndex}
                    className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-200">
                        Questao {questionIndex + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeQuestion(questionIndex)}
                        className="text-xs text-rose-300 hover:text-rose-200"
                      >
                        Remover
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr]">
                      <input
                        value={question.text}
                        onChange={(event) =>
                          updateQuestion(questionIndex, { text: event.target.value })
                        }
                        placeholder="Enunciado da questao"
                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                        required
                      />
                      <input
                        type="number"
                        min={1}
                        value={question.points}
                        onChange={(event) =>
                          updateQuestion(questionIndex, {
                            points: Number(event.target.value),
                          })
                        }
                        className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
                        required
                      />
                    </div>

                    <div className="mt-4 space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-800 px-3 py-2"
                        >
                          <button
                            type="button"
                            onClick={() => setCorrectOption(questionIndex, optionIndex)}
                            className={`h-3 w-3 rounded-full border ${
                              option.is_correct
                                ? 'border-emerald-400 bg-emerald-400'
                                : 'border-slate-500'
                            }`}
                            aria-label="Marcar alternativa correta"
                          />
                          <input
                            value={option.text}
                            onChange={(event) =>
                              updateOption(questionIndex, optionIndex, {
                                text: event.target.value,
                              })
                            }
                            placeholder={`Alternativa ${optionIndex + 1}`}
                            className="flex-1 bg-transparent text-sm text-slate-100 outline-none"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="text-xs text-slate-400 hover:text-slate-200"
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(questionIndex)}
                        className="text-xs text-indigo-300 hover:text-indigo-200"
                      >
                        Adicionar alternativa
                      </button>
                    </div>
                  </div>
                ))}
                {quizForm.errors.questions && (
                  <p className="text-sm text-rose-400">{quizForm.errors.questions}</p>
                )}
              </div>

              <div className='flex gap-20'>
                <button
                  type="submit"
                  disabled={quizForm.processing}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
                >
                  {quizForm.processing ? 'Salvando...' : 'Publicar quiz'}
                </button>
                <button onClick={closeModal} className="w-full rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700/50">
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
        </div>
          )}
      </div>
    </DashboardShell>
  );
}

export default TeacherDashboard;