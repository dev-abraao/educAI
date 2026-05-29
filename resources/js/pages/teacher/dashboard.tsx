import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { DashboardShell } from '../../components/auth/DashboardShell';
import { Paginator  } from '../../components/Paginator';
import type {PaginatedData} from '../../components/Paginator';


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
  quizzes: PaginatedData<TeacherQuiz>;
};

type QuizFormOption = {
  text: string;
  is_correct: boolean;
};

type QuizFormQuestion = {
  text: string;
  points: number | '';
  options: QuizFormOption[];
};

type QuizFormData = {
  class_id: number | '';
  title: string;
  description: string;
  opens_at: string;
  closes_at: string;
  duration_minutes: number | '';
  shuffle: boolean;
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
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiNumQuestions, setAiNumQuestions] = useState<number | ''>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const closeModal = () => {
    setIsOpen(false);
    setGenerateError(null);
  };
  const { classes, quizzes } = usePage<TeacherDashboardProps>().props;
  const { auth } = usePage().props as any;
  const totalStudents = useMemo(
    () => classes.reduce((sum, classItem) => sum + classItem.students_count, 0),
    [classes],
  );
  const totalQuizzes = quizzes.total ?? quizzes.meta?.total ?? quizzes.data.length;

  const quizForm = useForm<QuizFormData>({
    class_id: classes[0]?.id ?? '',
    title: '',
    description: '',
    opens_at: '',
    closes_at: '',
    duration_minutes: 10,
    shuffle: false,
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

  const handleGenerateWithAi = async () => {
    setGenerateError(null);

    if (aiPrompt.trim().length < 10) {
      setGenerateError('Descreva o quiz com pelo menos 10 caracteres.');

      return;
    }

    const num = typeof aiNumQuestions === 'number' ? aiNumQuestions : 0;

    if (num < 1) {
      setGenerateError('Informe quantas questoes deseja gerar.');

      return;
    }

    const hasManualWork =
      quizForm.data.title.trim() !== '' ||
      quizForm.data.questions.some((question) => question.text.trim() !== '');

    if (
      hasManualWork &&
      !window.confirm(
        'Gerar com IA vai substituir o titulo e as questoes ja preenchidos. Deseja continuar?',
      )
    ) {
      return;
    }

    const csrfToken = document
      .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
      ?.getAttribute('content') ?? '';

    setIsGenerating(true);

    try {
      const response = await fetch('/teacher/quizzes/generate', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({ prompt: aiPrompt, num_questions: num }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (payload && (payload.message as string)) ??
          'Nao foi possivel gerar o quiz. Tente novamente.';
        setGenerateError(message);

        return;
      }

      if (!payload || !Array.isArray(payload.questions)) {
        setGenerateError('A IA retornou um formato inesperado. Tente reformular o prompt.');

        return;
      }

      const generatedQuestions: QuizFormQuestion[] = payload.questions.map((q: {
        text?: string;
        points?: number;
        options?: Array<{ text?: string; is_correct?: boolean }>;
      }) => ({
        text: String(q.text ?? ''),
        points: typeof q.points === 'number' && q.points > 0 ? q.points : 1,
        options: Array.isArray(q.options)
          ? q.options.map((o) => ({
              text: String(o.text ?? ''),
              is_correct: Boolean(o.is_correct),
            }))
          : [],
      }));

      quizForm.setData('title', String(payload.title ?? ''));
      quizForm.setData('description', String(payload.description ?? ''));
      quizForm.setData('questions', generatedQuestions);
    } catch {
      setGenerateError('Falha de rede ao chamar a IA. Verifique sua conexao.');
    } finally {
      setIsGenerating(false);
    }
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
    closeModal();
  };

  const deleteQuiz = (quizId: number) => {
    if (!window.confirm('Deseja deletar este quiz?')) {
      return;
    }

    router.delete(`/teacher/quizzes/${quizId}`, {
      preserveScroll: true,
    });
  };

  const openQuiz = (quizId: number) => {
    router.visit(`/teacher/quizzes/${quizId}`);
  };

  return (
    <DashboardShell>
      <Head title="Dashboard" />
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
            <div className="text-3xl font-bold text-white">{totalQuizzes}</div>
          </div>
        </div>
              <h3 className="text-2xl font-bold text-white mb-4">Quizzes recentes</h3>
          <div className="bg-slate-900/50 rounded-3xl border border-slate-800 shadow-sm p-5 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-indigo-500 text-gray-200 p-3 text-sm cursor-pointer rounded-xl font-medium flex items-center transition-colors shadow-lg shadow-indigo-900/20"
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
                    <th className="px-4 py-3 text-right">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.data.map((quiz) => (
                    <tr
                      key={quiz.id}
                      onClick={() => openQuiz(quiz.id)}
                      className="border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-slate-200">{quiz.title}</td>
                      <td className="px-4 py-3 text-slate-400">
                        {quiz.class ? quiz.class.name : 'Turma removida'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(quiz.opens_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(quiz.closes_at).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteQuiz(quiz.id);
                          }}
                          className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                  {quizzes.data.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                        Nenhum quiz criado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Paginator pagination={quizzes} />
          </div>

        {isOpen && (
          <div className='fixed inset-0 z-50 flex items-start justify-center bg-slate-950/80 backdrop-blur-sm p-4 sm:items-center'>
            <div id="quiz-form" className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900/50 rounded-xl border border-slate-800 shadow-sm p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">Criar novo quiz</h3>
            {classes.length === 0 ? (
              <p className="text-sm text-slate-400">
                Voce precisa de uma turma para criar um quiz.
              </p>
            ) : (
              <>
                <div className="mb-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-sm font-semibold text-indigo-200">Gerar com IA</span>
                    <span className="text-xs text-slate-400">
                      (preenche o formulario abaixo; voce revisa antes de publicar)
                    </span>
                  </div>
                  <textarea
                    value={aiPrompt}
                    onChange={(event) => setAiPrompt(event.target.value)}
                    placeholder="Ex: Guerra do Paraguai, foco em causas e consequencias, nivel ensino medio"
                    rows={3}
                    disabled={isGenerating}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Descreva o tema e o publico. A quantidade de questoes vem do campo abaixo.
                  </p>
                  <div className="mt-3 flex flex-wrap items-end gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300">Quantidade</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={aiNumQuestions}
                        onChange={(event) => {
                          const value = event.target.value;
                          setAiNumQuestions(value === '' ? '' : Number(value));
                        }}
                        disabled={isGenerating}
                        className="mt-1 w-24 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 disabled:opacity-50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateWithAi}
                      disabled={isGenerating}
                      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-70"
                    >
                      {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                    {isGenerating && (
                      <span className="text-xs text-slate-400">
                        Pode levar alguns segundos.
                      </span>
                    )}
                  </div>
                  {generateError && (
                    <p className="mt-2 text-sm text-rose-400">{generateError}</p>
                  )}
                </div>
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
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        quizForm.setData(
                          'duration_minutes',
                          nextValue === '' ? '' : Number(nextValue),
                        );
                      }}
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

                <div className="flex items-center gap-3">
                  <input
                    id="shuffle-quiz"
                    type="checkbox"
                    checked={quizForm.data.shuffle}
                    onChange={(event) => quizForm.setData('shuffle', event.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-500"
                  />
                  <label htmlFor="shuffle-quiz" className="text-sm font-semibold text-slate-200">
                    Embaralhar Questôes e alternativas
                  </label>
                </div>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-white">Questoes</h4>
                      <p className="text-xs text-slate-400">
                        Clique no circulo verde para marcar a alternativa correta.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="rounded-lg border border-indigo-500/40 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/10"
                    >
                      + Adicionar questao
                    </button>
                  </div>

                  {quizForm.data.questions.map((question, questionIndex) => (
                    <div
                      key={questionIndex}
                      className="rounded-2xl border border-slate-800 bg-slate-950/60 p-5"
                    >
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <p className="text-sm font-bold uppercase tracking-wide text-indigo-300">
                          Questao {questionIndex + 1}
                        </p>
                        <button
                          type="button"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-xs font-semibold text-rose-300 hover:text-rose-200"
                        >
                          Remover questao
                        </button>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-[3fr_1fr]">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300">
                            Enunciado
                          </label>
                          <textarea
                            value={question.text}
                            onChange={(event) =>
                              updateQuestion(questionIndex, { text: event.target.value })
                            }
                            placeholder="Escreva o enunciado da questao..."
                            rows={2}
                            className="mt-1 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-300">
                            Pontos
                          </label>
                          <input
                            type="number"
                            min={1}
                            value={question.points}
                            onChange={(event) => {
                              const nextValue = event.target.value;
                              updateQuestion(questionIndex, {
                                points: nextValue === '' ? '' : Number(nextValue),
                              });
                            }}
                            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                            required
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="mb-2 text-xs font-semibold text-slate-300">
                          Alternativas
                        </p>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => {
                            const letter = String.fromCharCode(65 + optionIndex);

                            return (
                              <div
                                key={optionIndex}
                                className={`flex items-center gap-3 rounded-xl border px-3 py-2 transition-colors ${
                                  option.is_correct
                                    ? 'border-emerald-500/60 bg-emerald-500/5'
                                    : 'border-slate-800 bg-slate-950/40'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => setCorrectOption(questionIndex, optionIndex)}
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                                    option.is_correct
                                      ? 'border-emerald-400 bg-emerald-400 text-slate-900'
                                      : 'border-slate-600 text-slate-400 hover:border-emerald-400 hover:text-emerald-300'
                                  }`}
                                  aria-label="Marcar alternativa correta"
                                  title={
                                    option.is_correct
                                      ? 'Alternativa correta'
                                      : 'Clique para marcar como correta'
                                  }
                                >
                                  {letter}
                                </button>
                                <input
                                  value={option.text}
                                  onChange={(event) =>
                                    updateOption(questionIndex, optionIndex, {
                                      text: event.target.value,
                                    })
                                  }
                                  placeholder={`Texto da alternativa ${letter}`}
                                  className="flex-1 rounded-lg bg-transparent px-1 py-1 text-sm text-slate-100 outline-none"
                                  required
                                />
                                {option.is_correct && (
                                  <span className="text-xs font-semibold text-emerald-300">
                                    Correta
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  disabled={question.options.length <= 2}
                                  className="text-xs text-slate-400 hover:text-rose-300 disabled:opacity-30 disabled:hover:text-slate-400"
                                >
                                  Remover
                                </button>
                              </div>
                            );
                          })}
                        </div>
                        <button
                          type="button"
                          onClick={() => addOption(questionIndex)}
                          disabled={question.options.length >= 6}
                          className="mt-2 text-xs font-semibold text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
                        >
                          + Adicionar alternativa
                        </button>
                      </div>
                    </div>
                  ))}
                  {quizForm.errors.questions && (
                    <p className="text-sm text-rose-400">{quizForm.errors.questions}</p>
                  )}
                </div>

                <div className='flex gap-20'>
                  <button onClick={closeModal} className="w-full cursor-pointer rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700/50">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={quizForm.processing}
                    className="w-full cursor-pointer rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-70"
                  >
                    {quizForm.processing ? 'Salvando...' : 'Publicar quiz'}
                  </button>
              </div>
            </form>
              </>
            )}
        </div>
        </div>
          )}
      </div>
    </DashboardShell>
  );
}

export default TeacherDashboard;