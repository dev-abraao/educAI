<?php

namespace App\Http\Requests\Teacher;

use Illuminate\Foundation\Http\FormRequest;

class GenerateQuizRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isTeacher() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $max = (int) config('services.llm.max_questions', 20);

        return [
            'prompt' => ['required', 'string', 'min:10', 'max:2000'],
            'num_questions' => ['required', 'integer', 'min:1', 'max:'.$max],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'prompt.required' => 'Descreva o quiz que voce quer gerar.',
            'prompt.min' => 'O prompt esta muito curto, escreva pelo menos 10 caracteres.',
            'prompt.max' => 'O prompt esta muito longo (limite de 2000 caracteres).',
            'num_questions.required' => 'Informe quantas questoes deseja gerar.',
            'num_questions.min' => 'Voce precisa pedir pelo menos 1 questao.',
            'num_questions.max' => 'Numero de questoes acima do limite permitido.',
        ];
    }
}
