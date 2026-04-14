<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreManagedUserRequest;
use App\Http\Requests\Admin\UpdateManagedUserRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        return Inertia::render('admin/dashboard', [
            'users' => $usersQuery
                ->latest()
                ->get(['id', 'name', 'email', 'role', 'created_at']),
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
        User::create($request->validated());

        return back()->with('status', 'User created successfully.');
    }

    public function update(UpdateManagedUserRequest $request, User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            abort(403);
        }

        $data = $request->validated();

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $user->update($data);

        return back()->with('status', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->isAdmin()) {
            abort(403);
        }

        $user->delete();

        return back()->with('status', 'User deleted successfully.');
    }
}
