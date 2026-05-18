<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClassesController extends Controller
{
    public function index()
    {
        $classes = SchoolClass::where('teacher_id', auth()->id())->with('students')->get();

        return Inertia::render('teacher/index', [
            'classes' => $classes,
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
