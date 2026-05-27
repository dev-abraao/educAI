<?php

namespace App\Services\Llm;

interface LlmProvider
{
    /**
     * @return array<string, mixed>
     *
     * @throws LlmException
     */
    public function generateQuiz(string $prompt, int $numQuestions): array;
}
