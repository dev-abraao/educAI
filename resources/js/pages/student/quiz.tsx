import { Head, Link, router, usePage } from '@inertiajs/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Quiz = {
    id: number;
    title: string;
    opens_at: string;
    closes_at: string;
    duration_minutes: number;
};

type Attempt = {
    id: number;
    started_at: string;
    due_at: string;
    submitted_at: string | null;
    score: number | null;
    max_score: number | null;
};

type QuestionOption = {
    id: number;
    text: string;
    is_correct: boolean | null;
};

type Question = {
    id: number;
    text: string;
    points: number;
    options: QuestionOption[];
};

type Answer = {
    question_id: number;
    option_id: number | null;
    is_correct: boolean;
};

type StudentQuizProps = {
    quiz: Quiz;
    attempt: Attempt | null;
    questions: Question[];
    answers: Answer[];
};

export default function StudentQuiz() {
    const { quiz, attempt, questions, answers } = usePage<StudentQuizProps>().props;
    const now = new Date();
    const opensAt = new Date(quiz.opens_at);
    const closesAt = new Date(quiz.closes_at);
    const isOpen = now >= opensAt && now <= closesAt;
    const isSubmitted = Boolean(attempt?.submitted_at);

    const initialSelections = useMemo(() => {
        const selectionMap: Record<number, number | null> = {};
        answers.forEach((answer) => {
            selectionMap[answer.question_id] = answer.option_id;
        });
        return selectionMap;
    }, [answers]);

    const [selections, setSelections] = useState<Record<number, number | null>>(initialSelections);
    const [remainingSeconds, setRemainingSeconds] = useState<number | null>(() => {
        if (!attempt || attempt.submitted_at) {
            return null;
        }
        const dueTime = new Date(attempt.due_at).getTime();
        return Math.max(0, Math.ceil((dueTime - Date.now()) / 1000));
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [autoSubmitted, setAutoSubmitted] = useState(false);

    useEffect(() => {
        setSelections(initialSelections);
    }, [initialSelections]);

    const answerLookup = useMemo(() => {
        const map = new Map<number, Answer>();
        answers.forEach((answer) => map.set(answer.question_id, answer));
        return map;
    }, [answers]);

    const handleSelectOption = (questionId: number, optionId: number) => {
        if (isSubmitted) {
            return;
        }

        setSelections((prev) => ({
            ...prev,
            [questionId]: optionId,
        }));
    };

    const handleSubmit = useCallback((auto = false) => {
        if (!attempt || isSubmitted || isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        const payload = questions.map((question) => ({
            question_id: question.id,
            option_id: selections[question.id] ?? null,
        }));

        router.post(
            `/student/quizzes/${quiz.id}/submit`,
            { answers: payload },
            {
                preserveScroll: true,
                onFinish: () => {
                    setIsSubmitting(false);
                },
            },
        );

        if (auto) {
            setAutoSubmitted(true);
        }
    }, [attempt, isSubmitted, isSubmitting, questions, quiz.id, selections]);

    useEffect(() => {
        if (!attempt || attempt.submitted_at) {
            return;
        }

        const dueTime = new Date(attempt.due_at).getTime();

        const interval = window.setInterval(() => {
            const next = Math.max(0, Math.ceil((dueTime - Date.now()) / 1000));
            setRemainingSeconds(next);

            if (next <= 0 && !autoSubmitted) {
                handleSubmit(true);
                setAutoSubmitted(true);
            }
        }, 1000);

        return () => window.clearInterval(interval);
    }, [attempt, autoSubmitted, handleSubmit]);

    const renderTimer = () => {
        if (remainingSeconds === null) {
            return null;
        }

        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = String(remainingSeconds % 60).padStart(2, '0');

        return (
            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                Tempo restante: {minutes}:{seconds}
            </span>
        );
    };

    return (
        <>
            <Head title={quiz.title} />
            <main className="min-h-screen bg-slate-950 px-4 py-12 text-white sm:px-8">
                <div className="mx-auto max-w-5xl space-y-6">
                    <header className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 shadow-2xl backdrop-blur">
                        <Link
                            href="/student/dashboard"
                            className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300"
                        >
                            Voltar ao painel
                        </Link>
                        <h1 className="mt-3 text-3xl font-black">{quiz.title}</h1>
                        <p className="mt-2 text-sm text-slate-300">
                            Abertura: {opensAt.toLocaleString()} • Fechamento: {closesAt.toLocaleString()}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                                Duracao: {quiz.duration_minutes} min
                            </span>
                            {renderTimer()}
                            {attempt?.submitted_at && attempt.score !== null && attempt.max_score !== null && (
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                                    Pontuacao: {attempt.score}/{attempt.max_score}
                                </span>
                            )}
                        </div>
                    </header>

                    {!attempt && (
                        <div className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6 text-center">
                            {isOpen ? (
                                <Link
                                    href={`/student/quizzes/${quiz.id}/start`}
                                    method="post"
                                    as="button"
                                    className="rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-semibold text-slate-900 hover:bg-amber-400"
                                >
                                    Iniciar quiz
                                </Link>
                            ) : (
                                <p className="text-sm text-slate-400">O quiz ainda nao esta disponivel.</p>
                            )}
                        </div>
                    )}

                    {attempt && (
                        <div className="space-y-4">
                            {questions.map((question, questionIndex) => {
                                const answer = answerLookup.get(question.id);
                                const selectedOptionId = selections[question.id] ?? answer?.option_id ?? null;

                                return (
                                    <div
                                        key={question.id}
                                        className="rounded-3xl border border-slate-700 bg-slate-900/80 p-6"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-semibold text-slate-400">Questao {questionIndex + 1}</p>
                                            <span className="text-xs text-slate-400">{question.points} ponto(s)</span>
                                        </div>
                                        <p className="mt-2 text-lg font-semibold text-slate-100">{question.text}</p>

                                        <div className="mt-4 space-y-2">
                                            {question.options.map((option) => {
                                                const isSelected = selectedOptionId === option.id;
                                                const isCorrect = option.is_correct === true;
                                                const optionClass = isSubmitted
                                                    ? isCorrect
                                                        ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-200'
                                                        : isSelected
                                                          ? 'border-rose-500/60 bg-rose-500/10 text-rose-200'
                                                          : 'border-slate-800 bg-slate-950/60 text-slate-300'
                                                    : isSelected
                                                      ? 'border-amber-500/60 bg-amber-500/10 text-amber-200'
                                                      : 'border-slate-800 bg-slate-950/60 text-slate-300';

                                                return (
                                                    <button
                                                        type="button"
                                                        key={option.id}
                                                        onClick={() => handleSelectOption(question.id, option.id)}
                                                        disabled={isSubmitted}
                                                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${optionClass}`}
                                                    >
                                                        {option.text}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                            {!isSubmitted && (
                                <button
                                    type="button"
                                    onClick={() => handleSubmit(false)}
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-70"
                                >
                                    {isSubmitting ? 'Enviando...' : 'Enviar respostas'}
                                </button>
                            )}

                            {isSubmitted && (
                                <p className="text-center text-sm text-slate-400">
                                    Resultado salvo. Voce pode revisar suas respostas acima.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
