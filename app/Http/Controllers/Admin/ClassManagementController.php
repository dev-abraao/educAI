<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreClassRequest;
use App\Models\SchoolClass;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Str;

class ClassManagementController extends Controller
{
    public function store(StoreClassRequest $request): RedirectResponse
    {
        $data = $request->validated();

        SchoolClass::create([
            'name' => $data['name'],
            'active' => $data['active'] ?? true,
            'teacher_id' => $data['teacher_id'] ?? null,
            'invite_code' => $this->generateInviteCode(),
        ]);

        return back()->with('status', 'Turma criada com sucesso.');
    }

    public function destroy(SchoolClass $class): RedirectResponse
    {
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
