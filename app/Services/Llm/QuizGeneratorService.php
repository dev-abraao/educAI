<?php

namespace App\Services\Llm;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Validator;

class QuizGeneratorService
{
    public function __construct(private readonly LlmProvider $provider) {}

    /**
     * @return array<string, mixed>
     *
     * @throws LlmException
     * @throws LlmValidationException
     */
    public function generate(string $prompt, int $numQuestions): array
    {
        $payload = $this->provider->generateQuiz($prompt, $numQuestions);

        $normalized = $this->normalize($payload);
        $this->validate($normalized);

        $maxQuestions = (int) config('services.llm.max_questions', 20);
        if (count($normalized['questions']) > $maxQuestions) {
            $normalized['questions'] = array_slice($normalized['questions'], 0, $maxQuestions);
        }

        return $normalized;
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    private function normalize(array $payload): array
    {
        $questions = Arr::get($payload, 'questions', []);
        if (! is_array($questions)) {
            $questions = [];
        }

        $normalizedQuestions = [];
        foreach ($questions as $question) {
            if (! is_array($question)) {
                continue;
            }

            $options = $question['options'] ?? [];
            if (! is_array($options)) {
                $options = [];
            }

            $normalizedOptions = [];
            foreach ($options as $option) {
                if (! is_array($option)) {
                    continue;
                }
                $normalizedOptions[] = [
                    'text' => (string) ($option['text'] ?? ''),
                    'is_correct' => (bool) ($option['is_correct'] ?? false),
                ];
            }

            $normalizedQuestions[] = [
                'text' => (string) ($question['text'] ?? ''),
                'points' => (int) ($question['points'] ?? 1),
                'options' => $normalizedOptions,
            ];
        }

        return [
            'title' => (string) ($payload['title'] ?? ''),
            'description' => isset($payload['description']) ? (string) $payload['description'] : '',
            'questions' => $normalizedQuestions,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function validate(array $payload): void
    {
        $validator = Validator::make($payload, [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.text' => ['required', 'string'],
            'questions.*.points' => ['nullable', 'integer', 'min:1'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            'questions.*.options.*.text' => ['required', 'string'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
        ]);

        $validator->after(function ($v) use ($payload): void {
            foreach (($payload['questions'] ?? []) as $index => $question) {
                $correct = collect($question['options'] ?? [])
                    ->filter(fn ($o) => (bool) ($o['is_correct'] ?? false))
                    ->count();

                if ($correct !== 1) {
                    $v->errors()->add(
                        "questions.{$index}.options",
                        'Cada questao deve ter exatamente uma alternativa correta.'
                    );
                }
            }
        });

        if ($validator->fails()) {
            throw new LlmValidationException(
                'Payload da LLM não passou na validação: '
                .implode(' | ', $validator->errors()->all())
            );
        }
    }
}
