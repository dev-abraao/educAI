<?php


namespace App\Services\Llm;

use Illuminate\Http\UploadedFile;

interface LlmProvider
{
    /**
     * @return array<string, mixed>
     *
     * @throws LlmException
     */
    public function generateQuiz(string $prompt, int $numQuestions, ?UploadedFile $file = null): array;
}
