<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
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
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }
    

    /**
     * @return array{email: string, password: string}
     */
    public function credentials(): array
    {
        return [
            'email' => $this->string('email')->toString(),
            'password' => $this->string('password')->toString(),
        ];
    }
}
