<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizAnswer;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentQuizController extends Controller
{
    public function show(Request $request, Quiz $quiz): Response
    {
        /** @var User $student */
        $student = $request->user();

        $this->ensureStudentAccess($student, $quiz);

        $quiz->load(['questions.options' => function ($query) {
            $query->orderBy('position');
        }]);

        $attempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->first();

        $submitted = $attempt?->submitted_at !== null;

        $questions = $quiz->questions->map(function ($question) use ($submitted) {
            return [
                'id' => $question->id,
                'text' => $question->question_text,
                'points' => $question->points,
                'options' => $question->options->map(function ($option) use ($submitted) {
                    return [
                        'id' => $option->id,
                        'text' => $option->option_text,
                        'is_correct' => $submitted ? $option->is_correct : null,
                    ];
                }),
            ];
        });

        $answers = [];
        if ($submitted && $attempt !== null) {
            $answers = $attempt->answers()
                ->get(['question_id', 'option_id', 'is_correct'])
                ->toArray();
        }

        return Inertia::render('student/quiz', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'opens_at' => $quiz->opens_at,
                'closes_at' => $quiz->closes_at,
                'duration_minutes' => $quiz->duration_minutes,
            ],
            'attempt' => $attempt
                ? [
                    'id' => $attempt->id,
                    'started_at' => $attempt->started_at,
                    'due_at' => $attempt->due_at,
                    'submitted_at' => $attempt->submitted_at,
                    'score' => $attempt->score,
                    'max_score' => $attempt->max_score,
                ]
                : null,
            'questions' => $questions,
            'answers' => $answers,
        ]);
    }

    public function start(Request $request, Quiz $quiz): RedirectResponse
    {
        /** @var User $student */
        $student = $request->user();

        $this->ensureStudentAccess($student, $quiz);

        $now = now();
        if ($now->lt($quiz->opens_at) || $now->gt($quiz->closes_at)) {
            abort(403);
        }

        $attempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->first();

        if ($attempt === null) {
            QuizAttempt::create([
                'quiz_id' => $quiz->id,
                'student_id' => $student->id,
                'started_at' => $now,
                'due_at' => $now->copy()->addMinutes($quiz->duration_minutes),
            ]);
        }

        return redirect()->route('student.quizzes.show', $quiz);
    }

    public function submit(Request $request, Quiz $quiz): RedirectResponse
    {
        /** @var User $student */
        $student = $request->user();

        $this->ensureStudentAccess($student, $quiz);

        $attempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('student_id', $student->id)
            ->firstOrFail();

        if ($attempt->submitted_at !== null) {
            return redirect()->route('student.quizzes.show', $quiz);
        }

        $data = $request->validate([
            'answers' => ['nullable', 'array'],
            'answers.*.question_id' => ['required', 'integer'],
            'answers.*.option_id' => ['nullable', 'integer'],
        ]);

        $quiz->load(['questions.options']);

        $answersByQuestion = collect($data['answers'] ?? [])->keyBy('question_id');
        $score = 0;
        $maxScore = 0;

        foreach ($quiz->questions as $question) {
            $maxScore += $question->points;
            $answerInput = $answersByQuestion->get($question->id, []);
            $selectedOptionId = $answerInput['option_id'] ?? null;

            $option = $question->options->firstWhere('id', $selectedOptionId);
            $isCorrect = $option?->is_correct ?? false;

            QuizAnswer::updateOrCreate(
                ['attempt_id' => $attempt->id, 'question_id' => $question->id],
                ['option_id' => $option?->id, 'is_correct' => $isCorrect]
            );

            if ($isCorrect) {
                $score += $question->points;
            }
        }

        $attempt->update([
            'submitted_at' => now(),
            'score' => $score,
            'max_score' => $maxScore,
        ]);

        return redirect()->route('student.quizzes.show', $quiz)
            ->with('status', 'Quiz submitted successfully.');
    }

    private function ensureStudentAccess(User $student, Quiz $quiz): void
    {
        if (! $student->isStudent()) {
            abort(403);
        }

        $belongsToClass = $student->classes()
            ->where('classes.id', $quiz->class_id)
            ->exists();

        if (! $belongsToClass) {
            abort(403);
        }
    }
}
