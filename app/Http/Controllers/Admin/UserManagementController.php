<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreManagedUserRequest;
use App\Http\Requests\Admin\UpdateManagedUserRequest;
use App\Models\SchoolClass;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $roleFilter = $request->string('role')->toString();

        $usersQuery = User::query()
            ->whereIn('role', [UserRole::TEACHER->value, UserRole::STUDENT->value]);

        if (in_array($roleFilter, [UserRole::TEACHER->value, UserRole::STUDENT->value], true)) {
            $usersQuery->where('role', $roleFilter);
        }

        $users = $usersQuery
            ->with(['classes:id,name', 'classesTaught:id,name'])
            ->latest()
            ->get()
            ->map(function (User $user) {
                $classIds = $user->isTeacher()
                    ? $user->classesTaught->pluck('id')->all()
                    : $user->classes->pluck('id')->all();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'class_ids' => $classIds,
                    'created_at' => $user->created_at,
                ];
            });

        $classes = SchoolClass::query()
            ->with('teacher:id,name')
            ->orderBy('name')
            ->get()
            ->map(function (SchoolClass $class) {
                return [
                    'id' => $class->id,
                    'name' => $class->name,
                    'active' => $class->active,
                    'invite_code' => $class->invite_code,
                    'teacher' => $class->teacher
                        ? ['id' => $class->teacher->id, 'name' => $class->teacher->name]
                        : null,
                    'created_at' => $class->created_at,
                ];
            });

        $teachers = User::query()
            ->where('role', UserRole::TEACHER->value)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('admin/dashboard', [
            'users' => $users,
            'classes' => $classes,
            'teachers' => $teachers,
            'filters' => [
                'role' => $roleFilter,
            ],
            'roles' => [
                UserRole::TEACHER->value,
                UserRole::STUDENT->value,
            ],
        ]);
    }

    public function store(StoreManagedUserRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $classIds = $data['class_ids'] ?? null;
        unset($data['class_ids']);

        $user = User::create($data);

        $this->applyClassAssignments($user, $classIds);

        return back()->with('status', 'Usuário criado com sucesso.');
    }

    public function update(UpdateManagedUserRequest $request, User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            abort(403);
        }

        $previousRole = $user->role;
        $data = $request->validated();
        $classIds = $data['class_ids'] ?? null;
        unset($data['class_ids']);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $user->update($data);

        if ($previousRole !== $user->role) {
            if ($previousRole === UserRole::TEACHER) {
                SchoolClass::query()
                    ->where('teacher_id', $user->id)
                    ->update(['teacher_id' => null]);
            }

            if ($previousRole === UserRole::STUDENT) {
                $user->classes()->sync([]);
            }
        }

        $this->applyClassAssignments($user, $classIds);

        return back()->with('status', 'Usuário atualizado com sucesso.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            abort(403);
        }

        $user->delete();

        return back()->with('status', 'Usuário removido com sucesso.');
    }

    /**
     * @param  array<int, int>|null  $classIds
     */
    private function applyClassAssignments(User $user, ?array $classIds): void
    {
        if ($classIds === null) {
            return;
        }

        if ($user->isTeacher()) {
            $this->ensureTeacherAssignmentsAvailable($user, $classIds);

            if (count($classIds) === 0) {
                SchoolClass::query()
                    ->where('teacher_id', $user->id)
                    ->update(['teacher_id' => null]);
            } else {
                SchoolClass::query()
                    ->where('teacher_id', $user->id)
                    ->whereNotIn('id', $classIds)
                    ->update(['teacher_id' => null]);

                SchoolClass::query()
                    ->whereIn('id', $classIds)
                    ->update(['teacher_id' => $user->id]);
            }

            $user->classes()->sync([]);

            return;
        }

        if ($user->isStudent()) {
            $user->classes()->sync($classIds);
            SchoolClass::query()
                ->where('teacher_id', $user->id)
                ->update(['teacher_id' => null]);
        }
    }

    /**
     * @param  array<int, int>  $classIds
     */
    private function ensureTeacherAssignmentsAvailable(User $user, array $classIds): void
    {
        if (count($classIds) === 0) {
            return;
        }

        $conflicts = SchoolClass::query()
            ->whereIn('id', $classIds)
            ->whereNotNull('teacher_id')
            ->where('teacher_id', '!=', $user->id)
            ->exists();

        if ($conflicts) {
            throw ValidationException::withMessages([
                'class_ids' => 'Uma ou mais turmas ja possuem professor.',
            ]);
        }
    }
}
