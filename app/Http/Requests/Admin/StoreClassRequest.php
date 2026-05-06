<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreClassRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'active' => ['sometimes', 'boolean'],
            'teacher_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where('role', UserRole::TEACHER->value),
            ],
        ];
    }
}
