<?php

namespace App\Services\Llm;

class QuizSchema
{
    /**
     * @return array<string, mixed>
     */
    public static function jsonSchema(): array
    {
        return [
            'type' => 'object',
            'additionalProperties' => false,
            'required' => ['title', 'description', 'questions'],
            'properties' => [
                'title' => [
                    'type' => 'string',
                    'description' => 'Título curto e descritivo do quiz, em português.',
                ],
                'description' => [
                    'type' => 'string',
                    'description' => 'Resumo de 1-2 frases explicando o tema do quiz, em português. Pode ser string vazia.',
                ],
                'questions' => [
                    'type' => 'array',
                    'minItems' => 1,
                    'items' => [
                        'type' => 'object',
                        'additionalProperties' => false,
                        'required' => ['text', 'points', 'options'],
                        'properties' => [
                            'text' => [
                                'type' => 'string',
                                'description' => 'Enunciado da questão, em português.',
                            ],
                            'points' => [
                                'type' => 'integer',
                                'minimum' => 1,
                                'description' => 'Pontuação da questão (padrão 1).',
                            ],
                            'options' => [
                                'type' => 'array',
                                'minItems' => 2,
                                'maxItems' => 6,
                                'description' => 'Alternativas da questão. EXATAMENTE UMA deve ter is_correct=true.',
                                'items' => [
                                    'type' => 'object',
                                    'additionalProperties' => false,
                                    'required' => ['text', 'is_correct'],
                                    'properties' => [
                                        'text' => ['type' => 'string'],
                                        'is_correct' => ['type' => 'boolean'],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
        ];
    }

    public static function systemPrompt(int $numQuestions): string
    {
        return <<<PROMPT
Você é um assistente pedagógico que gera quizzes em português brasileiro para professores do ensino fundamental e médio.

Regras obrigatórias:
- Gere EXATAMENTE {$numQuestions} questões.
- Cada questão deve ser de múltipla escolha com 4 alternativas (mínimo 2, máximo 6).
- EXATAMENTE UMA alternativa de cada questão deve ter "is_correct": true. As outras devem ter "is_correct": false. Nunca marque mais de uma como correta, nem deixe sem nenhuma correta.
- Use linguagem clara e adequada ao tema solicitado pelo professor.
- O título deve refletir o tema; a descrição é um resumo curto (pode ser vazia se não houver).
- Não inclua explicações fora do JSON.
PROMPT;
    }
}
