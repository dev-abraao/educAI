<?php

namespace App\Services\Llm;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class OpenAIProvider implements LlmProvider
{
    private const ENDPOINT = 'https://api.openai.com/v1/chat/completions';

    /**
     * @return array<string, mixed>
     */
    public function generateQuiz(string $prompt, int $numQuestions, ?UploadedFile $file = null): array
    {
        $apiKey = config('services.llm.openai.key');
        $model = config('services.llm.openai.model');
        $timeout = (int) config('services.llm.timeout', 60);

        if (! is_string($apiKey) || $apiKey === '') {
            throw new LlmException('OPENAI_API_KEY não configurada.');
        }

        try {
            $response = Http::timeout($timeout)
                ->withToken($apiKey)
                ->post(self::ENDPOINT, [
                    'model' => $model,
                    'max_tokens' => 8192,
                    'messages' => [
                        ['role' => 'system', 'content' => QuizSchema::systemPrompt($numQuestions)],
                        ['role' => 'user',   'content' => $prompt],
                    ],
                    'response_format' => [
                        'type' => 'json_schema',
                        'json_schema' => [
                            'name' => 'quiz_draft',
                            'strict' => true,
                            'schema' => QuizSchema::jsonSchema(),
                        ],
                    ],
                ])
                ->throw();
        } catch (ConnectionException $e) {
            throw new LlmException('Falha de conexão com a API da OpenAI.', 0, $e);
        } catch (RequestException $e) {
            throw new LlmException('OpenAI retornou erro: '.$e->getMessage(), 0, $e);
        }

        $content = $response->json('choices.0.message.content');

        if (! is_string($content) || $content === '') {
            throw new LlmException('OpenAI não retornou conteúdo JSON.');
        }

        try {
            $decoded = json_decode($content, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new LlmException('OpenAI retornou JSON inválido: '.$e->getMessage(), 0, $e);
        }

        if (! is_array($decoded)) {
            throw new LlmException('OpenAI retornou payload em formato inesperado.');
        }

        return $decoded;
    }
}
