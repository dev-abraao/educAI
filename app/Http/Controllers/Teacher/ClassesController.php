<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Quiz;
use App\Models\SchoolClass;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Inertia\Inertia;

class ClassesController extends Controller
{
    public function index(Request $request)
    {
        $teacherId = auth()->id();
        $classes = SchoolClass::where('teacher_id', $teacherId)
            ->with('students')
            ->orderBy('name')
            ->get();

        $activeClassId = $request->integer('class_id');

        if ($activeClassId !== null && ! $classes->contains('id', $activeClassId)) {
            $activeClassId = null;
        }

        if ($activeClassId === null) {
            $activeClassId = $classes->first()?->id;
        }

        $perPage = 5;
        if ($activeClassId) {
            $quizzes = Quiz::query()
                ->where('teacher_id', $teacherId)
                ->where('class_id', $activeClassId)
                ->orderByDesc('created_at')
                ->paginate($perPage, ['id', 'class_id', 'title', 'opens_at', 'closes_at', 'duration_minutes', 'created_at'])
                ->withQueryString();
        } else {
            $quizzes = new LengthAwarePaginator(
                [],
                0,
                $perPage,
                1,
                ['path' => $request->url(), 'query' => $request->query()]
            );
        }

        $classIds = $classes->pluck('id');
        $quizIds = Quiz::query()
            ->where('teacher_id', $teacherId)
            ->pluck('id');

        $activityLogs = ActivityLog::query()
            ->with('actor:id,name,role')
            ->where(function ($query) use ($teacherId, $classIds, $quizIds) {
                $query->where('actor_id', $teacherId)
                    ->orWhere(function ($subjectQuery) use ($classIds) {
                        $subjectQuery->where('subject_type', SchoolClass::class)
                            ->whereIn('subject_id', $classIds);
                    })
                    ->orWhere(function ($subjectQuery) use ($quizIds) {
                        $subjectQuery->where('subject_type', Quiz::class)
                            ->whereIn('subject_id', $quizIds);
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

        return Inertia::render('teacher/index', [
            'classes' => $classes,
            'activeClassId' => $activeClassId,
            'quizzes' => $quizzes,
            'activityLogs' => $activityLogs,
        ]);
    }

    public function removeStudent(SchoolClass $class, Request $request, ActivityLogger $logger)
    {
        if ($class->teacher_id !== $request->user()?->id) {
            abort(403);
        }

        $validated = $request->validate([
            'student_id' => ['required', 'exists:users,id'],
        ]);

        $class->students()->detach($validated['student_id']);

        $logger->record(
            $request->user(),
            'class.student_removed',
            "Aluno removido da turma {$class->name}.",
            $class,
            ['student_id' => $validated['student_id']]
        );

        return back()->with('status', 'Aluno removido da turma.');
    }
}
