<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AiQuizController extends Controller
{
    public function generate(Request $request): JsonResponse
    {
        $data = $request->validate([
            'topic' => ['required', 'string', 'max:200'],
            'count' => ['required', 'integer', 'min:1', 'max:10'],
            'level' => ['required', 'string', 'in:fundamental,médio,superior'],
        ]);

        $prompt = str_replace(
            [':count', ':topic', ':level'],
            [$data['count'], $data['topic'], $data['level']],
            config('ai.quiz_prompt')
        );

        $response = Http::withToken(config('services.openai.key'))
            ->timeout(30)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o',
                'temperature' => 0.3,
                'messages' => [
                    ['role' => 'user', 'content' => $prompt],
                ],
            ]);

        if ($response->failed()) {
            return response()->json([
                'error' => 'Falha ao comunicar com a IA. Verifique a chave da API.',
            ], 502);
        }

        $content = $response->json('choices.0.message.content');
        $questions = json_decode($content, true);

        if (! isset($questions['questions'])) {
            return response()->json([
                'error' => 'Resposta da IA em formato inesperado.',
            ], 502);
        }

        return response()->json($questions);
    }
}