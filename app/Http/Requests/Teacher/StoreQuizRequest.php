<?php

namespace App\Http\Requests\Teacher;

use Carbon\Carbon;
use DateTimeZone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreQuizRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $timezone = $this->input('timezone');

        if (! is_string($timezone) || ! in_array($timezone, DateTimeZone::listIdentifiers(), true)) {
            $timezone = config('app.timezone');
        }

        $dates = [];

        foreach (['opens_at', 'closes_at'] as $field) {
            if ($this->filled($field)) {
                $dates[$field] = Carbon::parse($this->input($field), $timezone)
                    ->timezone(config('app.timezone'))
                    ->toDateTimeString();
            }
        }

        if ($dates !== []) {
            $this->merge($dates);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->isTeacher() ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'class_id' => [
                'required',
                'integer',
                Rule::exists('classes', 'id')->where('teacher_id', $this->user()?->id),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'opens_at' => ['required', 'date'],
            'closes_at' => ['required', 'date', 'after:opens_at'],
            'timezone' => ['nullable', 'timezone'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'shuffle' => ['sometimes', 'boolean'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.text' => ['required', 'string'],
            'questions.*.points' => ['nullable', 'integer', 'min:1'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            'questions.*.options.*.text' => ['required', 'string'],
            'questions.*.options.*.is_correct' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'closes_at.after' => 'A data de fechamento deve ser posterior a data de abertura.',
            'opens_at.required' => 'Informe quando o quiz sera aberto.',
            'closes_at.required' => 'Informe quando o quiz sera fechado.',
            'timezone.timezone' => 'O fuso horario informado nao e valido.',
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $questions = $this->input('questions', []);

            foreach ($questions as $index => $question) {
                $options = $question['options'] ?? [];
                $correctCount = collect($options)
                    ->filter(fn (array $option) => (bool) ($option['is_correct'] ?? false))
                    ->count();

                if ($correctCount !== 1) {
                    $validator->errors()->add(
                        "questions.{$index}.options",
                        'Cada questao deve ter exatamente uma alternativa correta.'
                    );
                }
            }
        });
    }
}
