<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class, 'email')],
            'password' => ['required', 'confirmed', Password::defaults()],
        ];
    }

    /**
     * @return array{name: string, email: string, password: string}
     */
    public function registrationData(): array
    {
        /** @var array{name: string, email: string, password: string} $data */
        $data = $this->safe()->only(['name', 'email', 'password']);

        return $data;
    }
}
