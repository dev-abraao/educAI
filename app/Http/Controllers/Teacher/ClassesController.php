<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\SchoolClass;
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

        return Inertia::render('teacher/index', [
            'classes' => $classes,
            'activeClassId' => $activeClassId,
            'quizzes' => $quizzes,
        ]);
    }

    public function removeStudent(SchoolClass $class, Request $request)
    {
        $validated =  $request->validate([
            'student_id' => ['required', 'exists:users,id'],
        ]);

        $class->students()->detach($validated['student_id']);

        return back()->with('status', 'Aluno removido da turma.');
    }
}
