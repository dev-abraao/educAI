<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeacherDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        /** @var User $teacher */
        $teacher = $request->user();

        $classes = SchoolClass::query()
            ->where('teacher_id', $teacher->id)
            ->withCount('students')
            ->orderBy('name')
            ->get(['id', 'name', 'active', 'invite_code']);

        $quizzes = Quiz::query()
            ->where('teacher_id', $teacher->id)
            ->with('schoolClass:id,name')
            ->latest()
            ->get(['id', 'class_id', 'title', 'opens_at', 'closes_at', 'duration_minutes', 'created_at'])
            ->map(function (Quiz $quiz) {
                return [
                    'id' => $quiz->id,
                    'class_id' => $quiz->class_id,
                    'title' => $quiz->title,
                    'opens_at' => $quiz->opens_at,
                    'closes_at' => $quiz->closes_at,
                    'duration_minutes' => $quiz->duration_minutes,
                    'created_at' => $quiz->created_at,
                    'class' => $quiz->schoolClass
                        ? ['id' => $quiz->schoolClass->id, 'name' => $quiz->schoolClass->name]
                        : null,
                ];
            });

        return Inertia::render('teacher/dashboard', [
            'classes' => $classes,
            'quizzes' => $quizzes,
        ]);
    }
}
