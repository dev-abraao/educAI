<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentClassJoinController extends Controller
{
    public function show(Request $request, string $code): Response
    {
        /** @var User $student */
        $student = $request->user();

        if (! $student->isStudent()) {
            abort(403);
        }

        $class = SchoolClass::query()
            ->where('invite_code', $code)
            ->firstOrFail();

        $alreadyJoined = $student->classes()
            ->where('classes.id', $class->id)
            ->exists();

        return Inertia::render('student/join-class', [
            'class' => [
                'id' => $class->id,
                'name' => $class->name,
                'active' => $class->active,
            ],
            'alreadyJoined' => $alreadyJoined,
            'joinUrl' => route('student.classes.join.store', $code),
        ]);
    }

    public function store(Request $request, string $code): RedirectResponse
    {
        /** @var User $student */
        $student = $request->user();

        if (! $student->isStudent()) {
            abort(403);
        }

        $class = SchoolClass::query()
            ->where('invite_code', $code)
            ->firstOrFail();

        if (! $class->active) {
            abort(403);
        }

        $student->classes()->syncWithoutDetaching([$class->id]);

        return redirect()->route('student.dashboard')
            ->with('status', 'Você entrou na turma com sucesso.');
    }
}
