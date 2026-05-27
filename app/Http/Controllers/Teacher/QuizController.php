<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Http\Requests\Teacher\GenerateQuizRequest;
use App\Http\Requests\Teacher\StoreQuizRequest;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use App\Services\Llm\LlmException;
use App\Services\Llm\LlmValidationException;
use App\Services\Llm\QuizGeneratorService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class QuizController extends Controller
{
    public function show(Request $request, Quiz $quiz): Response
    {
        /** @var User $teacher */
        $teacher = $request->user();

        if (! $teacher->isTeacher() || $quiz->teacher_id !== $teacher->id) {
            abort(403);
        }

        $quiz->load([
            'schoolClass:id,name,teacher_id',
            'questions' => fn ($query) => $quiz->shuffle ? $query->inRandomOrder() : $query->orderBy('position'),
            'questions.options' => fn ($query) => $quiz->shuffle ? $query->inRandomOrder() : $query->orderBy('position'),
        ]);

        $students = collect();
        if ($quiz->schoolClass) {
            $students = $quiz->schoolClass
                ->students()
                ->orderBy('name')
                ->get(['users.id', 'users.name', 'users.email']);
        }

        $attempts = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->with('student:id,name,email')
            ->get();

        $attemptsByStudent = $attempts->keyBy('student_id');

        $studentRows = $students->map(function (User $student) use ($attemptsByStudent) {
            $attempt = $attemptsByStudent->get($student->id);

            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'attempt' => $attempt
                    ? [
                        'id' => $attempt->id,
                        'started_at' => $attempt->started_at,
                        'submitted_at' => $attempt->submitted_at,
                        'score' => $attempt->score,
                        'max_score' => $attempt->max_score,
                    ]
                    : null,
            ];
        });

        $submittedCount = $attempts->whereNotNull('submitted_at')->count();
        $startedCount = $attempts->count();
        $studentCount = $students->count();

        return Inertia::render('teacher/quiz-show', [
            'quiz' => [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'opens_at' => $quiz->opens_at,
                'closes_at' => $quiz->closes_at,
                'duration_minutes' => $quiz->duration_minutes,
                'shuffle' => (bool) ($quiz->shuffle ?? false),
                'class' => $quiz->schoolClass
                    ? ['id' => $quiz->schoolClass->id, 'name' => $quiz->schoolClass->name]
                    : null,
            ],
            'questions' => $quiz->questions->map(function ($question) {
                return [
                    'id' => $question->id,
                    'text' => $question->question_text,
                    'points' => $question->points,
                    'options' => $question->options->map(function ($option) {
                        return [
                            'id' => $option->id,
                            'text' => $option->option_text,
                            'is_correct' => $option->is_correct,
                        ];
                    }),
                ];
            }),
            'students' => $studentRows,
            'stats' => [
                'students' => $studentCount,
                'started' => $startedCount,
                'submitted' => $submittedCount,
                'not_started' => max(0, $studentCount - $startedCount),
                'pending' => max(0, $studentCount - $submittedCount),
            ],
        ]);
    }

    public function store(StoreQuizRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data, $request): void {
            $quiz = Quiz::create([
                'class_id' => $data['class_id'],
                'teacher_id' => $request->user()?->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'opens_at' => $data['opens_at'],
                'closes_at' => $data['closes_at'],
                'duration_minutes' => $data['duration_minutes'],
                'shuffle' => $data['shuffle'] ?? false,
            ]);

            foreach ($data['questions'] as $index => $questionData) {
                $question = $quiz->questions()->create([
                    'question_text' => $questionData['text'],
                    'position' => $quiz->shuffle ? null : $index + 1,
                    'points' => $questionData['points'] ?? 1,
                ]);

                foreach ($questionData['options'] as $optionIndex => $optionData) {
                    $question->options()->create([
                        'option_text' => $optionData['text'],
                        'is_correct' => (bool) ($optionData['is_correct'] ?? false),
                        'position' => $quiz->shuffle ? null : $optionIndex + 1,
                    ]);
                }
            }
        });

        return back()->with('status', 'Quiz criado com sucesso.');
    }

    public function destroy(Quiz $quiz): RedirectResponse
    {
        $quiz->delete();

        return back()->with('status', 'Quiz excluído com sucesso.');
    }

    public function generate(GenerateQuizRequest $request, QuizGeneratorService $generator): JsonResponse
    {
        $data = $request->validated();

        try {
            $draft = $generator->generate($data['prompt'], (int) $data['num_questions']);
        } catch (LlmValidationException $e) {
            Log::warning('LLM gerou payload inválido', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'A IA retornou um quiz fora do formato esperado. Tente reformular o prompt.',
            ], 422);
        } catch (LlmException $e) {
            Log::error('Falha ao gerar quiz via LLM', ['error' => $e->getMessage()]);

            return response()->json([
                'message' => 'Não foi possível gerar o quiz no momento. Tente novamente em instantes.',
            ], 422);
        }

        return response()->json($draft);
    }
}
