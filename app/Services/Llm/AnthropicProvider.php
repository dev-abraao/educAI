<?php

namespace App\Services\Llm;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;

class AnthropicProvider implements LlmProvider
{
    private const TOOL_NAME = 'create_quiz';

    private const ENDPOINT = 'https://api.anthropic.com/v1/messages';

    /**
     * @return array<string, mixed>
     */
    public function generateQuiz(string $prompt, int $numQuestions, ?UploadedFile $file = null): array
    {
        $apiKey = config('services.llm.anthropic.key');
        $model = config('services.llm.anthropic.model');
        $timeout = (int) config('services.llm.timeout', 60);

        if (! is_string($apiKey) || $apiKey === '') {
            throw new LlmException('ANTHROPIC_API_KEY não configurada.');
        }

        try {
            $response = Http::timeout($timeout)
                ->withHeaders([
                    'x-api-key' => $apiKey,
                    'anthropic-version' => '2023-06-01',
                    'content-type' => 'application/json',
                ])
                ->post(self::ENDPOINT, [
                    'model' => $model,
                    'max_tokens' => 8192,
                    'system' => QuizSchema::systemPrompt($numQuestions),
                    'tools' => [[
                        'name' => self::TOOL_NAME,
                        'description' => 'Cria um quiz educacional com questões de múltipla escolha.',
                        'input_schema' => QuizSchema::jsonSchema(),
                    ]],
                    'tool_choice' => ['type' => 'tool', 'name' => self::TOOL_NAME],
                    'messages' => [[
                        'role' => 'user',
                        'content' => $prompt,
                    ]],
                ])
                ->throw();
        } catch (ConnectionException $e) {
            throw new LlmException('Falha de conexão com a API da Anthropic.', 0, $e);
        } catch (RequestException $e) {
            throw new LlmException('Anthropic retornou erro: '.$e->getMessage(), 0, $e);
        }

        $content = $response->json('content', []);

        if (! is_array($content)) {
            throw new LlmException('Resposta da Anthropic em formato inesperado.');
        }

        foreach ($content as $block) {
            if (($block['type'] ?? null) === 'tool_use' && ($block['name'] ?? null) === self::TOOL_NAME) {
                $input = $block['input'] ?? null;
                if (is_array($input)) {
                    return $input;
                }
            }
        }

        throw new LlmException('Anthropic não retornou o tool_use esperado.');
    }
}
