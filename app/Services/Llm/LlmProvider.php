<?php

namespace App\Services\Llm;

interface LlmProvider
{
    /**
     * Gera um rascunho de quiz a partir de um prompt livre do professor.
     *
     * Retorno deve seguir o "formato canônico":
     * [
     *     'title'       => string,
     *     'description' => string|null,
     *     'questions'   => [
     *         [
     *             'text'    => string,
     *             'points'  => int,
     *             'options' => [
     *                 ['text' => string, 'is_correct' => bool],
     *                 ...
     *             ],
     *         ],
     *         ...
     *     ],
     * ]
     *
     * @return array<string, mixed>
     *
     * @throws LlmException quando o provedor falha (rede, 5xx, payload ilegível).
     */
    public function generateQuiz(string $prompt, int $numQuestions): array;
}
