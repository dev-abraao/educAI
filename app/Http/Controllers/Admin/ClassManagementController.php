<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClassRequest;
use App\Models\SchoolClass;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ClassManagementController extends Controller
{
    public function store(StoreClassRequest $request, ActivityLogger $logger): RedirectResponse
    {
        $data = $request->validated();

        $class = SchoolClass::create([
            'name' => $data['name'],
            'active' => $data['active'] ?? true,
            'teacher_id' => $data['teacher_id'] ?? null,
            'invite_code' => $this->generateInviteCode(),
        ]);

        $logger->record(
            $request->user(),
            'class.created',
            "Turma {$class->name} criada.",
            $class,
            ['teacher_id' => $class->teacher_id]
        );

        return back()->with('status', 'Turma criada com sucesso.');
    }

    public function destroy(Request $request, SchoolClass $class, ActivityLogger $logger): RedirectResponse
    {
        $logger->record(
            $request->user(),
            'class.deleted',
            "Turma {$class->name} removida.",
            null,
            ['deleted_class_id' => $class->id]
        );

        $class->delete();

        return back()->with('status', 'Turma removida com sucesso.');
    }

    private function generateInviteCode(): string
    {
        do {
            $code = Str::upper(Str::random(8));
        } while (SchoolClass::query()->where('invite_code', $code)->exists());

        return $code;
    }
}
