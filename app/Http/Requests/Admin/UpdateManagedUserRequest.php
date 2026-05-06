<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateManagedUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isAdmin() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        /** @var User|null $managedUser */
        $managedUser = $this->route('user');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class, 'email')->ignore($managedUser)],
            'role' => ['required', Rule::in([UserRole::TEACHER->value, UserRole::STUDENT->value])],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'class_ids' => ['nullable', 'array'],
            'class_ids.*' => ['integer', Rule::exists('classes', 'id')],
        ];
    }
}
