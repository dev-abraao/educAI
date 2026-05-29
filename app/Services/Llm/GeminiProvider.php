<?php

namespace App\Services\Llm;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class GeminiProvider implements LlmProvider
{
    private const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent';

    /**
     * @return array<string, mixed>
     */
    public function generateQuiz(string $prompt, int $numQuestions): array
    {
        $apiKey = config('services.llm.gemini.key');
        $model = config('services.llm.gemini.model');
        $timeout = (int) config('services.llm.timeout', 60);

        if (! is_string($apiKey) || $apiKey === '') {
            throw new LlmException('GEMINI_API_KEY não configurada.');
        }

        $url = sprintf(self::ENDPOINT, $model);

        try {
            $response = Http::timeout($timeout)
                ->withHeaders(['x-goog-api-key' => $apiKey])
                ->post($url, [
                    'systemInstruction' => [
                        'parts' => [['text' => QuizSchema::systemPrompt($numQuestions)]],
                    ],
                    'contents' => [[
                        'role' => 'user',
                        'parts' => [['text' => $prompt]],
                    ]],
                    'generationConfig' => [
                        'responseMimeType' => 'application/json',
                        'responseSchema' => self::toGeminiSchema(QuizSchema::jsonSchema()),
                        'maxOutputTokens' => 8192,
                    ],
                ])
                ->throw();
        } catch (ConnectionException $e) {
            throw new LlmException('Falha de conexão com a API do Gemini.', 0, $e);
        } catch (RequestException $e) {
            throw new LlmException('Gemini retornou erro: '.$e->getMessage(), 0, $e);
        }

        $text = $response->json('candidates.0.content.parts.0.text');

        if (! is_string($text) || $text === '') {
            throw new LlmException('Gemini não retornou texto JSON.');
        }

        try {
            $decoded = json_decode($text, true, 512, JSON_THROW_ON_ERROR);
        } catch (\JsonException $e) {
            throw new LlmException('Gemini retornou JSON inválido: '.$e->getMessage(), 0, $e);
        }

        if (! is_array($decoded)) {
            throw new LlmException('Gemini retornou payload em formato inesperado.');
        }

        return $decoded;
    }

    /**
     * @param  array<string, mixed>  $schema
     * @return array<string, mixed>
     */
    private static function toGeminiSchema(array $schema): array
    {
        unset($schema['additionalProperties'], $schema['$schema']);

        if (isset($schema['properties']) && is_array($schema['properties'])) {
            foreach ($schema['properties'] as $key => $sub) {
                if (is_array($sub)) {
                    $schema['properties'][$key] = self::toGeminiSchema($sub);
                }
            }
        }

        if (isset($schema['items']) && is_array($schema['items'])) {
            $schema['items'] = self::toGeminiSchema($schema['items']);
        }

        return $schema;
    }
}
