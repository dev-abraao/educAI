<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /** @var User $student */
        $student = $request->user();
        $now = now();

        $classes = $student->classes()
            ->with(['quizzes' => function ($query) use ($student) {
                $query
                    ->orderBy('opens_at')
                    ->with(['attempts' => function ($attempts) use ($student) {
                        $attempts->where('student_id', $student->id);
                    }]);
            }])
            ->orderBy('name')
            ->get(['classes.id', 'classes.name']);

        $classData = $classes->map(function ($class) use ($now) {
            $quizzes = $class->quizzes->map(function ($quiz) use ($now) {
                $attempt = $quiz->attempts->first();
                $isOpen = $now->between($quiz->opens_at, $quiz->closes_at);

                return [
                    'id' => $quiz->id,
                    'title' => $quiz->title,
                    'opens_at' => $quiz->opens_at,
                    'closes_at' => $quiz->closes_at,
                    'duration_minutes' => $quiz->duration_minutes,
                    'can_start' => $isOpen && $attempt === null,
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

            return [
                'id' => $class->id,
                'name' => $class->name,
                'quizzes' => $quizzes,
            ];
        });

        $classIds = $classes->pluck('id');
        $activityLogs = ActivityLog::query()
            ->with('actor:id,name,role')
            ->where(function ($query) use ($student, $classIds) {
                $query->where('actor_id', $student->id)
                    ->orWhere(function ($subjectQuery) use ($classIds) {
                        $subjectQuery->where('subject_type', SchoolClass::class)
                            ->whereIn('subject_id', $classIds);
                    });
            })
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (ActivityLog $log) => [
                'id' => $log->id,
                'event' => $log->event,
                'description' => $log->description,
                'actor' => $log->actor
                    ? ['id' => $log->actor->id, 'name' => $log->actor->name, 'role' => $log->actor->role->value]
                    : null,
                'created_at' => $log->created_at,
                'metadata' => $log->metadata ?? [],
            ]);

        return Inertia::render('student/dashboard', [
            'classes' => $classData,
            'activityLogs' => $activityLogs,
        ]);
    }
}
