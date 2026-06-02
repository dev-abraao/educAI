<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use App\Models\User;
use App\Services\ActivityLogger;
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

    public function store(Request $request, string $code, ActivityLogger $logger): RedirectResponse
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

        $alreadyJoined = $student->classes()
            ->where('classes.id', $class->id)
            ->exists();

        $student->classes()->syncWithoutDetaching([$class->id]);

        if (! $alreadyJoined) {
            $logger->record(
                $student,
                'class.joined',
                "Aluno entrou na turma {$class->name}.",
                $class,
                ['class_id' => $class->id]
            );
        }

        return redirect()->route('student.dashboard')
            ->with('status', 'Você entrou na turma com sucesso.');
    }
}
